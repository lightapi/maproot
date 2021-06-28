
package net.lightapi.portal.covid.query.handler;

import com.networknt.httpstring.AttachmentConstants;
import com.networknt.monad.Result;
import com.networknt.server.Server;
import com.networknt.utility.NetUtils;
import com.networknt.utility.NioUtils;
import com.networknt.rpc.Handler;
import com.networknt.rpc.router.ServiceHandler;
import java.nio.ByteBuffer;
import java.util.Map;

import io.undertow.server.HttpServerExchange;
import net.lightapi.portal.HybridQueryClient;
import net.lightapi.portal.covid.query.CovidQueryStartup;
import org.apache.kafka.streams.state.ReadOnlyKeyValueStore;
import org.apache.kafka.streams.state.StreamsMetadata;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ServiceHandler(id="lightapi.net/covid/getStatusByEmail/0.1.0")
public class GetStatusByEmail implements Handler {
    private static final Logger logger = LoggerFactory.getLogger(GetStatusByEmail.class);
    static final String PERMISSION_DENIED = "ERR11620";
    static final String STATUS_NOT_FOUND = "ERR11626";

    @Override
    public ByteBuffer handle(HttpServerExchange exchange, Object input)  {
        if(logger.isTraceEnabled()) logger.trace("input = " + input);
        Map<String, Object> map = (Map<String, Object>)input;
        String email = (String)map.get("email");
        Map<String, Object> auditInfo = exchange.getAttachment(AttachmentConstants.AUDIT_INFO);
        if(auditInfo != null) {
            String userId = (String)auditInfo.get("user_id");
            if(userId != null) {
                // make sure the userId matches the email
                if(!userId.equals(email)) {
                    return NioUtils.toByteBuffer(getStatus(exchange, PERMISSION_DENIED, userId));
                }
            }
            // if client credentials token is used, let it go to the next step. This might be called from GetStatusByUserId
        } else {
            return NioUtils.toByteBuffer(getStatus(exchange, PERMISSION_DENIED, "unknown user"));
        }
        ReadOnlyKeyValueStore<String, String> keyValueStore = CovidQueryStartup.streams.getStatusStore();
        String data = keyValueStore.get(email);
        if(data != null) {
            return NioUtils.toByteBuffer(data);
        } else {
            StreamsMetadata metadata = CovidQueryStartup.streams.getStatusStreamsMetadata(email);
            if(logger.isDebugEnabled()) logger.debug("found address in another instance " + metadata.host() + ":" + metadata.port());
            String url = "https://" + metadata.host() + ":" + metadata.port();
            if(NetUtils.getLocalAddressByDatagram().equals(metadata.host()) && Server.getServerConfig().getHttpsPort() == metadata.port()) {
                // TODO remove this block if we never seen the following error.
                logger.error("******Kafka returns the same instance!");
                return NioUtils.toByteBuffer(getStatus(exchange, STATUS_NOT_FOUND, email));
            } else {
                Result<String> resultStatus = HybridQueryClient.getStatusByEmail(exchange, url, email);
                if (resultStatus.isSuccess()) {
                    return NioUtils.toByteBuffer(resultStatus.getResult());
                }
            }
            return NioUtils.toByteBuffer(getStatus(exchange, STATUS_NOT_FOUND, email));
        }
    }
}
