package model.logs;

import model.logs.handler.LogHandler;
import utils.JsonBuilder;

import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Consumer;

import static model.logs.LogAttr.*;
import static model.logs.LogKind.*;

public class Log {

    private final Logger logger;
    private final static AtomicInteger counter = new AtomicInteger(0);
    private final static RuntimeMXBean runtimeMXBean = ManagementFactory.getRuntimeMXBean();
    private Throwable exception;

    public final Map<LogAttr, LogEntry> entries = new LinkedHashMap<>();

    public static void log(LogKind kind, Object value) {
        new Log(kind, value, null).publish();
    }

    public static void log(LogKind kind, Consumer<Log> consumer) {
        new Log(kind, null, consumer).publish();
    }

    public static void trace(Object value) {
        log(TRACE, value);
    }

    public static void query(Object value) {
        log(QUERY, value);
    }

    public static void debug(Object value) {
        log(DEBUG, value);
    }

    public static void info(Object value) {
        log(INFO, value);
    }

    public static void warning(Object value) {
        log(ERROR, value);
    }

    public static void error(Object value) {
        log(ERROR, value);
    }

    public static void fatal(Object value) {
        log(ERROR, value);
    }

    private Log(LogKind kind, Object value, Consumer<Log> consumer) {
        this(Logger.DEFAULT, kind, value, consumer);
    }

    protected Log() {
        logger = null;
    }

    protected Log(Logger logger, LogKind kind, Object value, Consumer<Log> consumer) {

        this.logger = logger;
        synchronized (counter) {
            entry(COUNTER, counter.incrementAndGet());
        }

        entry(APPLICATION, logger.getApplicationName());
        entry(UPTIME, runtimeMXBean.getUptime());
        entry(INSTANCE, logger.getInstance());
        entry(MODE, logger.getMode());
        entry(LOCALE, logger.getLocale());
        entry(VERSION, logger.getVersion());
        entry(OS, logger.getOperatingSystem());
        entry(USER_NAME, logger.getUserName());
        entry(PROCESS_ID, logger.getProcessID());

        Class<?> ctx = logger.getContext();

        if (ctx != null) {
            entry(CLASS, ctx.getCanonicalName());
            entry(CONTEXT, ctx.getSimpleName());
        }

        entry(HOST_NAME, logger.getHostName());
        entry(DEVICE, logger.getDevice());

        Thread thread = Thread.currentThread();
        StackTraceElement[] stackTrace = thread.getStackTrace();

        String pckg = Log.class.getPackage().getName() + ".";

        for (int i = 2; i < stackTrace.length; i++) {
            StackTraceElement ste = stackTrace[i];
            String className = ste.getClassName();
            if (!className.startsWith(pckg)) {
                entry(METHOD, ste.toString().replace("(", " ("));
                if (get(CLASS) == null)
                    entry(CLASS, ste.getClassName());
                if (get(CONTEXT) == null) {
                    String c = ste.getClassName();
                    if (c != null && c.contains("."))
                        c = c.substring(c.lastIndexOf('.') + 1);
                    entry(CONTEXT, c);
                }
                break;
            }

        }


        entry(THREAD_ID, thread.getId());
        entry(THREAD_NAME, thread.getName());
        entry(THREAD_PRIORITY, thread.getPriority());

        entry(KIND, kind);
        entry(DATE, new Date());
        entry(CALL_STACK, buildStackTrace(stackTrace));


        if (consumer != null) {
            consumer.accept(this);
            Object val = get(VALUE);
            if (val != null)
                value = val;
        }
        if (exception == null && value instanceof Throwable)
            exception = (Throwable) value;


        if (exception != null) {
            if (value == null)
                value = exception.getLocalizedMessage();
            Throwable e = exception;
            String name = e.getClass().getSimpleName();
            if (name.endsWith("Exception"))
                name = name.substring(0, name.length() - "Exception".length());

            entry(CONTEXT, name);

            while (e.getCause() != null)
                e = e.getCause();

            entry(ERROR_STACK, buildStackTrace(e.getStackTrace()));
        }

        entry(VALUE, value);


    }

