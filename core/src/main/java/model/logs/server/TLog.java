package model.logs.server;


import model.logs.Log;
import model.logs.LogAttr;

import java.net.InetSocketAddress;
import java.util.concurrent.atomic.AtomicInteger;

public class TLog extends Log {

    private final static AtomicInteger counter = new AtomicInteger(0);

    public LogProtocol protocol;
    public InetSocketAddress address;

    public TLog(LogServer server, InetSocketAddress address) {
        this.protocol = server.protocol;
        this.address = address;

        synchronized (counter) {
            entry(LogAttr.COUNTER, counter.incrementAndGet());
        }
    }

    @Override
    public void publish() {
        super.publish();
    }

    public Log entry(LogAttr attr, Object value) {
        return super.entry(attr, value);
    }
}
