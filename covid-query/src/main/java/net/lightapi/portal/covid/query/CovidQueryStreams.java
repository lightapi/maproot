package net.lightapi.portal.covid.query;

import com.networknt.config.Config;
import com.networknt.config.JsonMapper;
import com.networknt.kafka.common.*;
import com.networknt.kafka.streams.LightStreams;
import com.networknt.utility.StringUtils;
import com.networknt.utility.ByteUtil;
import net.lightapi.portal.PortalConfig;
import net.lightapi.portal.covid.*;
import net.lightapi.portal.user.UserDeletedEvent;
import net.lightapi.portal.user.UserUpdatedEvent;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.*;
import org.apache.kafka.streams.errors.StreamsUncaughtExceptionHandler;
import org.apache.kafka.streams.processor.*;
import org.apache.kafka.streams.state.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.StandardCharsets;
import java.util.*;

public class CovidQueryStreams implements LightStreams {
    static private final Logger logger = LoggerFactory.getLogger(CovidQueryStreams.class);
    private static final String APP = "maproot";
    static final KafkaStreamsConfig streamsConfig = (KafkaStreamsConfig) Config.getInstance().getJsonObjectConfig(KafkaStreamsConfig.CONFIG_NAME, KafkaStreamsConfig.class);
    static final PortalConfig portalConfig = (PortalConfig) Config.getInstance().getJsonObjectConfig(PortalConfig.CONFIG_NAME, PortalConfig.class);

    private static final String city = "covid-city-store"; // this is a global store
    private static final String map = "covid-map-store"; // this is a local store
    private static final String entity = "covid-entity-store";  // this is a local store
    private static final String status = "covid-status-store"; // this is a local store
    private static final String website = "covid-website-store"; // this is a local store

    KafkaStreams covidStreams;

    public CovidQueryStreams() {
        logger.info("CovidQueryStreams is created");
    }

    public ReadOnlyKeyValueStore<String, String> getCityStore() {
        QueryableStoreType<ReadOnlyKeyValueStore<String, String>> queryableStoreType = QueryableStoreTypes.keyValueStore();
        StoreQueryParameters<ReadOnlyKeyValueStore<String, String>> sqp = StoreQueryParameters.fromNameAndType(city, queryableStoreType);
        return covidStreams.store(sqp);
    }

    public ReadOnlyKeyValueStore<String, String> getMapStore() {
        QueryableStoreType<ReadOnlyKeyValueStore<String, String>> queryableStoreType = QueryableStoreTypes.keyValueStore();
        StoreQueryParameters<ReadOnlyKeyValueStore<String, String>> sqp = StoreQueryParameters.fromNameAndType(map, queryableStoreType);
        return covidStreams.store(sqp);
    }

    // the key must be key | category | subcategory so that we can find the right partition for the map.
    public KeyQueryMetadata getMapStreamsMetadata(String category) {

        return covidStreams.queryMetadataForKey(map, category, Serdes.String().serializer());
    }

    public ReadOnlyKeyValueStore<String, String> getEntityStore() {
        QueryableStoreType<ReadOnlyKeyValueStore<String, String>> queryableStoreType = QueryableStoreTypes.keyValueStore();
        StoreQueryParameters<ReadOnlyKeyValueStore<String, String>> sqp = StoreQueryParameters.fromNameAndType(entity, queryableStoreType);
        return covidStreams.store(sqp);
    }

    // the key must be email so that we can find the right partition for the status.
    public KeyQueryMetadata getEntityStreamsMetadata(String email) {
        return covidStreams.queryMetadataForKey(entity, email, Serdes.String().serializer());
    }

    public ReadOnlyKeyValueStore<String, String> getStatusStore() {
        QueryableStoreType<ReadOnlyKeyValueStore<String, String>> queryableStoreType = QueryableStoreTypes.keyValueStore();
        StoreQueryParameters<ReadOnlyKeyValueStore<String, String>> sqp = StoreQueryParameters.fromNameAndType(status, queryableStoreType);
        return covidStreams.store(sqp);
    }

    // the key must be email so that we can find the right partition for the status.
    public KeyQueryMetadata getStatusStreamsMetadata(String email) {
        return covidStreams.queryMetadataForKey(status, email, Serdes.String().serializer());
    }

    public ReadOnlyKeyValueStore<String, String> getWebsiteStore() {
        QueryableStoreType<ReadOnlyKeyValueStore<String, String>> queryableStoreType = QueryableStoreTypes.keyValueStore();
        StoreQueryParameters<ReadOnlyKeyValueStore<String, String>> sqp = StoreQueryParameters.fromNameAndType(website, queryableStoreType);
        return covidStreams.store(sqp);
    }

    // the key must be email so that we can find the right partition for the status.
    public KeyQueryMetadata getWebsiteStreamsMetadata(String email) {
        return covidStreams.queryMetadataForKey(status, email, Serdes.String().serializer());
    }

    private void startCovidStreams(String ip, int port) {

        StoreBuilder<KeyValueStore<String, String>> globalCityStoreBuilder =
                Stores.keyValueStoreBuilder(Stores.persistentKeyValueStore(city),
                        Serdes.String(),
                        Serdes.String()).withLoggingDisabled();

        StoreBuilder<KeyValueStore<String, String>> keyValueMapStoreBuilder =
                Stores.keyValueStoreBuilder(Stores.persistentKeyValueStore(map),
                        Serdes.String(),
                        Serdes.String());

        StoreBuilder<KeyValueStore<String, String>> keyValueEntityStoreBuilder =
                Stores.keyValueStoreBuilder(Stores.persistentKeyValueStore(entity),
                        Serdes.String(),
                        Serdes.String());

        StoreBuilder<KeyValueStore<String, String>> keyValueStatusStoreBuilder =
                Stores.keyValueStoreBuilder(Stores.persistentKeyValueStore(status),
                        Serdes.String(),
                        Serdes.String());

        StoreBuilder<KeyValueStore<String, String>> keyValueWebsiteStoreBuilder =
                Stores.keyValueStoreBuilder(Stores.persistentKeyValueStore(website),
                        Serdes.String(),
                        Serdes.String());

        final Topology topology = new Topology();
        topology.addGlobalStore(globalCityStoreBuilder, "from-portal-city",  Serdes.String().deserializer(), Serdes.String().deserializer(), "portal-city", "global-city-processor", GlobalCityProcessor::new);
        topology.addSource("SourceTopicProcessor", "portal-event");
        topology.addProcessor("CovidEventProcessor", CovidEventProcessor::new, "SourceTopicProcessor");
        topology.addStateStore(keyValueMapStoreBuilder, "CovidEventProcessor");
        topology.addStateStore(keyValueEntityStoreBuilder, "CovidEventProcessor");
        topology.addStateStore(keyValueStatusStoreBuilder, "CovidEventProcessor");
        topology.addStateStore(keyValueWebsiteStoreBuilder, "CovidEventProcessor");
        topology.addSink("NonceProcessor", "portal-nonce", "CovidEventProcessor");
        topology.addSink("NotificationProcessor", "portal-notification", "CovidEventProcessor");
        topology.addSink("CityProcessor", "portal-city", "CovidEventProcessor");
        topology.addSink("EventProcessor", "portal-event", "CovidEventProcessor");

        Properties streamsProps = new Properties();
        streamsProps.putAll(streamsConfig.getProperties());
        streamsProps.put(StreamsConfig.APPLICATION_ID_CONFIG, portalConfig.getMaprootApplicationId());
        streamsProps.put(StreamsConfig.APPLICATION_SERVER_CONFIG, ip + ":" + port);
        covidStreams = new KafkaStreams(topology, streamsProps);
        covidStreams.setUncaughtExceptionHandler(ex -> {
            logger.error("Kafka-Streams uncaught exception occurred. Stream will be replaced with new thread", ex);
            return StreamsUncaughtExceptionHandler.StreamThreadExceptionResponse.REPLACE_THREAD;
        });
        if(streamsConfig.isCleanUp()) {
            covidStreams.cleanUp();
        }
        covidStreams.start();
    }

