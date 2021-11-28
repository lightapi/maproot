
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
import net.lightapi.portal.covid.CovidStatusDeletedEvent;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ServiceHandler(id="lightapi.net/covid/deleteStatus/0.1.0")
public class DeleteStatus implements Handler {
    private static final Logger logger = LoggerFactory.getLogger(DeleteStatus.class);
    private static final PortalConfig config = (PortalConfig) Config.getInstance().getJsonObjectConfig(PortalConfig.CONFIG_NAME, PortalConfig.class);

    private static final String SEND_MESSAGE_EXCEPTION = "ERR11605";
    AvroSerializer serializer = new AvroSerializer();

    @Override
    public ByteBuffer handle(HttpServerExchange exchange, Object input)  {
        if(logger.isTraceEnabled()) logger.trace("input = " + input);
        Map<String, Object> auditInfo = exchange.getAttachment(AttachmentConstants.AUDIT_INFO);
        // the auditInfo won't be null as it passes the Jwt verification
        String email = (String)auditInfo.get("user_id");
        // TODO make sure that there is a status available for the email.
        Result<String> resultNonce = HybridQueryClient.getNonceByEmail(exchange, email);
        if(resultNonce.isSuccess()) {
            EventId eventId = EventId.newBuilder()
                    .setId(email)
                    .setNonce(Long.valueOf(resultNonce.getResult()))
                    .build();
            CovidStatusDeletedEvent event = CovidStatusDeletedEvent.newBuilder()
                    .setEventId(eventId)
                    .setEmail(email)
                    .setKeyId(0)
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
        } else {
            return NioUtils.toByteBuffer(getStatus(exchange, resultNonce.getError()));
        }
        return NioUtils.toByteBuffer(getStatus(exchange, REQUEST_SUCCESS));
    }
}
