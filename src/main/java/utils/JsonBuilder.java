package utils;

import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.nio.charset.Charset;

public class JsonBuilder {

    private final StringWriter wr = new StringWriter();
    private boolean newObj = true;
    public boolean quotaNames;

    public final byte[] getBytes() {
        return toString().getBytes(Charset.forName("UTF-8"));
    }

    @Override
    public String toString() {
        return wr.toString();
    }

    public JsonBuilder write(String str) {
        wr.append(str);
        return this;
    }

    public JsonBuilder object(Runnable intf) {
        obj('{');
        intf.run();
        obj('}');
        return this;
    }

    public JsonBuilder array(Runnable intf) {
        obj('[');
        intf.run();
        obj(']');
        return this;
    }

    private JsonBuilder obj(char ch) {
        if (ch != '}' && ch != ']' && ch != '{' && ch != '[')
            throw new RuntimeException("Invalid character \"" + ch + "\"");
        boolean no = ch == '{' || ch == '[';
        if (no && !newObj)
            wr.append(",");
        wr.append(ch);
        newObj = no;
        return this;
    }
    /*
     public JsonBuilder value(LogElement.LogAttr at, Object value) throws IOException {
     if (at.value == null)
     return this;
     return name(at.key).value(at.value, at.maxLength);
     }
     */

    public JsonBuilder pair(String name, Object value) {
        return pair(name, value, 0);
    }

    public JsonBuilder pair(String name, Object value, int maxLen) {
        if (value != null && !value.toString().isEmpty())
            name(name).value(value, maxLen);
        return this;
    }

    public JsonBuilder name(String str) {
        if (!newObj)
            wr.append(",");
        if (quotaNames) wr.append('"');
        wr.append(str);
        if (quotaNames) wr.append('"');
        wr.append(":");
        newObj = true;
        return this;
    }

    public JsonBuilder nameEsc(String str) {
        if (!newObj)
            wr.append(",");
        wr.append("\"");
        escapeJson(wr, str);
        wr.append("\":");
        newObj = true;
        return this;
    }

    public JsonBuilder value(Object value) {
        return value(value, 0);
    }

    public JsonBuilder value(Object value, int maxLen) {

        if (!newObj)
            wr.append(",");
        newObj = false;

        if (value == null) {
            wr.append("null");
            return this;
        }

        String str = value.toString();

        if (maxLen > 0 && str.length() > maxLen)
            str = str.substring(0, maxLen - 3) + "[…]";

        if (value instanceof Boolean || value instanceof Number)
            wr.append(str);
        else {
            wr.append("\"");
            escapeJson(wr, str);
            wr.append("\"");
        }
        return this;
    }

    private static void escapeJson(Writer wr, String string) {
        if (string == null || string.length() == 0)
            return;
        char b;
        char c = 0;
        String hhhh;
        int i;
        int len = string.length();

        for (i = 0; i < len; i += 1)
            try {
                b = c;
                c = string.charAt(i);
                switch (c) {
                    case '\\':
                    case '"':
                        wr.append('\\');
                        wr.write(c);
                        break;
                    case '/':
                        if (b == '<')
                            wr.write('\\');
                        wr.write(c);
                        break;
                    case '\b':
                        wr.write("\\b");
                        break;
                    case '\t':
                        wr.write("\\t");
                        break;
                    case '\n':
                        wr.write("\\n");
                        break;
                    case '\f':
                        wr.write("\\f");
                        break;
                    case '\r':
                        wr.write("\\r");
                        break;
                    default:
                        if (c < ' ' || (c >= '\u0080' && c < '\u00a0')
                                || (c >= '\u2000' && c < '\u2100')) {
                            wr.write("\\u");
                            hhhh = Integer.toHexString(c);
                            wr.write("0000", 0, 4 - hhhh.length());
                            wr.write(hhhh);
                        } else
                            wr.write(c);
                }
            } catch (IOException ex) {
            }
    }
}
