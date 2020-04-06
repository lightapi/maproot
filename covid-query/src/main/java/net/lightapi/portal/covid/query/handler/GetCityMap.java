
package net.lightapi.portal.covid.query.handler;

import com.networknt.httpstring.AttachmentConstants;
import com.networknt.utility.NioUtils;
import com.networknt.rpc.Handler;
import com.networknt.rpc.router.ServiceHandler;
import java.nio.ByteBuffer;
import java.util.Map;

import io.undertow.server.HttpServerExchange;
import net.lightapi.portal.covid.query.CovidQueryStartup;
import org.apache.kafka.streams.state.ReadOnlyKeyValueStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ServiceHandler(id="lightapi.net/covid/getCityMap/0.1.0")
public class GetCityMap implements Handler {
    private static final Logger logger = LoggerFactory.getLogger(GetCity.class);
    static final String CITY_NOT_FOUND = "ERR11623";

    @Override
    public ByteBuffer handle(HttpServerExchange exchange, Object input)  {
        if(logger.isTraceEnabled()) logger.trace("input = " + input);
        Map<String, String> map = (Map<String, String>)input;
        String country = map.get("country");
        String province = map.get("province");
        String city = map.get("city");
        String category = map.get("category");
        String subcategory = map.get("subcategory");

        String key = country + "|" + province + "|" + city + "|" + category;
        if(subcategory != null) key = key + "|" + subcategory;
        ReadOnlyKeyValueStore<String, String> keyValueStore = CovidQueryStartup.streams.getMapStore();
        String data = keyValueStore.get(key);
        if(data != null) {
            return NioUtils.toByteBuffer(data);
        } else {
            return NioUtils.toByteBuffer(getStatus(exchange, CITY_NOT_FOUND, country, province, city));
        }
    }
}
