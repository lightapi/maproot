package net.lightapi.portal.covid.query;

import com.networknt.server.Server;
import com.networknt.server.StartupHookProvider;
import com.networknt.utility.NetUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This is the startup hook for covid-query to start the CovidQueryStreams. It is a static variable and can
 * be accessed from the entire application.
 *
 * @author Steve Hu
 */
public class CovidQueryStartup implements StartupHookProvider {
    static final Logger logger = LoggerFactory.getLogger(CovidQueryStartup.class);
    public static CovidQueryStreams streams = null;
    @Override
    public void onStartup() {
        int port = Server.getServerConfig().getHttpsPort();
        String ip = NetUtils.getLocalAddressByDatagram();
        logger.info("ip = " + ip + " port = " + port);
        streams = new CovidQueryStreams();
        // start the kafka stream process
        streams.start(ip, port);
    }
}