    private String[] buildStackTrace(StackTraceElement[] elements) {
        List<String> stack = new ArrayList<>();

        for (StackTraceElement ste : elements) {
            String line = ste.toString().replace("(", " (");

            for (String s : logger.packages)
                if (line.startsWith(s)) {
                    line = "*" + line;
                    break;
                }

            stack.add(line);
        }

        return stack.toArray(new String[0]);
    }


    public Object[] getAll(LogAttr attribute) {
        LogEntry en = entries.get(attribute);
        return en != null ? en.values.toArray(new Object[0]) : null;
    }

    public Object get(LogAttr attribute) {
        LogEntry en = entries.get(attribute);
        return en != null && !en.values.isEmpty() ? en.values.get(0) : null;
    }

    public Log clear(LogAttr attribute) {
       entries.remove(attribute);
       return this;
    }

    protected void publish() {
        LogHandler.dispatch(this);
    }


    protected Log entry(LogAttr attr, Object value) {

        LogEntry en = entries.get(attr);
        if (en == null) {
            en = new LogEntry(attr);
            entries.put(attr, en);
        }
        if (!attr.multiple)
            en.values.clear();

        en.values.add(value);
        return this;
    }


    public Log thread(Thread thread) {
        return entry(THREAD_ID, thread.getId())
                .entry(THREAD_NAME, thread.getName())
                .entry(THREAD_PRIORITY, thread.getPriority());
    }

    public Log processID(Long value) {
        return entry(PROCESS_ID, value);
    }

    public Log value(Object value) {
        return entry(VALUE, value);
    }

    public Log date(Date value) {
        return entry(DATE, value);
    }

    public Log address(Object value) {
        return entry(ADDRESS, value);
    }

    public Log version(Object value) {
        return entry(VERSION, value);
    }

    public Log operatingSystem(Object value) {
        return entry(OS, value);
    }

    public Log mode(AppMode value) {
        return entry(MODE, value);
    }

    public Log tag(Object value) {
        return entry(TAG, value);
    }

    public Log locale(Locale value) {
        return entry(LOCALE, value);
    }

    public Log context(Object value) {
        return entry(CONTEXT, value);
    }

    public Log application(Object value) {
        return entry(APPLICATION, value);
    }

    public Log method(Object value) {
        return entry(METHOD, value);
    }

    public Log className(Object value) {
        return entry(CLASS, value);
    }

    public Log comment(Object value) {
        return entry(COMMENT, value);
    }

    public Log color(Object value) {
        return entry(COLOR, value);
    }

    public Log url(Object value) {
        return entry(URL, value);
    }

    public Log background(Object value) {
        return entry(BACKGROUND, value);
    }

    public Log hostName(Object value) {
        return entry(HOST_NAME, value);
    }

    public Log userName(Object value) {
        return entry(USER_NAME, value);
    }

    public Log userAgent(Object value) {
        return entry(USER_AGENT, value);
    }

    public Log device(Object value) {
        return entry(DEVICE, value);
    }

    public Log attribute(Object value) {
        return entry(ATTRIBUTE, new Object[]{value});
    }

    public Log attribute(String name, Object value) {
        return entry(ATTRIBUTE, new Object[]{name, value});
    }

    public Log attribute(String group, String name, Object value) {
        return entry(ATTRIBUTE, new Object[]{group, name, value});
    }

    public Log data(String name, Object value) {
        return entry(DATA, new Object[]{name, value});
    }

    public Log exception(Throwable value) {
        this.exception = value;
        return this;
    }

    public void toJson(JsonBuilder json) {
        json.object(() -> {
            for (LogEntry en : entries.values())
                en.toJson(json);
        });
    }
}

