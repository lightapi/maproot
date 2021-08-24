
package net.lightapi.portal.covid.command.handler;

import com.networknt.config.Config;
import com.networknt.httpstring.AttachmentConstants;
import com.networknt.kafka.common.AvroSerializer;
import com.networknt.kafka.common.EventId;
import com.networknt.kafka.producer.QueuedLightProducer;
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
import net.lightapi.portal.HybridQueryClient;
import net.lightapi.portal.PortalConfig;
import net.lightapi.portal.covid.CityMapCreatedEvent;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * register a country, province and city combination with longitude and latitude in order
 * to draw the map. It also include the initial zoom value for map configuration.
 *
 * @author Steve Hu
 */
@ServiceHandler(id="lightapi.net/covid/createCityMap/0.1.0")
public class CreateCityMap implements Handler {
    private static final Logger logger = LoggerFactory.getLogger(CreateCityMap.class);
    private static final PortalConfig config = (PortalConfig) Config.getInstance().getJsonObjectConfig(PortalConfig.CONFIG_NAME, PortalConfig.class);

    private static final String PERMISSION_DENIED = "ERR11620";
    private static final String CITY_REGISTERED = "ERR11621";
    private static final String SEND_MESSAGE_EXCEPITON = "ERR11605";

    @Override
    public ByteBuffer handle(HttpServerExchange exchange, Object input)  {
        if(logger.isTraceEnabled()) logger.trace("input = " + input);
        // make sure that the user has a role as admin, otherwise, reject.
        Map<String, Object> auditInfo = exchange.getAttachment(AttachmentConstants.AUDIT_INFO);
        // the auditInfo won't be null as it passes the Jwt verification
        String email = (String)auditInfo.get("user_id");
        String roles = (String)auditInfo.get("roles");
        if(roles == null || !roles.contains("admin")) {
            return NioUtils.toByteBuffer(getStatus(exchange, PERMISSION_DENIED, roles));
        }

        Map<String, Object> map = (Map<String, Object>)input;
        String country = (String)map.get("country");
        String province = (String)map.get("province");
        String city = (String)map.get("city");
        double latitude = (Double)map.get("latitude");
        double longitude = (Double)map.get("longitude");
        Integer zoom = (Integer)map.get("zoom");

        Result<String> resultCity = HybridQueryClient.getCity(exchange, country, province, city);
        if(resultCity.isSuccess()) {
            return NioUtils.toByteBuffer(getStatus(exchange, CITY_REGISTERED, country, province, city));
        } else {
            if(resultCity.getError().getStatusCode() != 404) {
                return NioUtils.toByteBuffer(getStatus(exchange, resultCity.getError()));
            }
        }
        Result<String> resultNonce = HybridQueryClient.getNonceByEmail(exchange, email);
        if(resultNonce.isSuccess()) {
            EventId eventId = EventId.newBuilder()
                    .setId(email)
                    .setNonce(Long.valueOf(resultNonce.getResult()))
                    .build();
            CityMapCreatedEvent event = CityMapCreatedEvent.newBuilder()
                    .setEventId(eventId)
                    .setCountry(country)
                    .setProvince(province)
                    .setCity(city)
                    .setLatitude(latitude)
                    .setLongitude(longitude)
                    .setZoom(zoom)
                    .setTimestamp(System.currentTimeMillis())
                    .build();

            AvroSerializer serializer = new AvroSerializer();
            byte[] bytes = serializer.serialize(event);

            ProducerRecord<byte[], byte[]> record = new ProducerRecord<>(config.getTopic(), email.getBytes(StandardCharsets.UTF_8), bytes);
            QueuedLightProducer producer = SingletonServiceFactory.getBean(QueuedLightProducer.class);
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
