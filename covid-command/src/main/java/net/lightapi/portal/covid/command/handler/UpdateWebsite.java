
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
import net.lightapi.portal.HybridQueryClient;
import net.lightapi.portal.PortalConfig;
import net.lightapi.portal.covid.CovidWebsiteUpdatedEvent;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ServiceHandler(id="lightapi.net/covid/updateWebsite/0.1.0")
public class UpdateWebsite implements Handler {
    private static final Logger logger = LoggerFactory.getLogger(UpdateWebsite.class);
    private static final PortalConfig config = (PortalConfig) Config.getInstance().getJsonObjectConfig(PortalConfig.CONFIG_NAME, PortalConfig.class);

    private static final String SEND_MESSAGE_EXCEPITON = "ERR11605";

    @Override
    public ByteBuffer handle(HttpServerExchange exchange, Object input)  {
        if(logger.isTraceEnabled()) logger.trace("input = " + input);
        Map<String, Object> auditInfo = exchange.getAttachment(AttachmentConstants.AUDIT_INFO);
        // the auditInfo won't be null as it passes the Jwt verification
        String email = (String)auditInfo.get("user_id");
        Map<String, Object> map = (Map<String, Object>)input;
        // TODO limit number of categories and items in each category.
        Result<String> resultUser = HybridQueryClient.getUserByEmail(exchange, email);
        if(resultUser.isFailure()) {
            return NioUtils.toByteBuffer(getStatus(exchange, resultUser.getError()));
        }
        Map<String, Object> userMap = JsonMapper.string2Map(resultUser.getResult());

        Result<String> resultNonce = HybridQueryClient.getNonceByEmail(exchange, email);
        if(resultNonce.isSuccess()) {
            EventId eventId = EventId.newBuilder()
                    .setId(email)
                    .setNonce(Long.valueOf(resultNonce.getResult()))
                    .build();
            CovidWebsiteUpdatedEvent event = CovidWebsiteUpdatedEvent.newBuilder()
                    .setEventId(eventId)
                    .setWebsite(JsonMapper.toJson(map))
                    .setUserId((String)userMap.get("userId"))
                    .setKeyId(0)
                    .setCountry((String)userMap.get("country"))
                    .setProvince((String)userMap.get("province"))
                    .setCity((String)userMap.get("city"))
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
