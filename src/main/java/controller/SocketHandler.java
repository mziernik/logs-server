package controller;

import model.logs.Log;
import model.logs.handler.WebConsoleHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import utils.JsonBuilder;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class SocketHandler extends TextWebSocketHandler {

    private final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    @Autowired
    private WebConsoleHandler handler;

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message)
            throws InterruptedException, IOException {
        System.out.println(message);
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        synchronized (sessions) {
            sessions.add(session);
        }

        LinkedList<Log> logs = handler.getLogs();
        JsonBuilder json = new JsonBuilder();
        json.quotaNames = true;

        json.object(() -> {
            json.name("logs");
            json.array(() -> {
                for (Log log : logs)
                    log.toJson(json);
            });
        });

        session.sendMessage(new TextMessage(json.toString()));
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        exception.getStackTrace();
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        synchronized (sessions) {
            sessions.remove(session);
        }
    }

    public void publish(Log log) {

        if (sessions.isEmpty()) return;
        List<WebSocketSession> sessions;
        synchronized (this.sessions) {
            sessions = new ArrayList<>(this.sessions);
        }

        // LinkedList<Log> logs = handler.getLogs();
        JsonBuilder json = new JsonBuilder();
        json.quotaNames = true;
        json.object(() -> {
            json.name("logs");
            json.array(() -> log.toJson(json));
        });
        for (WebSocketSession session : sessions)
            try {
                session.sendMessage(new TextMessage(json.toString()));
            } catch (IOException e) {
                e.printStackTrace();
            }
    }
}