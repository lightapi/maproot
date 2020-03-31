package net.lightapi.portal.covid.query;

import com.networknt.server.ShutdownHookProvider;

/**
 * close the CovidQueryStreams in the startup hook as it is a public static variable.
 *
 * @author Steve Hu
 */
public class CovidQueryShutdown implements ShutdownHookProvider {
    @Override
    public void onShutdown() {
        if(CovidQueryStartup.streams != null) CovidQueryStartup.streams.close();
    }
}
