package core.webapi;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.springframework.web.socket.CloseStatus;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;

public class WebApiSession<SESSION> {

    private final SESSION rawSession;
    final AbstractWebApiConnector<SESSION, ?> connector;
    final AbstractWebApiEndpoint endpoint;


    WebApiSession(AbstractWebApiConnector<SESSION, ?> connector, SESSION rawSession) {
        this.rawSession = rawSession;
        this.connector = connector;
        this.endpoint = connector.endpointSupplier.apply(this);
    }

    protected void onClose(CloseStatus status) {

    }

    protected void onError(Throwable exception) {

    }

    public void onMessage(String message) {

    }

    public void sendMessage(String message) throws IOException {
        connector.sendMessage(rawSession, message);
    }

    public void process(String message) {
        WebApiRequest req = null;
        try {
            JsonElement jsonElement = new JsonParser().parse(message);
            req = new WebApiRequest(this, jsonElement);

            Object result = req.process();

            response(req, result, null);

        } catch (Throwable e) {
            e.printStackTrace();
            response(req, null, e);
        }

    }

    void response(WebApiRequest req, Object result, Throwable ex) {


        while (ex instanceof InvocationTargetException)
            ex = ex.getCause();

        if (ex != null)
            result = ex.getLocalizedMessage();

        JsonObject json = new JsonObject();
        json.addProperty("id", req.id);
        json.addProperty("error", ex != null);
        json.add("data", result == null || result instanceof Void ? null : new GsonBuilder().create().toJsonTree(result));


        try {
            sendMessage(json.toString());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

  /*


        if (req != null)
            requests.remove(req.id);
        JObject obj = new JObject();
        ErrorMessage error = null;
        try {

            boolean compact = http == null || (!AppContext.devMode && CService.releaseMode());

            if (result instanceof Repository)
                result = ((Repository) result).getJson(true, true);

            if (result instanceof Repository[]) {
                JArray arr = new JArray();
//                for (Repository ds : (Repository[]) result)
//                    ds.getJson(arr.object());
                result = arr;
            }

            if (!compact && result instanceof JArray)
                for (JArray arr : ((JArray) result).getArrays())
                    arr.options.singleLine(true);

            obj.options.compactMode(http == null || (!AppContext.devMode && CService.releaseMode()));

            obj.put("event", false);
            obj.put("mode", CService.mode.value().name().toLowerCase());
            obj.put("date", new TDate().getTime());
            obj.put("lang", language.get().key);
            //  obj.put("mode", CService.mode.value().name().toLowerCase());

            obj.put("id", requestId);

            String hash = null;
            if (req != null) {
                obj.put("lang", req.language.key);
                obj.put("duration", System.currentTimeMillis() - req.created.getTime());
                obj.put("endpoint", req.endpointName);
                if (req.meta != null)
                    hash = req.meta.hash;

                obj.put("headers", req.responseHeaders);
            }

            obj.put("hash", getHash() + (hash != null ? "/" + hash : ""));

            obj.put("error", ex != null);

            if (ex != null) {
                error = EError.format(ex);
                Strings det = new Strings();

                for (Map.Entry<String, String> en : error.details.entrySet())
                    if (!Is.empty(en.getValue()))
                        det.add((!Is.empty(en.getKey()) ? en.getKey() + ": " : "") + en.getValue());

                if (CService.devMode() || CService.testMode())
                    det.add("Exception:\n" + EError.exceptionToStr(ex, true));

                obj.put("critical", error.critical);

                obj.arrayC("messages")
                        .object()
                        .put("title", error.title)
                        .put("value", error.message)
                        .put("details", det.toString(", "))
                        .put("type", "error");

                if (http != null) {
                    http.setNoChacheHeader();
                    http.setStatus(EError.getHttpStatus(ex));
                    http.returnCustom(obj.toString(), "application/json; charset=UTF-8");
                } else
                    send(obj.toString());

                return;

            }

            if (req != null)
                obj.arrayC("messages").addAll(req.jMessages.getObjects());

            if (result instanceof CachedData) {

                CachedData cd = (CachedData) result;
                JObject jfile = obj.objectC("file");
                jfile.add("id", cd.key);
                jfile.add("url", CHttp.url(req != null ? req.url : null, cd.key, null).toString());
                jfile.add("name", cd.retrunName);
                jfile.add("mimeType", cd.mimeType);
                jfile.add("size", cd.length());
                jfile.add("expire", cd.getLeaveTime() / 1000);
                result = null;
            }

            obj.put("data", result instanceof Void ? null : result);

            if (http != null) {
                if (req != null) {
                    http.contentDisposition.setHeader(
                            StrUtils.formatFileName(req.endpointName.replace("/", "-")) + ".json");
                    http.contentDisposition.inline = true;
                }
                http.returnJson(obj);
            } else
                send(obj.toString());

        } finally {
            logResponse(req, wsConn, http, obj, error);
        }

    }
*/

