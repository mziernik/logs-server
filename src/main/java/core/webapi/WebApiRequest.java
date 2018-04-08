package core.webapi;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

public class WebApiRequest {

    private static Map<String, MethodMetaData> endpoints;
    public final int id;
    private final JsonObject json;
    public final WebApiSession session;

    public WebApiRequest(WebApiSession session, JsonElement jsonElement) {
        this.session = session;
        json = jsonElement.getAsJsonObject();
        id = json.get("id").getAsInt();
    }

    Object process() throws InvocationTargetException, IllegalAccessException {

        if (endpoints == null) {
            endpoints = new HashMap<>();
            for (Method method : session.endpoint.getClass().getMethods())
                endpoints.put(method.getName(), new MethodMetaData(method));
        }

        String methodName = json.get("method").getAsString();

        JsonObject jparams = json.getAsJsonObject("params");

        MethodMetaData meta = endpoints.get(methodName);

        if (meta == null)
            throw new RuntimeException("Method " + methodName + " not found");

        Object result = meta.invoke(this, jparams);

        return result;
    }
}