    public static class GlobalCityProcessor extends AbstractProcessor<String, String> {
        private KeyValueStore<String, String> globalCityStore;

        public GlobalCityProcessor() {

        }

        @Override
        @SuppressWarnings("unchecked")
        public void init(ProcessorContext context) {
            globalCityStore = (KeyValueStore<String, String>) context.getStateStore(city);
        }

        @Override
        public void process(String key, String value) {
            globalCityStore.put(key, value);
        }

        @Override
        public void close() {
            globalCityStore = null;
        }
    }

    public static class CovidEventProcessor extends AbstractProcessor<byte[], byte[]> {

        private ProcessorContext pc;
        private KeyValueStore<String, String> cityStore;
        private KeyValueStore<String, String> mapStore;
        private KeyValueStore<String, String> entityStore;
        private KeyValueStore<String, String> statusStore;
        private KeyValueStore<String, String> websiteStore;

        public CovidEventProcessor() {
        }

        @Override
        public void init(ProcessorContext pc) {

            this.pc = pc;
            this.cityStore = (KeyValueStore<String, String>) pc.getStateStore(city);
            this.mapStore = (KeyValueStore<String, String>) pc.getStateStore(map);
            this.entityStore = (KeyValueStore<String, String>) pc.getStateStore(entity);
            this.statusStore = (KeyValueStore<String, String>) pc.getStateStore(status);
            this.websiteStore = (KeyValueStore<String, String>) pc.getStateStore(website);

            if(logger.isInfoEnabled()) logger.info("Processor initialized");
        }

