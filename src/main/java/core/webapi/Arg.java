package core.webapi;

import java.lang.annotation.*;

@Inherited
@Target(value = {ElementType.TYPE, ElementType.PARAMETER, ElementType.FIELD})
@Retention(value = RetentionPolicy.RUNTIME)
public @interface Arg {

     String name(); //nazwa argumentu

     boolean nonEmpty() default true;

     boolean required() default true;

     String def() default DEF_EMPTY; // wartość domyślna

     String DEF_EMPTY = "{CC45B3C5-3479-4536-A5BB-9ED0A29A748}";

}
/*
    public static class ArgMeta {

        public final Field field;
        public final Arg ann;
        public final TClass<?> cls;
        public final Type type;
        public final String shortTypeName;
        public final Method method;
        public final int index;
        public final String name;
        public final boolean required;
        public final boolean nonEmpty;
        public final String defaultValue;

        public final String fullName;
        private Class<?> genericClass;

        public ArgMeta(Field field, Class<?> type, Arg ann) {
            this.ann = ann;
            this.field = field;
            this.cls = new TClass<>(type, field.getGenericType());
            this.nonEmpty = ann.required() && ann.nonEmpty();
            this.required = nonEmpty || ann.required();
            this.defaultValue = Arg.DEF_EMPTY.equals(ann.def()) ? null : ann.def();
            this.type = field.getGenericType();
            this.name = ann.name();
            method = null;
            index = -1;
            this.fullName = field.getDeclaringClass().getName() + "." + field.getName();
            this.shortTypeName = getShortTypeName(this.type.getTypeName());
            verify();
        }

        public ArgMeta(Method method, Parameter param, int index) {
            this.ann = param.getAnnotation(Arg.class);
            this.nonEmpty = ann != null ? ann.required() && ann.nonEmpty() : true;
            this.required = nonEmpty || (ann != null ? ann.required() : true);
            this.defaultValue = ann == null || Arg.DEF_EMPTY.equals(ann.def()) ? null : ann.def();
            this.field = null;
            this.cls = new TClass<>(param.getType(), param.getParameterizedType());
            this.type = param.getParameterizedType();
            this.method = method;
            this.fullName = method.getDeclaringClass().getName() + "." + method.getName();
            this.name = ann != null ? ann.name() : cls.raw.getSimpleName().toLowerCase() + (index + 1);
            this.index = index;
            this.shortTypeName = getShortTypeName(this.type.getTypeName());
            if (ann != null)
                verify();
        }

        private static String getShortTypeName(String tname) {

            Strings list = new Strings();
            for (String s : tname.replace("<", ",").replace(">", ",").split("\\,")) {
                s = s.trim();
                if (s.isEmpty())
                    continue;
                if (s.contains("."))
                    s = s.substring(s.lastIndexOf(".") + 1);
                list.add(s);
            }

            String result = list.first(true);

            if (!list.isEmpty())
                result += "<" + list.toString(", ") + ">";

            return result;
        }

        private void verify() {

            if (cls.isPrimitive())
                throw new CoreException((field != null
                        ? "Pole [" + cls.raw.getSimpleName() + "] " + fullName
                        : "Argument [" + cls.raw.getSimpleName() + "] metody " + fullName)
                        + " nie może być typu prymitywnego");

            if (!TypeAdapter.isSupporterd(cls.raw))
                throw new CoreException((field != null
                        ? "Pole [" + cls.raw.getSimpleName() + "] " + fullName
                        : "Argument [" + cls.raw.getSimpleName() + "] metody " + fullName)
                        + " nie może być zdeserializowany(e)");

            if (!cls.instanceOf(Collection.class)
                    && !cls.raw.isArray()
                    && field != null
                    && new TField(field).isFinal()
                    && cls.isSimple())
                throw new CoreException(
                        "Pole [" + cls.raw.getSimpleName() + "] " + fullName
                        + " nie może być finalne");
        }

        private String methodName(String methodName) {
            return ((Is.empty(methodName) ? "" : "\"" + methodName + "\"")
                    + (CService.devMode() ? " (" + fullName + ")" : "")).trim();
        }

        public Object toObject(Object value, String methodName, Object instance) {

            if (value == null && defaultValue != null)
                value = defaultValue;

            if (required && value == null)
                throw new ServiceException(String.format("Brak argumentu \"%s\" metody %s",
                        name, methodName(methodName)));

            if (nonEmpty && Is.empty(value))
                throw new ServiceException(String.format("Wartość argumentu \"%s\" metody %s nie może być pusta",
                        name, methodName(methodName)));

            Object result;
            try {
                result = cls.deserialize(value, instance);
            } catch (Throwable e) {
                throw new ServiceException(String.format(
                        "Nieprawidłowa wartość (%s) argumentu \"%s\" metody %s",
                        JSON.serialize(value).toString(), name, methodName(methodName))
                , e);
            }

            if (result == null && required)
                throw new ServiceException(String.format(
                        "Argument \"%s\" metody %s nie może być null-em",
                        name, methodName(methodName)));
            return result;
        }

    }
*/

