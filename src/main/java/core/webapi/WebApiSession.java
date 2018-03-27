package core.webapi;

import com.google.gson.*;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

public class WebApiSession {

    private final Object rawSession;
    private final AbstractWebApiConnector connector;

    WebApiSession(AbstractWebApiConnector connector, Object rawSession) {
        this.rawSession = rawSession;
        this.connector = connector;
    }

    protected void onClose(CloseStatus status) {

    }

    protected void onError(Throwable exception) {

    }

    public void onMessage(String message) {

    }

    public void process(WebSocketSession session, String message) {
        try {
            JsonElement jsonElement = new JsonParser().parse(message);

            JsonObject json = jsonElement.getAsJsonObject();

            int id = json.get("id").getAsInt();

            String methodName = json.get("method").getAsString();

            JsonArray jparams = json.getAsJsonArray("params");


            for (Method method : connector.endpoint.getClass().getMethods()) {
                if (!method.getName().equals(methodName)) continue;

                List<Object> params = new ArrayList<>();

                int idx = 0;

                for (Class<?> paramClass : method.getParameterTypes()) {

                    if (paramClass == WebApiSession.class) {
                        params.add(this);
                        continue;
                    }

                    JsonElement elm = jparams.get(idx++);

                    Object object = new GsonBuilder().create().fromJson(elm, paramClass);

                    params.add(object);

                }

                Object result = method.invoke(connector.endpoint, params.toArray());

                String jsonResult = new GsonBuilder().create().toJson(result).toString();

                return;
            }
        } catch (Throwable e) {

        }

    }
}
