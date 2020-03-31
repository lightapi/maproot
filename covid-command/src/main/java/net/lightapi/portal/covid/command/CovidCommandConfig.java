package net.lightapi.portal.covid.command;

public class CovidCommandConfig {
    public static final String CONFIG_NAME = "covid-command";

    String topic;

    public CovidCommandConfig() {
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }
}