        @Override
        public void process(byte[] key, byte[] value) {
            AvroDeserializer deserializer = new AvroDeserializer(true);
            AvroSerializer serializer = new AvroSerializer();
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
                pc.forward(location.getBytes(StandardCharsets.UTF_8), JsonMapper.toJson(cityMap).getBytes(StandardCharsets.UTF_8), To.child("CityProcessor"));
                pc.forward(email.getBytes(StandardCharsets.UTF_8), ByteUtil.longToBytes(nonce + 1), To.child("NonceProcessor"));
                EventNotification notification = new EventNotification(nonce, APP, cityMapCreatedEvent.getClass().getSimpleName(), true, null, cityMapCreatedEvent);
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
                pc.forward(location.getBytes(StandardCharsets.UTF_8), JsonMapper.toJson(cityMap).getBytes(StandardCharsets.UTF_8), To.child("CityProcessor"));
                pc.forward(email.getBytes(StandardCharsets.UTF_8), ByteUtil.longToBytes(nonce + 1), To.child("NonceProcessor"));
                EventNotification notification = new EventNotification(nonce, APP, cityMapUpdatedEvent.getClass().getSimpleName(), true, null, cityMapUpdatedEvent);
                pc.forward(email.getBytes(StandardCharsets.UTF_8), notification.toString().getBytes(StandardCharsets.UTF_8), To.child("NotificationProcessor"));
            } else if(object instanceof CityMapDeletedEvent) {
                CityMapDeletedEvent cityMapDeletedEvent = (CityMapDeletedEvent)object;
                if(logger.isTraceEnabled()) logger.trace("Event = " + cityMapDeletedEvent);
                String email = cityMapDeletedEvent.getEventId().getId();
                long nonce = cityMapDeletedEvent.getEventId().getNonce();
                pc.forward(email.getBytes(StandardCharsets.UTF_8), ByteUtil.longToBytes(nonce + 1), To.child("NonceProcessor"));
                EventNotification notification = new EventNotification(nonce, APP, cityMapDeletedEvent.getClass().getSimpleName(), false, "Cannot delete a city in a changelog topic.", cityMapDeletedEvent);
                pc.forward(email.getBytes(StandardCharsets.UTF_8), notification.toString().getBytes(StandardCharsets.UTF_8), To.child("NotificationProcessor"));
            } else if(object instanceof CovidEntityCreatedEvent) {
                CovidEntityCreatedEvent covidEntityCreatedEvent = (CovidEntityCreatedEvent)object;
                if(logger.isTraceEnabled()) logger.trace("Event = " + covidEntityCreatedEvent);
                String email = covidEntityCreatedEvent.getEventId().getId();
                long nonce = covidEntityCreatedEvent.getEventId().getNonce();
                int keyId = covidEntityCreatedEvent.getKeyId();
                String location = covidEntityCreatedEvent.getKey();
                String userId = covidEntityCreatedEvent.getUserId();
                String category = covidEntityCreatedEvent.getCategory();
                String subcategory = covidEntityCreatedEvent.getSubcategory();
                double latitude = covidEntityCreatedEvent.getLatitude();
                double longitude = covidEntityCreatedEvent.getLongitude();
                String introduction = covidEntityCreatedEvent.getIntroduction();
                long timestamp = covidEntityCreatedEvent.getTimestamp();
                String entityId = location + "|" + userId;
                String keyCategory = location + "|" + category;
                String keySubCategory = keyCategory + "|" + subcategory;
                // city must be there as it cannot be deleted in the global store backed with a compact topic portal-city
                String cityString = cityStore.get(location);
                Map<String, Object> point = createPoint(userId, category, subcategory, introduction, longitude, latitude);
                if(keyId == 0) {
                    // email is the key
                    Map<String, Object> entityMap = new HashMap<>();
                    entityMap.put("category", category);
                    entityMap.put("subcategory", subcategory);
                    entityMap.put("latitude", latitude);
                    entityMap.put("longitude", longitude);
                    entityMap.put("introduction", introduction);
                    entityMap.put("timestamp", timestamp);
                    entityMap.put("email", email);
                    entityMap.put("userId", userId);
                    entityStore.put(entityId, JsonMapper.toJson(entityMap));
                    covidEntityCreatedEvent.setKeyId(1);
                    pc.forward(keyCategory.getBytes(StandardCharsets.UTF_8), serializer.serialize(covidEntityCreatedEvent), To.child("EventProcessor"));
                    covidEntityCreatedEvent.setKeyId(2);
                    pc.forward(keySubCategory.getBytes(StandardCharsets.UTF_8), serializer.serialize(covidEntityCreatedEvent), To.child("EventProcessor"));
                } else if(keyId == 1) {
                    // category
                    String catString = mapStore.get(keyCategory);
                    if(catString == null) {
                        // we need to create the entries.
                        Map<String, Object> catMap = new HashMap<>();
                        // the cityString might not be replicated to this node yet. Wait until it is
                        // in the event-importer procedure.
                        while(cityString == null) {
                            try { Thread.sleep(10); } catch (InterruptedException e) {}
                            cityString = cityStore.get(location);
                        }
                        catMap.put("map", JsonMapper.string2Map(cityString));
                        List<Map<String, Object>> points = new ArrayList<>();
                        points.add(point);
                        catMap.put("points", points);
                        mapStore.put(keyCategory, JsonMapper.toJson(catMap));
                    } else {
                        // we need to update the entry to add userId only if it doesn't exist.
                        Map<String, Object> catMap = JsonMapper.string2Map(catString);
                        List<Map<String, Object>> points = (List<Map<String, Object>>)catMap.get("points");
                        // remove the same userId entry to prevent duplication
                        points.removeIf(p -> userId.equals(((Map<String, Object>)p.get("properties")).get("id")));
                        points.add(point);
                        mapStore.put(keyCategory, JsonMapper.toJson(catMap));
                    }
                } else if(keyId == 2) {
                    // subcategory
                    String subString = mapStore.get(keySubCategory);
                    if(subString == null) {
                        Map<String, Object> subMap = new HashMap<>();
                        // the cityString might not be replicated to this node yet. Wait until it is
                        // in the event-importer procedure.
                        while(cityString == null) {
                            try { Thread.sleep(10); } catch (InterruptedException e) {}
                            cityString = cityStore.get(location);
                        }
                        subMap.put("map", JsonMapper.string2Map(cityString));
                        List<Map<String, Object>> points = new ArrayList<>();
                        points.add(point);
                        subMap.put("points", points);
                        mapStore.put(keySubCategory, JsonMapper.toJson(subMap));
                    } else {
                        Map<String, Object> subMap = JsonMapper.string2Map(subString);
                        List<Map<String, Object>> points = (List<Map<String, Object>>)subMap.get("points");
                        points.removeIf(p -> userId.equals(((Map<String, Object>)p.get("properties")).get("id")));
                        points.add(point);
                        mapStore.put(keySubCategory, JsonMapper.toJson(subMap));
                    }
                } else {
                    logger.error("Wrong keyId " + keyId);
                }
                pc.forward(email.getBytes(StandardCharsets.UTF_8), ByteUtil.longToBytes(nonce + 1), To.child("NonceProcessor"));
                EventNotification notification = new EventNotification(nonce, APP, covidEntityCreatedEvent.getClass().getSimpleName(), true, null, covidEntityCreatedEvent);
                pc.forward(email.getBytes(StandardCharsets.UTF_8), notification.toString().getBytes(StandardCharsets.UTF_8), To.child("NotificationProcessor"));
            } else if(object instanceof CovidEntityUpdatedEvent) {
                CovidEntityUpdatedEvent covidEntityUpdatedEvent = (CovidEntityUpdatedEvent)object;
                if(logger.isTraceEnabled()) logger.trace("Event = " + covidEntityUpdatedEvent);
                String email = covidEntityUpdatedEvent.getEventId().getId();
                long nonce = covidEntityUpdatedEvent.getEventId().getNonce();
                String location = covidEntityUpdatedEvent.getKey();
                int keyId = covidEntityUpdatedEvent.getKeyId();
                String userId = covidEntityUpdatedEvent.getUserId();
                String category = covidEntityUpdatedEvent.getCategory();
                String subcategory = covidEntityUpdatedEvent.getSubcategory();
                double latitude = covidEntityUpdatedEvent.getLatitude();
                double longitude = covidEntityUpdatedEvent.getLongitude();
                String introduction = covidEntityUpdatedEvent.getIntroduction();
                String entityId = location + "|" + userId;
                String keyCategory = location + "|" + category;
                String keySubCategory = keyCategory + "|" + subcategory;
                if(keyId == 0) {
                    // update entity store, email is the key
                    Map<String, Object> entityMap = JsonMapper.string2Map(entityStore.get(entityId));
                    // save the old category and old subcategory for comparision.
                    entityMap.put("category", category);
                    entityMap.put("subcategory", subcategory);
                    entityMap.put("latitude", latitude);
                    entityMap.put("longitude", longitude);
                    entityMap.put("introduction", introduction);
                    entityStore.put(entityId, JsonMapper.toJson(entityMap));
                    covidEntityUpdatedEvent.setKeyId(1);
                    covidEntityUpdatedEvent.getEventId().setDerived(true);
                    pc.forward(keyCategory.getBytes(StandardCharsets.UTF_8), serializer.serialize(covidEntityUpdatedEvent), To.child("EventProcessor"));
                    covidEntityUpdatedEvent.setKeyId(2);
                    pc.forward(keySubCategory.getBytes(StandardCharsets.UTF_8), serializer.serialize(covidEntityUpdatedEvent), To.child("EventProcessor"));
                } else if(keyId ==1) {
                    // update category map store. assuming that category and subcategory are read-only
                    Map<String, Object> point = createPoint(userId, category, subcategory, introduction, longitude, latitude);
                    String catString = mapStore.get(keyCategory);
                    if(catString != null) {
                        Map<String, Object> catMap = JsonMapper.string2Map(catString);
                        List<Map<String, Object>> catPoints = (List<Map<String, Object>>)catMap.get("points");
                        catPoints.removeIf(p -> userId.equals(((Map<String, Object>)p.get("properties")).get("id")));
                        catPoints.add(point);
                        mapStore.put(keyCategory, JsonMapper.toJson(catMap));
                    }
                } else if(keyId ==2) {
                    // update subcategory map store. assuming that category and subcategory are read-only
                    Map<String, Object> point = createPoint(userId, category, subcategory, introduction, longitude, latitude);
                    String subString = mapStore.get(keySubCategory);
                    if(subString != null) {
                        Map<String, Object> subMap = JsonMapper.string2Map(subString);
                        List<Map<String, Object>> subPoints = (List<Map<String, Object>>)subMap.get("points");
                        subPoints.removeIf(p -> userId.equals(((Map<String, Object>)p.get("properties")).get("id")));
                        subPoints.add(point);
                        mapStore.put(keySubCategory, JsonMapper.toJson(subMap));
                    }
                } else {
                    logger.error("Wrong keyId " + keyId);
                }
                pc.forward(email.getBytes(StandardCharsets.UTF_8), ByteUtil.longToBytes(nonce + 1), To.child("NonceProcessor"));
                EventNotification notification = new EventNotification(nonce, APP, covidEntityUpdatedEvent.getClass().getSimpleName(), true, null, covidEntityUpdatedEvent);
                pc.forward(email.getBytes(StandardCharsets.UTF_8), notification.toString().getBytes(StandardCharsets.UTF_8), To.child("NotificationProcessor"));
            } else if(object instanceof CovidEntityDeletedEvent) {
                CovidEntityDeletedEvent covidEntityDeletedEvent = (CovidEntityDeletedEvent)object;
                if(logger.isTraceEnabled()) logger.trace("Event = " + covidEntityDeletedEvent);
                String email = covidEntityDeletedEvent.getEventId().getId();
                long nonce = covidEntityDeletedEvent.getEventId().getNonce();
                String location = covidEntityDeletedEvent.getKey();
                int keyId = covidEntityDeletedEvent.getKeyId();
                String userId = covidEntityDeletedEvent.getUserId();
                String entityId = location + "|" + userId;
                if(keyId == 0) {
                    // email is the key
                    String entityString = entityStore.delete(entityId);
                    if(entityString != null) {
                        // delete status if there is one
                        statusStore.delete(email);
                        // delete website if there is one
                        websiteStore.delete(email);

                        Map<String, Object> entityMap = JsonMapper.string2Map(entityString);
                        String category = (String)entityMap.get("category");
                        String subcategory = (String)entityMap.get("subcategory");
                        String keyCategory = location + "|" + category;
                        String keySubCategory = keyCategory + "|" + subcategory;
                        covidEntityDeletedEvent.setKeyId(1);
                        covidEntityDeletedEvent.getEventId().setDerived(true);
                        pc.forward(keyCategory.getBytes(StandardCharsets.UTF_8), serializer.serialize(covidEntityDeletedEvent), To.child("EventProcessor"));
                        covidEntityDeletedEvent.setKeyId(2);
                        pc.forward(keySubCategory.getBytes(StandardCharsets.UTF_8), serializer.serialize(covidEntityDeletedEvent), To.child("EventProcessor"));
                        covidEntityDeletedEvent.setKeyId(3);
                        pc.forward(keySubCategory.getBytes(StandardCharsets.UTF_8), serializer.serialize(covidEntityDeletedEvent), To.child("EventProcessor"));
                    }
                } else if (keyId == 1) {
                    String keyCategory = new String(key, StandardCharsets.UTF_8);
                    // delete the entry from the mapStore.
                    String catString = mapStore.get(keyCategory);
                    if(catString != null) {
                        Map<String, Object> catMap = JsonMapper.string2Map(catString);
                        List<Map<String, Object>> catPoints = (List<Map<String, Object>>)catMap.get("points");
                        catPoints.removeIf(p -> userId.equals(((Map<String, Object>)p.get("properties")).get("id")));
                        mapStore.put(keyCategory, JsonMapper.toJson(catMap));
                    }
                } else if (keyId == 2) {
                    String keySubCategory = new String(key, StandardCharsets.UTF_8);
                    String subString = mapStore.get(keySubCategory);
                    if (subString != null) {
                        Map<String, Object> subMap = JsonMapper.string2Map(subString);
                        List<Map<String, Object>> subPoints = (List<Map<String, Object>>) subMap.get("points");
                        subPoints.removeIf(p -> userId.equals(((Map<String, Object>) p.get("properties")).get("id")));
                        mapStore.put(keySubCategory, JsonMapper.toJson(subMap));
                    }
                } else {
                    logger.error("Wrong keyId " + keyId);
                }
                pc.forward(email.getBytes(StandardCharsets.UTF_8), ByteUtil.longToBytes(nonce + 1), To.child("NonceProcessor"));
                EventNotification notification = new EventNotification(nonce, APP, covidEntityDeletedEvent.getClass().getSimpleName(), true, null, covidEntityDeletedEvent);
                pc.forward(email.getBytes(StandardCharsets.UTF_8), notification.toString().getBytes(StandardCharsets.UTF_8), To.child("NotificationProcessor"));
            } else if(object instanceof CovidStatusUpdatedEvent) {
                CovidStatusUpdatedEvent covidStatusUpdatedEvent = (CovidStatusUpdatedEvent) object;
                if (logger.isTraceEnabled()) logger.trace("Event = " + covidStatusUpdatedEvent);
                String email = covidStatusUpdatedEvent.getEventId().getId();
                long nonce = covidStatusUpdatedEvent.getEventId().getNonce();
                String s = covidStatusUpdatedEvent.getStatus();
                int keyId = covidStatusUpdatedEvent.getKeyId();
                if(keyId == 0) {
                    // key is email
                    statusStore.put(email, s);
                    String location = covidStatusUpdatedEvent.getCountry() + "|" + covidStatusUpdatedEvent.getProvince() + "|" + covidStatusUpdatedEvent.getCity();
                    String userId = covidStatusUpdatedEvent.getUserId();
                    String entityId = location + "|" + userId;
                    String entityString = entityStore.get(entityId);
                    if(entityString != null) {
                        Map<String, Object> entityMap = JsonMapper.string2Map(entityString);
                        String category = (String)entityMap.get("category");
                        String subcategory = (String)entityMap.get("subcategory");
                        String keyCategory = location + "|" + category;
                        String keySubCategory = keyCategory + "|" + subcategory;
                        covidStatusUpdatedEvent.setKeyId(1);
                        covidStatusUpdatedEvent.getEventId().setDerived(true);
                        pc.forward(keyCategory.getBytes(StandardCharsets.UTF_8), serializer.serialize(covidStatusUpdatedEvent), To.child("EventProcessor"));
                        covidStatusUpdatedEvent.setKeyId(2);
                        pc.forward(keySubCategory.getBytes(StandardCharsets.UTF_8), serializer.serialize(covidStatusUpdatedEvent), To.child("EventProcessor"));
                    } else {
                        logger.error("Not found in entityStore for entityId " + entityId);
                    }
                } else if (keyId == 1) {
                    String keyCategory = new String(key, StandardCharsets.UTF_8);
                    String userId = covidStatusUpdatedEvent.getUserId();
                    String catString = mapStore.get(keyCategory);
                    if(catString != null) {
                        Map<String, Object> catMap = JsonMapper.string2Map(catString);
                        List<Map<String, Object>> catPoints = (List<Map<String, Object>>)catMap.get("points");
                        Map<String, Object> point = catPoints.stream()
                                .filter(p -> userId.equals(((Map<String, Object>)p.get("properties")).get("id")))
                                .findFirst()
                                .orElse(null);
                        if(point != null) {
                            Map<String, Object> properties = (Map<String, Object>)point.get("properties");
                            properties.put("hasStatus", true);
                        }
                        mapStore.put(keyCategory, JsonMapper.toJson(catMap));
                    }

                } else if (keyId == 2) {
                    String keySubCategory = new String(key, StandardCharsets.UTF_8);
                    String userId = covidStatusUpdatedEvent.getUserId();
                    String subString = mapStore.get(keySubCategory);
                    if(subString != null) {
                        Map<String, Object> subMap = JsonMapper.string2Map(subString);
                        List<Map<String, Object>> subPoints = (List<Map<String, Object>>)subMap.get("points");
                        Map<String, Object> point = subPoints.stream()
                                .filter(p -> userId.equals(((Map<String, Object>)p.get("properties")).get("id")))
                                .findFirst()
                                .orElse(null);
                        if(point != null) {
                            Map<String, Object> properties = (Map<String, Object>)point.get("properties");
                            properties.put("hasStatus", true);
                        }
                        mapStore.put(keySubCategory, JsonMapper.toJson(subMap));
                    }
                } else {
                    logger.error("Wrong keyId " + keyId);
                }
                pc.forward(email.getBytes(StandardCharsets.UTF_8), ByteUtil.longToBytes(nonce + 1), To.child("NonceProcessor"));
                EventNotification notification = new EventNotification(nonce, APP, covidStatusUpdatedEvent.getClass().getSimpleName(), true, null, covidStatusUpdatedEvent);
                pc.forward(email.getBytes(StandardCharsets.UTF_8), notification.toString().getBytes(StandardCharsets.UTF_8), To.child("NotificationProcessor"));
            } else if(object instanceof CovidStatusDeletedEvent) {
                CovidStatusDeletedEvent covidStatusDeletedEvent = (CovidStatusDeletedEvent) object;
                if (logger.isTraceEnabled()) logger.trace("Event = " + covidStatusDeletedEvent);
                String email = covidStatusDeletedEvent.getEmail();
                long nonce = covidStatusDeletedEvent.getEventId().getNonce();
                statusStore.delete(email);
                // TODO remove the entry in mapStore?
                pc.forward(email.getBytes(StandardCharsets.UTF_8), ByteUtil.longToBytes(nonce + 1), To.child("NonceProcessor"));
                EventNotification notification = new EventNotification(nonce, APP, covidStatusDeletedEvent.getClass().getSimpleName(), true, null, covidStatusDeletedEvent);
                pc.forward(email.getBytes(StandardCharsets.UTF_8), notification.toString().getBytes(StandardCharsets.UTF_8), To.child("NotificationProcessor"));
            } else if(object instanceof CovidWebsiteUpdatedEvent) {
                CovidWebsiteUpdatedEvent covidWebsiteUpdatedEvent = (CovidWebsiteUpdatedEvent) object;
                if (logger.isTraceEnabled()) logger.trace("Event = " + covidWebsiteUpdatedEvent);
                String email = covidWebsiteUpdatedEvent.getEventId().getId();
                long nonce = covidWebsiteUpdatedEvent.getEventId().getNonce();
                int keyId = covidWebsiteUpdatedEvent.getKeyId();
                if(keyId == 0) {
                    String w = covidWebsiteUpdatedEvent.getWebsite();
                    websiteStore.put(email, w);
                    // update map store entry for the hasStatus property.
                    String location = covidWebsiteUpdatedEvent.getCountry() + "|" + covidWebsiteUpdatedEvent.getProvince() + "|" + covidWebsiteUpdatedEvent.getCity();
                    String userId = covidWebsiteUpdatedEvent.getUserId();
                    String entityId = location + "|" + userId;
                    String entityString = entityStore.get(entityId);
                    // chances are the entityString is null, we need to do the null check here.
                    if(entityString != null) {
                        Map<String, Object> entityMap = JsonMapper.string2Map(entityString);
                        String category = (String) entityMap.get("category");
                        String subcategory = (String) entityMap.get("subcategory");
                        String keyCategory = location + "|" + category;
                        String keySubCategory = keyCategory + "|" + subcategory;
                        covidWebsiteUpdatedEvent.setKeyId(1);
                        covidWebsiteUpdatedEvent.getEventId().setDerived(true);
                        pc.forward(keyCategory.getBytes(StandardCharsets.UTF_8), serializer.serialize(covidWebsiteUpdatedEvent), To.child("EventProcessor"));
                        covidWebsiteUpdatedEvent.setKeyId(2);
                        pc.forward(keySubCategory.getBytes(StandardCharsets.UTF_8), serializer.serialize(covidWebsiteUpdatedEvent), To.child("EventProcessor"));
                    } else {
                        logger.error("Entity not found in entityStore with entityId = " + entityId);
                    }
                } else if (keyId == 1) {
                    String keyCategory = new String(key, StandardCharsets.UTF_8);
                    String userId = covidWebsiteUpdatedEvent.getUserId();
                    String catString = mapStore.get(keyCategory);
                    if(catString != null) {
                        Map<String, Object> catMap = JsonMapper.string2Map(catString);
                        List<Map<String, Object>> catPoints = (List<Map<String, Object>>)catMap.get("points");
                        Map<String, Object> point = catPoints.stream()
                                .filter(p -> userId.equals(((Map<String, Object>)p.get("properties")).get("id")))
                                .findFirst()
                                .orElse(null);
                        if(point != null) {
                            Map<String, Object> properties = (Map<String, Object>)point.get("properties");
                            properties.put("hasWebsite", true);
                        }
                        mapStore.put(keyCategory, JsonMapper.toJson(catMap));
                    }

                } else if (keyId == 2) {
                    String keySubCategory = new String(key, StandardCharsets.UTF_8);
                    String userId = covidWebsiteUpdatedEvent.getUserId();
                    String subString = mapStore.get(keySubCategory);
                    if(subString != null) {
                        Map<String, Object> subMap = JsonMapper.string2Map(subString);
                        List<Map<String, Object>> subPoints = (List<Map<String, Object>>)subMap.get("points");
                        Map<String, Object> point = subPoints.stream()
                                .filter(p -> userId.equals(((Map<String, Object>)p.get("properties")).get("id")))
                                .findFirst()
                                .orElse(null);
                        if(point != null) {
                            Map<String, Object> properties = (Map<String, Object>)point.get("properties");
                            properties.put("hasWebsite", true);
                        }
                        mapStore.put(keySubCategory, JsonMapper.toJson(subMap));
                    }
                } else {
                    logger.error("Wrong keyId " + keyId);
                }
                pc.forward(email.getBytes(StandardCharsets.UTF_8), ByteUtil.longToBytes(nonce + 1), To.child("NonceProcessor"));
                EventNotification notification = new EventNotification(nonce, APP, covidWebsiteUpdatedEvent.getClass().getSimpleName(), true, null, covidWebsiteUpdatedEvent);
                pc.forward(email.getBytes(StandardCharsets.UTF_8), notification.toString().getBytes(StandardCharsets.UTF_8), To.child("NotificationProcessor"));
            } else if(object instanceof CovidWebsiteDeletedEvent) {
                CovidWebsiteDeletedEvent covidWebsiteDeletedEvent = (CovidWebsiteDeletedEvent) object;
                if (logger.isTraceEnabled()) logger.trace("Event = " + covidWebsiteDeletedEvent);
                String email = covidWebsiteDeletedEvent.getEmail();
                long nonce = covidWebsiteDeletedEvent.getEventId().getNonce();
                websiteStore.delete(email);
                // TODO remove the website link from the entity map store?
                pc.forward(email.getBytes(StandardCharsets.UTF_8), ByteUtil.longToBytes(nonce + 1), To.child("NonceProcessor"));
                EventNotification notification = new EventNotification(nonce, APP, covidWebsiteDeletedEvent.getClass().getSimpleName(), true, null, covidWebsiteDeletedEvent);
                pc.forward(email.getBytes(StandardCharsets.UTF_8), notification.toString().getBytes(StandardCharsets.UTF_8), To.child("NotificationProcessor"));
            } else if(object instanceof UserUpdatedEvent) {
                // update maproot data related to the country, province and city
                UserUpdatedEvent userUpdatedEvent = (UserUpdatedEvent) object;
                if (logger.isTraceEnabled()) logger.trace("Event = " + userUpdatedEvent);
                String email = userUpdatedEvent.getEmail();
                long nonce = userUpdatedEvent.getEventId().getNonce();
                int keyId = userUpdatedEvent.getKeyId();
                String userId = userUpdatedEvent.getUserId();
                // check if location has been changed.
                if (userUpdatedEvent.getOldCountry() != null && userUpdatedEvent.getOldProvince() != null && userUpdatedEvent.getOldCity() != null) {
                    // we only need to do something if old location is not null. There are two situations that needs to handle: new is null or new is different
                    String oldLocation = userUpdatedEvent.getOldCountry() + "|" + userUpdatedEvent.getOldProvince() + "|" + userUpdatedEvent.getOldCity();
                    if (userUpdatedEvent.getCountry() != null && userUpdatedEvent.getProvince() != null && userUpdatedEvent.getCity() != null) {
                        String newLocation = userUpdatedEvent.getCountry() + "|" + userUpdatedEvent.getProvince() + "|" + userUpdatedEvent.getCity();
                        if (!oldLocation.equals(newLocation)) {
                            // need move the entity from old to new.
                            String oldEntityId = oldLocation + "|" + userId;
                            String newEntityId = newLocation + "|" + userId;
                            if (keyId == 0) {
                                String entityString = entityStore.delete(oldEntityId);
                                if (entityString != null) {
                                    // we only do something if entity has been created already. issue #52
                                    entityStore.put(newEntityId, entityString);
                                    // resend the event for mapStore updates
                                    Map<String, Object> entityMap = JsonMapper.string2Map(entityString);
                                    String category = (String) entityMap.get("category");
                                    String subcategory = (String) entityMap.get("subcategory");
                                    String oldKeyCategory = oldLocation + "|" + category;
                                    String oldKeySubCategory = oldKeyCategory + "|" + subcategory;
                                    String newKeyCategory = newLocation + "|" + category;
                                    String newKeySubCategory = newKeyCategory + "|" + subcategory;
                                    // send events to remove mapStore entries for the category and subcategory.
                                    userUpdatedEvent.setKeyId(1);
                                    userUpdatedEvent.getEventId().setDerived(true);
                                    pc.forward(oldKeyCategory.getBytes(StandardCharsets.UTF_8), serializer.serialize(userUpdatedEvent), To.child("EventProcessor"));
                                    userUpdatedEvent.setKeyId(2);
                                    pc.forward(oldKeySubCategory.getBytes(StandardCharsets.UTF_8), serializer.serialize(userUpdatedEvent), To.child("EventProcessor"));
                                }
                            } else if (keyId == 1) {
                                // handle category map
                                String keyCategory = new String(key, StandardCharsets.UTF_8);
                                String oldCatString = mapStore.get(keyCategory);
                                Map<String, Object> point = null;
                                if (oldCatString != null) {
                                    Map<String, Object> catMap = JsonMapper.string2Map((oldCatString));
                                    List<Map<String, Object>> catPoints = (List<Map<String, Object>>) catMap.get("points");
                                    // find the point map for this userId
                                    point = catPoints.stream()
                                            .filter(p -> userId.equals(((Map<String, Object>) p.get("properties")).get("id")))
                                            .findFirst()
                                            .orElse(null);
                                    // remove all points if there are multiple. There should only one entry.
                                    catPoints.removeIf(p -> userId.equals(((Map<String, Object>) p.get("properties")).get("id")));
                                    mapStore.put(keyCategory, JsonMapper.toJson(catMap));
                                }
                                // send a new event to add the point to the new map, create the map if it doesn't exist.
                                if (point != null) {
                                    // keyCategory, location, point,
                                    EventId eventId = EventId.newBuilder()
                                            .setId(email)
                                            .setNonce(nonce)
                                            .setDerived(true)
                                            .build();
                                    CovidMapMovedEvent covidMapMovedEvent = CovidMapMovedEvent.newBuilder()
                                            .setEventId(eventId)
                                            .setLocation(newLocation)
                                            .setKeyId(1)
                                            .setPoint(JsonMapper.toJson(point))
                                            .setUserId(userId)
                                            .setTimestamp(System.currentTimeMillis())
                                            .build();
                                    String category = keyCategory.substring(keyCategory.lastIndexOf("|") + 1);
                                    pc.forward((newLocation + "|" + category).getBytes(StandardCharsets.UTF_8), serializer.serialize(covidMapMovedEvent), To.child("EventProcessor"));
                                }
                            } else if (keyId == 2) {
                                // handle subcategory map
                                String keySubCategory = new String(key, StandardCharsets.UTF_8);
                                String oldSubString = mapStore.get(keySubCategory);
                                Map<String, Object> point = null;
                                if (oldSubString != null) {
                                    Map<String, Object> subMap = JsonMapper.string2Map((oldSubString));
                                    List<Map<String, Object>> subPoints = (List<Map<String, Object>>) subMap.get("points");
                                    // find the point map for this userId
                                    point = subPoints.stream()
                                            .filter(p -> userId.equals(((Map<String, Object>) p.get("properties")).get("id")))
                                            .findFirst()
                                            .orElse(null);
                                    // remove all points if there are multiple. There should only one entry.
                                    subPoints.removeIf(p -> userId.equals(((Map<String, Object>) p.get("properties")).get("id")));
                                    mapStore.put(keySubCategory, JsonMapper.toJson(subMap));
                                }
                                // add the point to the new map, create the map if it doesn't exist.
                                if (point != null) {
                                    EventId eventId = EventId.newBuilder()
                                            .setId(email)
                                            .setNonce(nonce)
                                            .setDerived(true)
                                            .build();
                                    CovidMapMovedEvent covidMapMovedEvent = CovidMapMovedEvent.newBuilder()
                                            .setEventId(eventId)
                                            .setLocation(newLocation)
                                            .setKeyId(1)
                                            .setPoint(JsonMapper.toJson(point))
                                            .setUserId(userId)
                                            .setTimestamp(System.currentTimeMillis())
                                            .build();
                                    String before = StringUtils.substringBeforeLast(keySubCategory, "|");
                                    String sub = StringUtils.substringAfterLast(keySubCategory, "|");
                                    String catsub = StringUtils.substringAfterLast(before, "|") + "|" + sub;
                                    pc.forward((newLocation + "|" + catsub).getBytes(StandardCharsets.UTF_8), serializer.serialize(covidMapMovedEvent), To.child("EventProcessor"));
                                }
                            }
                        }
                    } else {
                        // part of the location is null, just remove the entity, the processing logic is similar to the UserDeletedEvent
                        if (keyId == 0) {
                            String oldEntityId = oldLocation + "|" + userId;
                            String entityString = entityStore.delete(oldEntityId);
                            if (entityString != null) {
                                // remove status and website
                                statusStore.delete(email);
                                websiteStore.delete(email);

                                // we only need to do something if entity is not empty. issue #52
                                Map<String, Object> entityMap = JsonMapper.string2Map(entityString);
                                String category = (String) entityMap.get("category");
                                String subcategory = (String) entityMap.get("subcategory");
                                String keyCategory = oldLocation + "|" + category;
                                String keySubCategory = keyCategory + "|" + subcategory;
                                userUpdatedEvent.setKeyId(1);
                                userUpdatedEvent.getEventId().setDerived(true);
                                pc.forward(keyCategory.getBytes(StandardCharsets.UTF_8), serializer.serialize(userUpdatedEvent), To.child("EventProcessor"));
                                userUpdatedEvent.setKeyId(2);
                                pc.forward(keySubCategory.getBytes(StandardCharsets.UTF_8), serializer.serialize(userUpdatedEvent), To.child("EventProcessor"));
                            }
                        } else if (keyId == 1) {
                            String keyCategory = new String(key, StandardCharsets.UTF_8);
                            String catString = mapStore.get(keyCategory);
                            if (catString != null) {
                                Map<String, Object> catMap = JsonMapper.string2Map(catString);
                                List<Map<String, Object>> catPoints = (List<Map<String, Object>>) catMap.get("points");
                                catPoints.removeIf(p -> userId.equals(((Map<String, Object>) p.get("properties")).get("id")));
                                mapStore.put(keyCategory, JsonMapper.toJson(catMap));
                            }
                        } else if (keyId == 2) {
                            String keySubCategory = new String(key, StandardCharsets.UTF_8);
                            String subString = mapStore.get(keySubCategory);
                            if (subString != null) {
                                Map<String, Object> subMap = JsonMapper.string2Map(subString);
                                List<Map<String, Object>> subPoints = (List<Map<String, Object>>) subMap.get("points");
                                subPoints.removeIf(p -> userId.equals(((Map<String, Object>) p.get("properties")).get("id")));
                                mapStore.put(keySubCategory, JsonMapper.toJson(subMap));
                            }
                        }
                    }
                }
            } else if(object instanceof CovidMapMovedEvent) {
                CovidMapMovedEvent covidMapMovedEvent = (CovidMapMovedEvent) object;
                if (logger.isTraceEnabled()) logger.trace("Event = " + covidMapMovedEvent);
                int keyId = covidMapMovedEvent.getKeyId();
                String location = covidMapMovedEvent.getLocation();
                String userId = covidMapMovedEvent.getUserId();
                String pointString = covidMapMovedEvent.getPoint();
                Map<String, Object> point = JsonMapper.string2Map(pointString);
                if(keyId == 1) {
                    String keyCategory = new String(key, StandardCharsets.UTF_8);
                    String catString = mapStore.get(keyCategory);
                    if (catString == null) {
                        // we need to create the entries.
                        Map<String, Object> catMap = new HashMap<>();
                        String cityString = cityStore.get(location);
                        if (cityString != null) {
                            catMap.put("map", JsonMapper.string2Map(cityString));
                            List<Map<String, Object>> points = new ArrayList<>();
                            points.add(point);
                            catMap.put("points", points);
                            mapStore.put(keyCategory, JsonMapper.toJson(catMap));
                        }
                    } else {
                        // we need to update the entry to add userId only if it doesn't exist.
                        Map<String, Object> catMap = JsonMapper.string2Map(catString);
                        List<Map<String, Object>> points = (List<Map<String, Object>>) catMap.get("points");
                        // remove the same userId entry to prevent duplication
                        points.removeIf(p -> userId.equals(((Map<String, Object>) p.get("properties")).get("id")));
                        points.add(point);
                        mapStore.put(keyCategory, JsonMapper.toJson(catMap));
                    }
                } else if (keyId ==2) {
                    String keySubCategory = new String(key, StandardCharsets.UTF_8);
                    String subString = mapStore.get(keySubCategory);
                    if (subString == null) {
                        // we need to create the entries.
                        Map<String, Object> subMap = new HashMap<>();
                        String cityString = cityStore.get(location);
                        if (cityString != null) {
                            subMap.put("map", JsonMapper.string2Map(cityString));
                            List<Map<String, Object>> points = new ArrayList<>();
                            points.add(point);
                            subMap.put("points", points);
                            mapStore.put(keySubCategory, JsonMapper.toJson(subMap));
                        }
                    } else {
                        // we need to update the entry to add userId only if it doesn't exist.
                        Map<String, Object> subMap = JsonMapper.string2Map(subString);
                        List<Map<String, Object>> points = (List<Map<String, Object>>) subMap.get("points");
                        // remove the same userId entry to prevent duplication
                        points.removeIf(p -> userId.equals(((Map<String, Object>) p.get("properties")).get("id")));
                        points.add(point);
                        mapStore.put(keySubCategory, JsonMapper.toJson(subMap));
                    }
                } else {
                    logger.error("Wrong keyId " + keyId);
                }
            } else if(object instanceof UserDeletedEvent) {
                // update maproot data related to the country, province and city
                UserDeletedEvent userDeletedEvent = (UserDeletedEvent) object;
                if (logger.isTraceEnabled()) logger.trace("Event = " + userDeletedEvent);
                String email = userDeletedEvent.getEmail();
                int keyId = userDeletedEvent.getKeyId();
                String userId = userDeletedEvent.getUserId();
                String country = userDeletedEvent.getCountry();
                String province = userDeletedEvent.getProvince();
                String city = userDeletedEvent.getCity();
                if(keyId == 0) {
                    // email is the key
                    // remove entity from entityStore
                    String location = country + "|" + province + "|" + city;
                    String entityId = location + "|" + userId;
                    String entityString = entityStore.delete(entityId);
                    if(entityString != null) {
                        // remove status and website if exists
                        statusStore.delete(email);
                        websiteStore.delete(email);

                        // we only need to remove the mapStore entry if entity is not empty. issue #52
                        Map<String, Object> entityMap = JsonMapper.string2Map(entityString);
                        String category = (String) entityMap.get("category");
                        String subcategory = (String) entityMap.get("subcategory");
                        String keyCategory = location + "|" + category;
                        String keySubCategory = keyCategory + "|" + subcategory;
                        userDeletedEvent.setKeyId(1);
                        userDeletedEvent.getEventId().setDerived(true);
                        pc.forward(keyCategory.getBytes(StandardCharsets.UTF_8), serializer.serialize(userDeletedEvent), To.child("EventProcessor"));
                        userDeletedEvent.setKeyId(2);
                        pc.forward(keySubCategory.getBytes(StandardCharsets.UTF_8), serializer.serialize(userDeletedEvent), To.child("EventProcessor"));
                    }
                } else if (keyId == 1) {
                    String keyCategory = new String(key, StandardCharsets.UTF_8);
                    String catString = mapStore.get(keyCategory);
                    if(catString != null) {
                        Map<String, Object> catMap = JsonMapper.string2Map(catString);
                        List<Map<String, Object>> catPoints = (List<Map<String, Object>>)catMap.get("points");
                        catPoints.removeIf(p -> userId.equals(((Map<String, Object>)p.get("properties")).get("id")));
                        mapStore.put(keyCategory, JsonMapper.toJson(catMap));
                    }
                } else if (keyId == 2) {
                    String keySubCategory = new String(key, StandardCharsets.UTF_8);
                    String subString = mapStore.get(keySubCategory);
                    if(subString != null) {
                        Map<String, Object> subMap = JsonMapper.string2Map(subString);
                        List<Map<String, Object>> subPoints = (List<Map<String, Object>>)subMap.get("points");
                        subPoints.removeIf(p -> userId.equals(((Map<String, Object>)p.get("properties")).get("id")));
                        mapStore.put(keySubCategory, JsonMapper.toJson(subMap));
                    }
                }
            } else if(object instanceof PeerStatusUpdatedEvent) {
                PeerStatusUpdatedEvent peerStatusUpdatedEvent = (PeerStatusUpdatedEvent) object;
                if (logger.isTraceEnabled()) logger.trace("Event = " + peerStatusUpdatedEvent);
                String email = peerStatusUpdatedEvent.getEventId().getId();
                long nonce = peerStatusUpdatedEvent.getEventId().getNonce();
                String status = peerStatusUpdatedEvent.getStatus();
                String ownerEmail = peerStatusUpdatedEvent.getEmail();
                statusStore.put(ownerEmail, status);
                pc.forward(email.getBytes(StandardCharsets.UTF_8), ByteUtil.longToBytes(nonce + 1), To.child("NonceProcessor"));
                EventNotification notification = new EventNotification(nonce, APP, peerStatusUpdatedEvent.getClass().getSimpleName(), true, null, peerStatusUpdatedEvent);
                pc.forward(email.getBytes(StandardCharsets.UTF_8), notification.toString().getBytes(StandardCharsets.UTF_8), To.child("NotificationProcessor"));
            }
        }

