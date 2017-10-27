package model.logs.handler;

import controller.SocketHandler;
import model.logs.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedList;

@Service
public class WebConsoleHandler extends LogHandler {

    private final LinkedList<Log> logs = new LinkedList<>();

    @Autowired
    SocketHandler socket;


    WebConsoleHandler() {
        register();
    }

    @Override
    public void publish(Log log) {
        synchronized (logs) {
            logs.add(log);
            while (logs.size() > 10_000)
                logs.pollFirst();
        }
        socket.publish(log);
    }

    public LinkedList<Log> getLogs() {
        synchronized (logs) {
            return new LinkedList<>(logs);
        }
    }
}


