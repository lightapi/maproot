
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
import java.util.Objects;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CountDownLatch;

import io.undertow.server.HttpServerExchange;
import net.lightapi.portal.HybridQueryClient;
import net.lightapi.portal.PortalConfig;
import net.lightapi.portal.command.HybridCommandStartup;
import net.lightapi.portal.covid.CityMapDeletedEvent;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ServiceHandler(id="lightapi.net/covid/deleteCityMap/0.1.0")
public class DeleteCityMap implements Handler {
    private static final Logger logger = LoggerFactory.getLogger(DeleteCityMap.class);
    private static final PortalConfig config = (PortalConfig) Config.getInstance().getJsonObjectConfig(PortalConfig.CONFIG_NAME, PortalConfig.class);

    private static final String PERMISSION_DENIED = "ERR11620";
    private static final String SEND_MESSAGE_EXCEPTION = "ERR11605";
    AvroSerializer serializer = new AvroSerializer();

    @Override
    public ByteBuffer handle(HttpServerExchange exchange, Object input)  {
        if(logger.isTraceEnabled()) logger.debug("input = " + input);

        Map<String, Object> auditInfo = exchange.getAttachment(AttachmentConstants.AUDIT_INFO);
        // the auditInfo won't be null as it passes the Jwt verification
        String email = (String)auditInfo.get("user_id");
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
        CityMapDeletedEvent event = CityMapDeletedEvent.newBuilder()
                .setEventId(eventId)
                .setCountry((String)map.get("country"))
                .setProvince((String)map.get("province"))
                .setCity((String)map.get("city"))
                .setTimestamp(System.currentTimeMillis())
                .build();

        byte[] bytes = serializer.serialize(event);

        ProducerRecord<byte[], byte[]> record = new ProducerRecord<>(config.getTopic(), email.getBytes(StandardCharsets.UTF_8), bytes);
        final CountDownLatch latch = new CountDownLatch(1);
        try {
            HybridCommandStartup.producer.send(record, (recordMetadata, e) -> {
                if (Objects.nonNull(e)) {
                    logger.error("Exception occurred while pushing the event", e);
                } else {
                    logger.info("Event record pushed successfully. Received Record Metadata is {}",
                            recordMetadata);
                }
                latch.countDown();
            });
            latch.await();
        } catch (InterruptedException e) {
            logger.error("Exception:", e);
            return NioUtils.toByteBuffer(getStatus(exchange, SEND_MESSAGE_EXCEPTION, e.getMessage(), email));
        }
        return NioUtils.toByteBuffer(getStatus(exchange, REQUEST_SUCCESS));
    }
}
