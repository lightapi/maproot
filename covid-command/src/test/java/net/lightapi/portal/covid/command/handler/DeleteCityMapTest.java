
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
import org.junit.Ignore;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xnio.IoUtils;
import org.xnio.OptionMap;

import java.net.URI;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicReference;

@Ignore
public class DeleteCityMapTest {
    @ClassRule
    public static TestServer server = TestServer.getInstance();

    static final Logger logger = LoggerFactory.getLogger(DeleteCityMap.class); 
    static final boolean enableHttp2 = server.getServerConfig().isEnableHttp2();
    static final boolean enableHttps = server.getServerConfig().isEnableHttps();
    static final int httpPort = server.getServerConfig().getHttpPort();
    static final int httpsPort = server.getServerConfig().getHttpsPort();
    static final String url = enableHttp2 || enableHttps ? "https://localhost:" + httpsPort : "http://localhost:" + httpPort;

    @Test
    public void testDeleteCityMap() throws ClientException, ApiException {
        final Http2Client client = Http2Client.getInstance();
        final CountDownLatch latch = new CountDownLatch(1);
        final ClientConnection connection;
        try {
            connection = client.connect(new URI(url), Http2Client.WORKER, Http2Client.SSL, Http2Client.BUFFER_POOL, enableHttp2 ? OptionMap.create(UndertowOptions.ENABLE_HTTP2, true): OptionMap.EMPTY).get();
        } catch (Exception e) {
            throw new ClientException(e);
        }
        final AtomicReference<ClientResponse> reference = new AtomicReference<>();
        String s = "{\"host\":\"lightapi.net\",\"service\":\"covid\",\"action\":\"deleteCityMap\",\"version\":\"0.1.0\",\"data\":{\"country\":\"CAN\",\"province\":\"ON\",\"city\":\"Mississauga\"}}";
        try {
            ClientRequest request = new ClientRequest().setPath("/portal/command").setMethod(Methods.POST);
            request.getRequestHeaders().put(Headers.CONTENT_TYPE, "application/json");
            request.getRequestHeaders().put(Headers.AUTHORIZATION, "Bearer eyJraWQiOiIxMDAiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJ1cm46Y29tOm5ldHdvcmtudDpvYXV0aDI6djEiLCJhdWQiOiJ1cm46Y29tLm5ldHdvcmtudCIsImV4cCI6MTkwMDE3MDQ3OSwianRpIjoiZ2R2OUNsOGJyR0dUQWhVbjVsZnhfUSIsImlhdCI6MTU4NDgxMDQ3OSwibmJmIjoxNTg0ODEwMzU5LCJ2ZXJzaW9uIjoiMS4wIiwidXNlcl9pZCI6InN0ZXZlaHVAZ21haWwuY29tIiwidXNlcl90eXBlIjoiRU1QTE9ZRUUiLCJjbGllbnRfaWQiOiJmN2Q0MjM0OC1jNjQ3LTRlZmItYTUyZC00YzU3ODc0MjFlNzIiLCJyb2xlcyI6InVzZXIgbGlnaHRhcGkubmV0IGFkbWluIiwic2NvcGUiOlsicG9ydGFsLnIiLCJwb3J0YWwudyJdfQ.rZOj27je8e6HEb1XvIm34zDjVUUaBUHXqvTyQWnw2va1Xbe2_6nX0hk7VqNpdIWUL5-4tcdyQ4iVVGtEpZWIhY9s2vtoL2Zsc1e5WxViqZ8cJ00zyTU1aeOuXjVWyOc2HC754xLl4WS0se6TEpi8Xs5gVrczaNvuvnrVns1KC2q_0cN574EGmT8Fbi3EP3j_kMVXf_m7NdxaV2PREbY_bejlgqsH6bWE0CSIgt4olAlgIZUHifZ7mFElXdek7MZ2ywaAitmoyMWYgUhPzoX_EYcCgrusU2KrOFfm-9CGwZ1Wf2LGawfbcnBDRjW28pzzBaHINADXrYOV8cy7NWGEZg");
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
        System.out.println("body = " + body);
        Assert.assertEquals(200, statusCode);
        Assert.assertNotNull(body);
        // wait for 5 seconds for the producer to flush to Kafka.
        try {Thread.sleep(5000); } catch (Exception e) {}
    }
}
