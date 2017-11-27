package model.logs;

import java.lang.management.ManagementFactory;
import java.net.InetAddress;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

import static model.logs.LogKind.*;

public class Logger {

    public final static Logger DEFAULT = new Logger();
    final Set<String> packages = new HashSet<>();
    private String instance;
    private final Class<?> context;
    private String applicationName;
    private AppMode mode = AppMode.DEV;
    private Locale locale = Locale.getDefault();
    private String version;
    private String operatingSystem;
    private String userName;
    private String hostName;
    private String device;
    private long processID;


    private Logger() {
        context = null;
        String name = ManagementFactory.getRuntimeMXBean().getName();
        instance = name + "-" + new SimpleDateFormat("yyMMddHHmmss").format(new Date());

        if (name.contains("@"))
            try {
                processID = Long.parseLong(name.substring(0, name.indexOf("@")));
            } catch (Throwable e) {
                e.printStackTrace();
            }


        operatingSystem = System.getProperty("os.name") + ", " + System.getProperty("os.arch");
        try {
            hostName = InetAddress.getLocalHost().getHostName();
        } catch (Throwable e) {
            e.printStackTrace();
        }

    }

    public Logger(Class<?> context) {
        this.context = context;
        this.packages.addAll(DEFAULT.packages);

        this.instance = DEFAULT.instance;
        this.processID = DEFAULT.processID;
        this.applicationName = DEFAULT.applicationName;
        this.hostName = DEFAULT.hostName;
        this.device = DEFAULT.device;
        this.locale = DEFAULT.locale;
        this.version = DEFAULT.version;
        this.operatingSystem = DEFAULT.operatingSystem;
        this.mode = DEFAULT.getMode();
    }

    public void addProjectPackage(String pckg) {
        if (pckg == null) return;
        pckg = pckg.trim();
        if (pckg.isEmpty()) return;
        if (!pckg.endsWith("."))
            pckg += ".";
        packages.add(pckg);
    }


    public void setApplicationName(String applicationName) {
        this.applicationName = applicationName;
    }

    public String getApplicationName() {
        return applicationName;
    }

    public void setHostName(String hostName) {
        this.hostName = hostName;
    }

    public String getHostName() {
        return hostName;
    }

    public void setDevice(String device) {
        this.device = device;
    }

    public String getDevice() {
        return device;
    }

    public Class<?> getContext() {
        return context;
    }


    public AppMode getMode() {
        return mode;
    }

    public void setMode(AppMode mode) {
        this.mode = mode;
    }

    public Locale getLocale() {
        return locale;
    }

    public void setLocale(Locale locale) {
        this.locale = locale;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getOperatingSystem() {
        return operatingSystem;
    }

    public void setOperatingSystem(String operatingSystem) {
        this.operatingSystem = operatingSystem;
    }

    public String getUserName() {
        return userName;
    }

    public long getProcessID() {
        return processID;
    }

    public void setProcessID(long processID) {
        this.processID = processID;
    }

    public String getInstance() {
        return instance;
    }

    public void setInstance(String instance) {
        this.instance = instance;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void log(LogKind kind, Object value) {
        new Log(this, kind, value, null).publish();
    }

    public void trace(Object value) {
        log(TRACE, value);
    }

    public void debug(Object value) {
        log(DEBUG, value);
    }

    public void info(Object value) {
        log(INFO, value);
    }

    public void query(Object value) {
        log(QUERY, value);
    }

    public void warning(Object value) {
        log(WARNING, value);
    }

    public void error(Object value) {
        log(ERROR, value);
    }

    public void fatal(Object value) {
        log(FATAL, value);
    }

}
