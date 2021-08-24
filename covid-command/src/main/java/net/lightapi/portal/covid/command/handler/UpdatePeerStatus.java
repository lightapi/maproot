
package net.lightapi.portal.covid.command.handler;

import com.networknt.client.oauth.ClientCredentialsRequest;
import com.networknt.client.oauth.OauthHelper;
import com.networknt.client.oauth.TokenRequest;
import com.networknt.client.oauth.TokenResponse;
import com.networknt.config.Config;
import com.networknt.config.JsonMapper;
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
import net.lightapi.portal.covid.PeerStatusUpdatedEvent;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This handler updates the status for the peer on the map. We encourage owner to update
 * its status; however, a lot of customers who are waiting to enter the grocery store
 * might eager to update the status to avoid other people to join the line. This give us
 * more updaters than the owners. We might give incentives to the users who are updating.
 * or enable a hyper link to the update user to his/her website.
 *
 * @author Steve Hu
 */
@ServiceHandler(id="lightapi.net/covid/updatePeerStatus/0.1.0")
public class UpdatePeerStatus implements Handler {
    private static final Logger logger = LoggerFactory.getLogger(UpdatePeerStatus.class);
    private static final PortalConfig config = (PortalConfig) Config.getInstance().getJsonObjectConfig(PortalConfig.CONFIG_NAME, PortalConfig.class);

    private static final String SEND_MESSAGE_EXCEPITON = "ERR11605";

    @Override
    public ByteBuffer handle(HttpServerExchange exchange, Object input)  {
        if(logger.isTraceEnabled()) logger.trace("input = " + input);
        Map<String, Object> auditInfo = exchange.getAttachment(AttachmentConstants.AUDIT_INFO);
        // the auditInfo won't be null as it passes the Jwt verification
        String email = (String)auditInfo.get("user_id");
        Map<String, Object> map = (Map<String, Object>)input;
        String ownerId = (String)map.get("userId");
        // TODO limit number of categories and items in each category.

        Result<String> resultNonce = HybridQueryClient.getNonceByEmail(exchange, email);
        if(resultNonce.isSuccess()) {
            // get the owner email from userId
            TokenRequest tokenRequest = new ClientCredentialsRequest();
            Result<TokenResponse> resultJwt = OauthHelper.getTokenResult(tokenRequest);
            if(resultJwt.isFailure()) {
                return NioUtils.toByteBuffer(getStatus(exchange, resultJwt.getError()));
            }
            Result<String> resultOwner = HybridQueryClient.getUserById(ownerId, resultJwt.getResult().getAccessToken());
            if(resultOwner.isFailure()) {
                return NioUtils.toByteBuffer(getStatus(exchange, resultOwner.getError()));
            }
            String ownerEmail = resultOwner.getResult();

            EventId eventId = EventId.newBuilder()
                    .setId(email)
                    .setNonce(Long.valueOf(resultNonce.getResult()))
                    .build();
            PeerStatusUpdatedEvent event = PeerStatusUpdatedEvent.newBuilder()
                    .setEventId(eventId)
                    .setEmail(ownerEmail)
                    .setKeyId(0)
                    .setStatus(JsonMapper.toJson(map.get("subjects")))
                    .setTimestamp(System.currentTimeMillis())
                    .build();

            AvroSerializer serializer = new AvroSerializer();
            byte[] bytes = serializer.serialize(event);
            // here we have to use the ownerEmail as the key so that they goes to the right partition.
            ProducerRecord<byte[], byte[]> record = new ProducerRecord<>(config.getTopic(), ownerEmail.getBytes(StandardCharsets.UTF_8), bytes);
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
