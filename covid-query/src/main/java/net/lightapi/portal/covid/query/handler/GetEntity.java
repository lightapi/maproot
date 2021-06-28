
package net.lightapi.portal.covid.query.handler;

import com.networknt.config.JsonMapper;
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

@ServiceHandler(id="lightapi.net/covid/getEntity/0.1.0")
public class GetEntity implements Handler {
    private static final Logger logger = LoggerFactory.getLogger(GetEntity.class);
    static final String ENTITY_NOT_FOUND = "ERR11625";
    static final String PERMISSION_DENIED = "ERR11620";
    static final String COUNTRY_PROVINCE_CITY_EMPTY = "ERR11624";

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
            } else {
                return NioUtils.toByteBuffer(getStatus(exchange, PERMISSION_DENIED, "unknown user"));
            }
        } else {
            return NioUtils.toByteBuffer(getStatus(exchange, PERMISSION_DENIED, "unknown user"));
        }
        // get user profile by email
        Result<String> resultUser = HybridQueryClient.getUserByEmail(exchange, email);
        if(resultUser.isFailure()) {
            return NioUtils.toByteBuffer(getStatus(exchange, resultUser.getError()));
        }
        // get the key from the user profile
        Map<String, Object> userMap = JsonMapper.string2Map(resultUser.getResult());
        String country = (String)userMap.get("country");
        String province = (String)userMap.get("province");
        String city = (String)userMap.get("city");
        String userId = (String)userMap.get("userId");
        if(country == null || province == null || city == null) {
            return NioUtils.toByteBuffer(getStatus(exchange, COUNTRY_PROVINCE_CITY_EMPTY, country, province, city));
        }
        String key = country + "|" + province + "|" + city + "|" + userId;
        ReadOnlyKeyValueStore<String, String> keyValueStore = CovidQueryStartup.streams.getEntityStore();
        String data = keyValueStore.get(key);
        if(data != null) {
            return NioUtils.toByteBuffer(data);
        } else {
            StreamsMetadata metadata = CovidQueryStartup.streams.getEntityStreamsMetadata(email);
            if(logger.isDebugEnabled()) logger.debug("found address in another instance " + metadata.host() + ":" + metadata.port());
            String url = "https://" + metadata.host() + ":" + metadata.port();
            if(NetUtils.getLocalAddressByDatagram().equals(metadata.host()) && Server.getServerConfig().getHttpsPort() == metadata.port()) {
                // TODO remove this block if we never seen the following error.
                logger.error("******Kafka returns the same instance!");
                return NioUtils.toByteBuffer(getStatus(exchange, ENTITY_NOT_FOUND, email, country, province, city));
            } else {
                Result<String> resultEntity = HybridQueryClient.getEntity(exchange, url, email);
                if (resultEntity.isSuccess()) {
                    return NioUtils.toByteBuffer(resultEntity.getResult());
                }
            }
            return NioUtils.toByteBuffer(getStatus(exchange, ENTITY_NOT_FOUND, email, country, province, city));
        }
    }
}
