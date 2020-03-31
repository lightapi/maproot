
package net.lightapi.portal.covid.command.handler;

import com.networknt.config.Config;
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
import net.lightapi.portal.covid.CityMapUpdatedEvent;
import net.lightapi.portal.covid.command.CovidCommandConfig;
import net.lightapi.portal.user.GenderType;
import net.lightapi.portal.user.UserUpdatedEvent;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ServiceHandler(id="lightapi.net/covid/updateCityMap/0.1.0")
public class UpdateCityMap implements Handler {
    private static final Logger logger = LoggerFactory.getLogger(UpdateCityMap.class);
    private static final CovidCommandConfig config = (CovidCommandConfig) Config.getInstance().getJsonObjectConfig(CovidCommandConfig.CONFIG_NAME, CovidCommandConfig.class);

    private static final String PERMISSION_DENIED = "ERR11620";
    private static final String SEND_MESSAGE_EXCEPITON = "ERR11605";

    @Override
    public ByteBuffer handle(HttpServerExchange exchange, Object input)  {
        if(logger.isTraceEnabled()) logger.debug("input = " + input);

        Map<String, Object> auditInfo = exchange.getAttachment(AttachmentConstants.AUDIT_INFO);
        // the auditInfo won't be null as it passes the Jwt verification
        String email = (String)auditInfo.get("userId");
        String roles = (String)auditInfo.get("roles");
        if(roles == null || !roles.contains("admin")) {
            return NioUtils.toByteBuffer(getStatus(exchange, PERMISSION_DENIED, roles));
        }
        Result<String> result = HybridQueryClient.getNonceByEmail(exchange, email);
        if(result.isFailure()) {
            return NioUtils.toByteBuffer(getStatus(exchange, result.getError()));
        }
        Long nonce = Long.valueOf(result.getResult());
        // Do I need to make sure that the city is available to be updated?

        EventId eventId = EventId.newBuilder()
                .setId(email)
                .setNonce(nonce)
                .build();

        Map<String, Object> map = (Map<String, Object>)input;
        CityMapUpdatedEvent event = CityMapUpdatedEvent.newBuilder()
                .setEventId(eventId)
                .setCountry((String)map.get("country"))
                .setProvince((String)map.get("province"))
                .setCity((String)map.get("city"))
                .setLatitude(Float.valueOf((String)map.get("latitude")))
                .setLongitude(Float.valueOf((String)map.get("longitude")))
                .setZoom((Integer)map.get("zoom"))
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
    }
}
