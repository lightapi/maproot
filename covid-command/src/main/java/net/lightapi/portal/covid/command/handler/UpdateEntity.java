
package net.lightapi.portal.covid.command.handler;

import com.networknt.config.Config;
import com.networknt.config.JsonMapper;
import com.networknt.httpstring.AttachmentConstants;
import com.networknt.kafka.common.AvroSerializer;
import com.networknt.kafka.common.EventId;
import com.networknt.kafka.producer.LightProducer;
import com.networknt.monad.Result;
import com.networknt.service.SingletonServiceFactory;
import com.networknt.utility.NioUtils;
import com.networknt.rpc.Handler;
import com.networknt.rpc.router.ServiceHandler;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.BlockingQueue;

import io.undertow.server.HttpServerExchange;
import net.lightapi.portal.command.HybridQueryClient;
import net.lightapi.portal.covid.CovidEntityCreatedEvent;
import net.lightapi.portal.covid.CovidEntityUpdatedEvent;
import net.lightapi.portal.covid.command.CovidCommandConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ServiceHandler(id="lightapi.net/covid/updateEntity/0.1.0")
public class UpdateEntity implements Handler {
    private static final Logger logger = LoggerFactory.getLogger(UpdateEntity.class);
    private static final CovidCommandConfig config = (CovidCommandConfig) Config.getInstance().getJsonObjectConfig(CovidCommandConfig.CONFIG_NAME, CovidCommandConfig.class);

    private static final String PROFILE_LOCATION_INCOMPLETE = "ERR11622";
    private static final String SEND_MESSAGE_EXCEPITON = "ERR11605";
    private static final String CITY_NOT_REGISTERED = "ERR11623";

    @Override
    public ByteBuffer handle(HttpServerExchange exchange, Object input)  {
        if(logger.isTraceEnabled()) logger.trace("input = " + input);
        Map<String, Object> auditInfo = exchange.getAttachment(AttachmentConstants.AUDIT_INFO);
        // the auditInfo won't be null as it passes the Jwt verification
        String email = (String)auditInfo.get("userId");
        // make sure that country, province and city are populated in the user profile.
        Result<String> resultUser = HybridQueryClient.getUserByEmail(exchange, email);
        String key = null;
        if(resultUser.isSuccess()) {
            Map<String, Object> userMap = JsonMapper.string2Map(resultUser.getResult());
            String country = (String)userMap.get("country");
            String province = (String)userMap.get("province");
            String city = (String)userMap.get("city");
            if(country == null || province == null || city == null) {
                return NioUtils.toByteBuffer(getStatus(exchange, PROFILE_LOCATION_INCOMPLETE));
            }
            key = country + "|" + province + "|" + city;
        } else {
            return NioUtils.toByteBuffer(getStatus(exchange, resultUser.getError()));
        }
        Map<String, Object> map = (Map<String, Object>)input;
        String category = (String)map.get("category");
        String subcategory = (String)map.get("subcategory");
        String sLat = (String)map.get("latitude");
        String sLon = (String)map.get("longitude");
        String introduction = (String)map.get("introduction");
        // check if the key is in the cityMap store
        Result<String> resultCity = HybridQueryClient.getCityByKey(exchange, key);
        if(resultCity.isFailure()) {
            if(resultCity.getError().getStatusCode() == 404) {
                return NioUtils.toByteBuffer(getStatus(exchange, CITY_NOT_REGISTERED, key));
            } else {
                return NioUtils.toByteBuffer(getStatus(exchange, resultCity.getError()));
            }
        }

        Result<String> resultNonce = HybridQueryClient.getNonceByEmail(exchange, email);
        if(resultNonce.isSuccess()) {
            EventId eventId = EventId.newBuilder()
                    .setId(email)
                    .setNonce(Long.valueOf(resultNonce.getResult()))
                    .build();
            CovidEntityUpdatedEvent event = CovidEntityUpdatedEvent.newBuilder()
                    .setEventId(eventId)
                    .setKey(key)
                    .setCategory(category)
                    .setSubcategory(subcategory)
                    .setLatitude(Float.valueOf(sLat))
                    .setLongitude(Float.valueOf(sLon))
                    .setIntroduction(introduction)
                    .setTimestamp(System.currentTimeMillis())
                    .build();

            AvroSerializer serializer = new AvroSerializer();
            byte[] bytes = serializer.serialize(event);

            ProducerRecord<byte[], byte[]> record = new ProducerRecord<>(config.getTopic(), email.getBytes(StandardCharsets.UTF_8), bytes);
            LightProducer producer = SingletonServiceFactory.getBean(LightProducer.class);
            BlockingQueue<ProducerRecord<byte[], byte[]>> txQueue = producer.getTxQueue();
            try {
                txQueue.put(record);
            } catch (InterruptedException e) {
                logger.error("Exception:", e);
                return NioUtils.toByteBuffer(getStatus(exchange, SEND_MESSAGE_EXCEPITON, e.getMessage(), email));
            }
            return NioUtils.toByteBuffer(getStatus(exchange, REQUEST_SUCCESS));
        } else {
            return NioUtils.toByteBuffer(getStatus(exchange, resultNonce.getError()));
        }
    }
}
