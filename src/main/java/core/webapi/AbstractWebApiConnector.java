package core.webapi;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.function.Supplier;

public abstract class AbstractWebApiConnector<SESSION, ENDPOINT extends AbstractWebApiEndpoint> {

    final Function<WebApiSession<SESSION>, ENDPOINT> endpointSupplier;
    private final Map<SESSION, WebApiSession> sessions = new LinkedHashMap<>();


    public AbstractWebApiConnector(Function<WebApiSession<SESSION>, ENDPOINT> endpoint) {
        this.endpointSupplier = endpoint;
    }

    public void onConnect(SESSION session) {


        synchronized (sessions) {
            sessions.put(session, new WebApiSession(this, session));
        }
    }

    public void onClose(SESSION session, CloseStatus status) {
        WebApiSession ses;
        synchronized (sessions) {
            ses = sessions.remove(session);
        }
        if (ses != null)
            ses.onClose(status);

    }


    public void onError(SESSION session, Throwable exception) {
        WebApiSession ses;
        synchronized (sessions) {
            ses = sessions.get(session);
        }
        if (ses != null)
            ses.onError(exception);
    }

    public abstract void close(SESSION session, CloseStatus status) throws IOException;

    public abstract void sendMessage(SESSION session, String message) throws IOException;

    public void onMessage(SESSION session, String message) {
        WebApiSession ses;
        synchronized (sessions) {
            ses = sessions.get(session);
        }
        if (ses == null) return;
        ses.process( message);
    }
}
