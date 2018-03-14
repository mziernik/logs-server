package model.logs.handler;

import model.logs.Log;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Consumer;

public abstract class LogHandler {

    final static Set<LogHandler> handlers = new LinkedHashSet<>();
    private final static List<Consumer<Log>> beforeDispatchConsumers = new ArrayList<>();

    public void register() {
        synchronized (handlers) {
            handlers.add(this);
        }
    }

    protected abstract void publish(Log log);

    public static void onBeforeDispatch(Consumer<Log> consumer) {
        synchronized (beforeDispatchConsumers) {
            beforeDispatchConsumers.add(consumer);
        }
    }

    public static void dispatch(Log log) {
        synchronized (beforeDispatchConsumers) {
            for (Consumer<Log> consumer : beforeDispatchConsumers)
                consumer.accept(log);
        }
        synchronized (handlers) {
            for (LogHandler handler : handlers)
                try {
                    handler.publish(log);
                } catch (Throwable e) {
                    e.printStackTrace();
                }
        }
    }
}
