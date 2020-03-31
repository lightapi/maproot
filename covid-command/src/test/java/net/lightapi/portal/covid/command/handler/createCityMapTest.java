
package net.lightapi.portal.covid.command.handler;

import com.networknt.client.Http2Client;
import com.networknt.exception.ApiException;
import com.networknt.exception.ClientException;
import io.undertow.UndertowOptions;
import io.undertow.client.ClientConnection;
import io.undertow.client.ClientRequest;
import io.undertow.client.ClientResponse;
import io.undertow.util.Headers;
import io.undertow.util.Methods;
import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xnio.IoUtils;
import org.xnio.OptionMap;

import java.net.URI;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicReference;

public class createCityMapTest {
    @ClassRule
    public static TestServer server = TestServer.getInstance();

    static final Logger logger = LoggerFactory.getLogger(CreateCityMap.class);
    static final boolean enableHttp2 = server.getServerConfig().isEnableHttp2();
    static final boolean enableHttps = server.getServerConfig().isEnableHttps();
    static final int httpPort = server.getServerConfig().getHttpPort();
    static final int httpsPort = server.getServerConfig().getHttpsPort();
    static final String url = enableHttp2 || enableHttps ? "https://localhost:" + httpsPort : "http://localhost:" + httpPort;

    @Test
    public void testcreateCityMap() throws ClientException, ApiException {
        final Http2Client client = Http2Client.getInstance();
        final CountDownLatch latch = new CountDownLatch(1);
        final ClientConnection connection;
        try {
            connection = client.connect(new URI(url), Http2Client.WORKER, Http2Client.SSL, Http2Client.BUFFER_POOL, enableHttp2 ? OptionMap.create(UndertowOptions.ENABLE_HTTP2, true): OptionMap.EMPTY).get();
        } catch (Exception e) {
            throw new ClientException(e);
        }
        final AtomicReference<ClientResponse> reference = new AtomicReference<>();
        final String s = "{\"host\":\"lightapi.net\",\"service\":\"covid\",\"action\":\"createCityMap\",\"version\":\"0.1.0\",\"data\":{\"country\":\"Canada\",\"province\":\"ON\",\"city\":\"Mississauga\",\"latitude\":\"43.593466\",\"longitude\":\"-79.642362\",\"zoom\":10}}";
        try {
            ClientRequest request = new ClientRequest().setPath("/api/json").setMethod(Methods.POST);
            request.getRequestHeaders().put(Headers.CONTENT_TYPE, "application/json");
            request.getRequestHeaders().put(Headers.AUTHORIZATION, "Bearer eyJraWQiOiIxMDAiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJ1cm46Y29tOm5ldHdvcmtudDpvYXV0aDI6djEiLCJhdWQiOiJ1cm46Y29tLm5ldHdvcmtudCIsImV4cCI6MTkwMDk3NDEyOSwianRpIjoiQmVzOC1BY2c4VW80aVo4cDJDQ2MxUSIsImlhdCI6MTU4NTYxNDEyOSwibmJmIjoxNTg1NjE0MDA5LCJ2ZXJzaW9uIjoiMS4wIiwidXNlcl9pZCI6InN0ZXZlaHVAZ21haWwuY29tIiwidXNlcl90eXBlIjoiRU1QTE9ZRUUiLCJjbGllbnRfaWQiOiJmN2Q0MjM0OC1jNjQ3LTRlZmItYTUyZC00YzU3ODc0MjFlNzIiLCJyb2xlcyI6InVzZXIgbGlnaHRhcGkubmV0IGFkbWluIiwic2NvcGUiOlsicG9ydGFsLnIiLCJwb3J0YWwudyJdfQ.oZIeXGvhpT9IstuFMjgtnxegwBPwtjGdggG15b9EmkfcFW3gW9tiIDHOTc72tf6Brt-WtKw9lhk6tqzOusBgALrqqUG_cSi4r9qwh4AxkF-N7LNjHqvZhQS1NLmx3WlvAjWPIeMN-gUt9QhvJd8GusG15O8cy_0myltsGl0cl-w1ZOlFtk_viP6vvainDk4BjQ9XyaKEzS4W9qGjAynjCd5SaZsYLm4n4WTcU_Y15LaUNbOMgCZ1Q7qa2_y1gjlvU3GCRHdIi_Wz5mdFbr5XJEVQpM0kWs9V7Ipz34-OsDkioYE0MyIBwo7bXHLhWY90K2xLvTbDuzKaVDA-65AXEg");
            request.getRequestHeaders().put(Headers.TRANSFER_ENCODING, "chunked");
            connection.sendRequest(request, client.createClientCallback(reference, latch, s));
            latch.await();
        } catch (Exception e) {
            logger.error("Exception: ", e);
            throw new ClientException(e);
        } finally {
            IoUtils.safeClose(connection);
        }
        int statusCode = reference.get().getResponseCode();
        String body = reference.get().getAttachment(Http2Client.RESPONSE_BODY);
        Assert.assertEquals(200, statusCode);
        Assert.assertNotNull(body);
        // wait for 5 seconds for the producer to flush to Kafka.
        try {Thread.sleep(5000); } catch (Exception e) {}
    }
}
