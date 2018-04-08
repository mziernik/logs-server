package core.webapi;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.lang.annotation.Annotation;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;

public class MethodMetaData {

    private final Method method;
    private final Class<?>[] parameterTypes;
    private final Annotation[][] parameterAnnotations;

    public MethodMetaData(Method method) {
        this.method = method;
        parameterTypes = method.getParameterTypes();
        parameterAnnotations = method.getParameterAnnotations();

    }

    public Object invoke(WebApiRequest request, JsonObject json) throws InvocationTargetException, IllegalAccessException {

        ArrayList<Object> params = new ArrayList<>();


        for (int i = 0; i < parameterTypes.length; i++) {
            Class<?> paramClass = parameterTypes[i];
            Annotation[] annotations = parameterAnnotations[i];


            if (paramClass == WebApiRequest.class) {
                params.add(request);
                continue;
            }

            if (paramClass == WebApiSession.class) {
                params.add(request.session);
                continue;
            }

            Arg arg = null;
            for (Annotation ann : annotations)
                if (ann.annotationType() == Arg.class) {
                    arg = (Arg) ann;
                    break;
                }


            if (arg != null) {
                JsonElement elm = json.get(arg.name());

                Object object = new GsonBuilder().create().fromJson(elm, paramClass);

                params.add(object);
                continue;
            }

            params.add(null);

        }


        return method.invoke(request.session.endpoint, params.toArray());
    }
}
