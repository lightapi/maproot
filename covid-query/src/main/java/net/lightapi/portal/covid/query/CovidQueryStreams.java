package net.lightapi.portal.covid.query;

import com.networknt.config.Config;
import com.networknt.config.JsonMapper;
import com.networknt.kafka.common.AvroConverter;
import com.networknt.kafka.common.AvroDeserializer;
import com.networknt.kafka.common.EventNotification;
import com.networknt.kafka.streams.KafkaStreamsConfig;
import com.networknt.kafka.streams.LightStreams;
import com.networknt.utility.HashUtil;
import net.lightapi.portal.ByteUtil;
import net.lightapi.portal.covid.*;
import net.lightapi.portal.user.*;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.KafkaStreams;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.streams.Topology;
import org.apache.kafka.streams.processor.*;
import org.apache.kafka.streams.state.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.StandardCharsets;
import java.util.*;

public class CovidQueryStreams implements LightStreams {
    static private final Logger logger = LoggerFactory.getLogger(CovidQueryStreams.class);

    static private Properties streamsProps;
    static final KafkaStreamsConfig config = (KafkaStreamsConfig) Config.getInstance().getJsonObjectConfig(KafkaStreamsConfig.CONFIG_NAME, KafkaStreamsConfig.class);
    static {
        streamsProps = new Properties();
        streamsProps.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, config.getBootstrapServers());
        streamsProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
    }

    private static final String city = "covid-city-store";
    private static final String map = "covid-map-store";
    private static final String entity = "covid-entity-store";

    KafkaStreams covidStreams;

    public CovidQueryStreams() {
        logger.info("CovidQueryStreams is created");
    }

    public ReadOnlyKeyValueStore<String, String> getCityStore() {
        return covidStreams.store(city, QueryableStoreTypes.keyValueStore());
    }

    public ReadOnlyKeyValueStore<String, String> getMapStore() {
        return covidStreams.store(map, QueryableStoreTypes.keyValueStore());
    }

    public ReadOnlyKeyValueStore<String, String> getEntityStore() {
        return covidStreams.store(entity, QueryableStoreTypes.keyValueStore());
    }

    private void startCovidStreams() {

        StoreBuilder<KeyValueStore<String, String>> keyValueCityStoreBuilder =
                Stores.keyValueStoreBuilder(Stores.persistentKeyValueStore(city),
                        Serdes.String(),
                        Serdes.String());

        StoreBuilder<KeyValueStore<String, String>> keyValueMapStoreBuilder =
                Stores.keyValueStoreBuilder(Stores.persistentKeyValueStore(map),
                        Serdes.String(),
                        Serdes.String());

        StoreBuilder<KeyValueStore<String, String>> keyValueEntityStoreBuilder =
                Stores.keyValueStoreBuilder(Stores.persistentKeyValueStore(entity),
                        Serdes.String(),
                        Serdes.String());

        final Topology topology = new Topology();
        topology.addSource("SourceTopicProcessor", "portal-event");
        topology.addProcessor("CovidEventProcessor", CovidEventProcessor::new, "SourceTopicProcessor");
        topology.addStateStore(keyValueCityStoreBuilder, "CovidEventProcessor");
        topology.addStateStore(keyValueMapStoreBuilder, "CovidEventProcessor");
        topology.addStateStore(keyValueEntityStoreBuilder, "CovidEventProcessor");
        topology.addSink("NonceProcessor", "portal-nonce", "CovidEventProcessor");
        topology.addSink("NotificationProcessor", "portal-notification", "CovidEventProcessor");
        streamsProps.put(StreamsConfig.APPLICATION_ID_CONFIG, "covid-query");
        covidStreams = new KafkaStreams(topology, streamsProps);
        if(config.isCleanUp()) {
            covidStreams.cleanUp();
        }
        covidStreams.start();
    }

    public static class CovidEventProcessor extends AbstractProcessor<byte[], byte[]> {

        private ProcessorContext pc;
        private KeyValueStore<String, String> cityStore;
        private KeyValueStore<String, String> mapStore;
        private KeyValueStore<String, String> entityStore;

        public CovidEventProcessor() {
        }

        @Override
        public void init(ProcessorContext pc) {

            this.pc = pc;
            this.cityStore = (KeyValueStore<String, String>) pc.getStateStore(city);
            this.mapStore = (KeyValueStore<String, String>) pc.getStateStore(map);
            this.entityStore = (KeyValueStore<String, String>) pc.getStateStore(entity);

            if(logger.isInfoEnabled()) logger.info("Processor initialized");
        }

        @Override
        public void process(byte[] key, byte[] value) {
            AvroDeserializer deserializer = new AvroDeserializer(true);
            Object object;
            // we need to ignore any message that cannot be deserialized. For example Unknown magic byte!
            try {
                object = deserializer.deserialize((value));
            } catch (Exception e) {
                logger.error("Exception:", e);
                return;
            }
            if(object instanceof CityMapCreatedEvent) {
                CityMapCreatedEvent cityMapCreatedEvent = (CityMapCreatedEvent)object;
                if(logger.isTraceEnabled()) logger.trace("Event = " + cityMapCreatedEvent);
                String email = cityMapCreatedEvent.getEventId().getId();
                long nonce = cityMapCreatedEvent.getEventId().getNonce();

                String country = cityMapCreatedEvent.getCountry();
                String province = cityMapCreatedEvent.getProvince();
                String city = cityMapCreatedEvent.getCity();
                double latitude = cityMapCreatedEvent.getLatitude();
                double longitude = cityMapCreatedEvent.getLongitude();
                int zoom = cityMapCreatedEvent.getZoom();
                long timestamp = cityMapCreatedEvent.getTimestamp();
                String location = country + "|" + province + "|" + city;

                Map<String, Object> cityMap = new HashMap<>();
                cityMap.put("country", country);
                cityMap.put("province", province);
                cityMap.put("city", city);
                cityMap.put("latitude", latitude);
                cityMap.put("longitude", longitude);
                cityMap.put("zoom", zoom);
                cityMap.put("timestamp", timestamp);
                cityMap.put("email", email);
                cityStore.put(location,  JsonMapper.toJson(cityMap));
                pc.forward(email.getBytes(StandardCharsets.UTF_8), ByteUtil.longToBytes(nonce + 1), To.child("NonceProcessor"));
                EventNotification notification = new EventNotification(nonce, true, null, cityMapCreatedEvent);
                pc.forward(email.getBytes(StandardCharsets.UTF_8), notification.toString().getBytes(StandardCharsets.UTF_8), To.child("NotificationProcessor"));
            } else if(object instanceof CityMapUpdatedEvent) {
                CityMapUpdatedEvent cityMapUpdatedEvent = (CityMapUpdatedEvent)object;
                if(logger.isTraceEnabled()) logger.trace("Event = " + cityMapUpdatedEvent);
                String email = cityMapUpdatedEvent.getEventId().getId();
                long nonce = cityMapUpdatedEvent.getEventId().getNonce();

                String country = cityMapUpdatedEvent.getCountry();
                String province = cityMapUpdatedEvent.getProvince();
                String city = cityMapUpdatedEvent.getCity();
                double latitude = cityMapUpdatedEvent.getLatitude();
                double longitude = cityMapUpdatedEvent.getLongitude();
                int zoom = cityMapUpdatedEvent.getZoom();
                String location = country + "|" + province + "|" + city;
                Map<String, Object> cityMap = JsonMapper.string2Map(cityStore.get(location));
                cityMap.put("latitude", latitude);
                cityMap.put("longitude", longitude);
                cityMap.put("zoom", zoom);
                cityStore.put(location, JsonMapper.toJson(cityMap));
                pc.forward(email.getBytes(StandardCharsets.UTF_8), ByteUtil.longToBytes(nonce + 1), To.child("NonceProcessor"));
                EventNotification notification = new EventNotification(nonce, true, null, cityMapUpdatedEvent);
                pc.forward(email.getBytes(StandardCharsets.UTF_8), notification.toString().getBytes(StandardCharsets.UTF_8), To.child("NotificationProcessor"));
            } else if(object instanceof CityMapDeletedEvent) {
                CityMapDeletedEvent cityMapDeletedEvent = (CityMapDeletedEvent)object;
                if(logger.isTraceEnabled()) logger.trace("Event = " + cityMapDeletedEvent);
                String email = cityMapDeletedEvent.getEventId().getId();
                long nonce = cityMapDeletedEvent.getEventId().getNonce();
                String country = cityMapDeletedEvent.getCountry();
                String province = cityMapDeletedEvent.getProvince();
                String city = cityMapDeletedEvent.getCity();
                String location = country + "|" + province + "|" + city;
                cityStore.delete(location);
                pc.forward(email.getBytes(StandardCharsets.UTF_8), ByteUtil.longToBytes(nonce + 1), To.child("NonceProcessor"));
                EventNotification notification = new EventNotification(nonce, true, null, cityMapDeletedEvent);
                pc.forward(email.getBytes(StandardCharsets.UTF_8), notification.toString().getBytes(StandardCharsets.UTF_8), To.child("NotificationProcessor"));
            } else if(object instanceof CovidEntityCreatedEvent) {
                CovidEntityCreatedEvent covidEntityCreatedEvent = (CovidEntityCreatedEvent)object;
                if(logger.isTraceEnabled()) logger.trace("Event = " + covidEntityCreatedEvent);

                String email = covidEntityCreatedEvent.getEventId().getId();
                long nonce = covidEntityCreatedEvent.getEventId().getNonce();
                String location = covidEntityCreatedEvent.getKey();
                String category = covidEntityCreatedEvent.getCategory();
                String subcategory = covidEntityCreatedEvent.getSubcategory();
                double latitude = covidEntityCreatedEvent.getLatitude();
                double longitude = covidEntityCreatedEvent.getLongitude();
                String introduction = covidEntityCreatedEvent.getIntroduction();
                long timestamp = covidEntityCreatedEvent.getTimestamp();

                Map<String, Object> entityMap = new HashMap<>();
                entityMap.put("category", category);
                entityMap.put("subcategory", subcategory);
                entityMap.put("latitude", latitude);
                entityMap.put("longitude", longitude);
                entityMap.put("introduction", introduction);
                entityMap.put("timestamp", timestamp);
                entityMap.put("email", email);
                entityStore.put(location, JsonMapper.toJson(entityMap));

                // TODO populate map store here.


                pc.forward(email.getBytes(StandardCharsets.UTF_8), ByteUtil.longToBytes(nonce + 1), To.child("NonceProcessor"));
                EventNotification notification = new EventNotification(nonce, true, null, covidEntityCreatedEvent);
                pc.forward(email.getBytes(StandardCharsets.UTF_8), notification.toString().getBytes(StandardCharsets.UTF_8), To.child("NotificationProcessor"));
            } else if(object instanceof CovidEntityUpdatedEvent) {
                CovidEntityUpdatedEvent covidEntityUpdatedEvent = (CovidEntityUpdatedEvent)object;
                if(logger.isTraceEnabled()) logger.trace("Event = " + covidEntityUpdatedEvent);
                String email = covidEntityUpdatedEvent.getEventId().getId();
                long nonce = covidEntityUpdatedEvent.getEventId().getNonce();

                String location = covidEntityUpdatedEvent.getKey();
                String category = covidEntityUpdatedEvent.getCategory();
                String subcategory = covidEntityUpdatedEvent.getSubcategory();
                double latitude = covidEntityUpdatedEvent.getLatitude();
                double longitude = covidEntityUpdatedEvent.getLongitude();
                String introduction = covidEntityUpdatedEvent.getIntroduction();
                Map<String, Object> entityMap = JsonMapper.string2Map(entityStore.get(location));
                entityMap.put("category", category);
                entityMap.put("subcategory", subcategory);
                entityMap.put("latitude", latitude);
                entityMap.put("longitude", longitude);
                entityMap.put("introduction", introduction);
                entityMap.put(location, JsonMapper.toJson(entityMap));

                pc.forward(email.getBytes(StandardCharsets.UTF_8), ByteUtil.longToBytes(nonce + 1), To.child("NonceProcessor"));
                EventNotification notification = new EventNotification(nonce, true, null, covidEntityUpdatedEvent);
                pc.forward(email.getBytes(StandardCharsets.UTF_8), notification.toString().getBytes(StandardCharsets.UTF_8), To.child("NotificationProcessor"));
            } else if(object instanceof CovidEntityDeletedEvent) {
                CovidEntityDeletedEvent covidEntityDeletedEvent = (CovidEntityDeletedEvent)object;
                if(logger.isTraceEnabled()) logger.trace("Event = " + covidEntityDeletedEvent);

                String email = covidEntityDeletedEvent.getEventId().getId();
                long nonce = covidEntityDeletedEvent.getEventId().getNonce();
                String location = covidEntityDeletedEvent.getKey();

                entityStore.delete(location);
                pc.forward(email.getBytes(StandardCharsets.UTF_8), ByteUtil.longToBytes(nonce + 1), To.child("NonceProcessor"));
                EventNotification notification = new EventNotification(nonce, true, null, covidEntityDeletedEvent);
                pc.forward(email.getBytes(StandardCharsets.UTF_8), notification.toString().getBytes(StandardCharsets.UTF_8), To.child("NotificationProcessor"));
            } else {
                if(logger.isDebugEnabled()) logger.warn("Unknown Covid Event " + object.getClass().getName());
            }
        }

        @Override
        public void close() {
            if(logger.isInfoEnabled()) logger.info("Closing processor...");
        }
    }
    @Override
    public void start(String ip, int port) {
        if(logger.isDebugEnabled()) logger.debug("CovidStreams is starting...");
        startCovidStreams();
    }

    @Override
    public void close() {
        if(logger.isDebugEnabled()) logger.debug("CovidStreams is closing...");
        covidStreams.close();
    }

}
