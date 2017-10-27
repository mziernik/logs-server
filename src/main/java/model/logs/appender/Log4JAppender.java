package model.logs.appender;

import model.logs.Log;
import model.logs.LogAttr;
import model.logs.LogKind;
import org.apache.log4j.AppenderSkeleton;
import org.apache.log4j.Level;
import org.apache.log4j.spi.LoggingEvent;

import java.util.*;

public class Log4JAppender extends AppenderSkeleton {

    private String hosts;

    public Log4JAppender() {
        super(true);
        setThreshold(Level.ALL);
        activateOptions();
    }

    public String getHosts() {
        return hosts;
    }

    // wymagane do wstrzyknięcia zależności przez Log4J
    public void setHosts(String hosts) {
        this.hosts = hosts;
    }


    @Override
    protected void append(LoggingEvent event) {

        LogKind kind = LogKind.TRACE;

        Level level = event.getLevel();
        if (level == Level.DEBUG) kind = LogKind.DEBUG;
        if (level == Level.INFO) kind = LogKind.INFO;
        if (level == Level.WARN) kind = LogKind.WARNING;
        if (level == Level.ERROR) kind = LogKind.ERROR;
        if (level == Level.FATAL) kind = LogKind.FATAL;


        Log.log(kind, log -> {
            log.date(new Date(event.timeStamp));
            if (event.getThrowableInformation() != null)
                log.exception(event.getThrowableInformation().getThrowable());

            log.clear(LogAttr.CONTEXT);

            String ctx = event.getLoggerName();

            if (ctx != null && ctx.contains("."))
                ctx = ctx.substring(ctx.lastIndexOf(".") + 1);
            log.context(ctx);
            log.className(event.getLoggerName());
            log.value(event.getRenderedMessage());

            Map props = event.getProperties();
            if (props != null)
                for (Object o : props.entrySet())
                    if (o instanceof Map.Entry) {
                        Map.Entry en = (Map.Entry) o;
                        log.attribute(Objects.toString(en.getKey()), Objects.toString(en.getValue()));
                    }

        });

    }

    public void close() {

    }

    public boolean requiresLayout() {
        return false;
    }

}