        public Map<String, Object> createPoint(String userId, String category, String subcategory, String introduction, double longitude, double latitude) {
            Map<String, Object> point = new HashMap<>();
            point.put("type", "Feature");

            Map<String, Object> properties = new HashMap<>();
            properties.put("cluster", false);
            properties.put("id", userId);
            properties.put("hasStatus", false);
            properties.put("hasWebsite", false);
            properties.put("category", category);
            properties.put("subcategory", subcategory);
            properties.put("introduction", introduction);
            point.put("properties", properties);

            Map<String, Object> geometry = new HashMap<>();
            geometry.put("type", "Point");
            List<Double> coordinates = new ArrayList<>();
            coordinates.add(longitude);
            coordinates.add(latitude);
            geometry.put("coordinates", coordinates);
            point.put("geometry", geometry);
            return point;
        }

        @Override
        public void close() {
            if(logger.isInfoEnabled()) logger.info("Closing processor...");
        }
    }
    @Override
    public void start(String ip, int port) {
        if(logger.isDebugEnabled()) logger.debug("CovidStreams is starting...");
        startCovidStreams(ip, port);
    }

    @Override
    public void close() {
        if(logger.isDebugEnabled()) logger.debug("CovidStreams is closing...");
        covidStreams.close();
    }
}
