
package net.lightapi.portal.covid.query.handler;

import com.networknt.client.oauth.ClientCredentialsRequest;
import com.networknt.client.oauth.OauthHelper;
import com.networknt.client.oauth.TokenRequest;
import com.networknt.client.oauth.TokenResponse;
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
import org.apache.kafka.streams.KeyQueryMetadata;
import org.apache.kafka.streams.state.HostInfo;
import org.apache.kafka.streams.state.ReadOnlyKeyValueStore;
import org.apache.kafka.streams.state.StreamsMetadata;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ServiceHandler(id="lightapi.net/covid/getStatusByUserId/0.1.0")
public class GetStatusByUserId implements Handler {
    private static final Logger logger = LoggerFactory.getLogger(GetStatusByUserId.class);
    static final String STATUS_NOT_FOUND = "ERR11626";

    @Override
    public ByteBuffer handle(HttpServerExchange exchange, Object input)  {
        if(logger.isTraceEnabled()) logger.trace("input = " + input);
        Map<String, Object> map = (Map<String, Object>)input;
        String userId = (String)map.get("userId");
        // get email from userId
        TokenRequest tokenRequest = new ClientCredentialsRequest();
        Result<TokenResponse> resultJwt = OauthHelper.getTokenResult(tokenRequest);
        if(resultJwt.isFailure()) {
            return NioUtils.toByteBuffer(getStatus(exchange, resultJwt.getError()));
        }
        Result<String> resultId = HybridQueryClient.getUserById(userId, resultJwt.getResult().getAccessToken());
        if(resultId.isFailure()) {
            return NioUtils.toByteBuffer(getStatus(exchange, resultId.getError()));
        }
        String email = resultId.getResult();

        ReadOnlyKeyValueStore<String, String> keyValueStore = CovidQueryStartup.streams.getStatusStore();
        String data = keyValueStore.get(email);
        if(data != null) {
            return NioUtils.toByteBuffer(data);
        } else {
            KeyQueryMetadata metadata = CovidQueryStartup.streams.getStatusStreamsMetadata(email);
            HostInfo hostInfo = metadata.activeHost();
            if(logger.isDebugEnabled()) logger.debug("found address in another instance " + hostInfo.host() + ":" + hostInfo.port());
            String url = "https://" + hostInfo.host() + ":" + hostInfo.port();
            if(NetUtils.getLocalAddressByDatagram().equals(hostInfo.host()) && Server.getServerConfig().getHttpsPort() == hostInfo.port()) {
                // TODO remove this block if we never seen the following error.
                logger.error("******Kafka returns the same instance!");
                return NioUtils.toByteBuffer(getStatus(exchange, STATUS_NOT_FOUND, email));
            } else {
                Result<String> resultStatus = HybridQueryClient.getStatusByEmail(url, email, resultJwt.getResult().getAccessToken());
                if (resultStatus.isSuccess()) {
                    return NioUtils.toByteBuffer(resultStatus.getResult());
                }
            }
            return NioUtils.toByteBuffer(getStatus(exchange, STATUS_NOT_FOUND, email));
        }
    }
}
