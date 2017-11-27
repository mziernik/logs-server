package model.logs.server;

import com.google.gson.*;
import model.logs.LogAttr;
import model.logs.LogKind;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.text.SimpleDateFormat;
import java.util.*;

import static model.logs.LogAttr.*;

public abstract class LogServer {

    public final LogProtocol protocol;

    protected LogServer(LogProtocol protocol) {
        this.protocol = protocol;
    }

    //

    protected TLog parse(InetSocketAddress address, String value) {
        if (value == null) return null;
        value = value.trim();
        if (value.isEmpty()) return null;


        // value = "<34>1 2003-10-11T22:14:15.003Z mymachine.example.com su - ID47 - BOM'su root' failed for lonvick on /dev/pts/8";

        if (value.startsWith("{") && value.endsWith("}"))
            return process(address, new JsonParser().parse(value));


        if (value.startsWith("<") && value.indexOf(">") > 0 && value.indexOf(">") <= 4) {
//
//            SyslogParser syslogParser = new SyslogParser(value);
//            try {
//                syslogParser.readEvent();
//            } catch (IOException e) {
//                e.printStackTrace();
//            }

            Integer sysLogId = strInt(value.substring(1, value.indexOf(">")));
            if (sysLogId != null)

                if (value.matches("^\\<\\d*\\>\\d \\d\\d\\d\\d-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d.\\d\\d\\dZ.* - .* - *.*$"))
                    return processRFC5424SysLog(address, sysLogId, value);
                else
                    return processSysLog(address, sysLogId, value);
        }

        return null;
    }


    private Object read(LogAttr attr, JsonElement json) {

        if (json.isJsonPrimitive()) {
            JsonPrimitive pp = json.getAsJsonPrimitive();
            if (pp.isString())
                return attr.parse(pp.getAsString());
            if (pp.isNumber())
                return attr.parse(pp.getAsLong());
            if (pp.isBoolean())
                return attr.parse(pp.getAsBoolean());
        }


        if (json.isJsonArray()) {
            List<Object> list = new ArrayList<>();
            for (JsonElement el : json.getAsJsonArray())
                list.add(read(attr, el));

            return list.toArray(new Object[0]);
        }

        return null;
    }

    protected TLog process(InetSocketAddress address, JsonElement json) {
        JsonObject object = json.getAsJsonObject();

        TLog log = new TLog(this, address);

        log.address(address.toString());

        for (LogAttr attr : LogAttr.values()) {
            if (attr == LogAttr.COUNTER) continue;
            JsonElement elm = object.get(attr.key);
            if (elm == null) continue;
            Object value = read(attr, elm);

            if (value == null) continue;
            if (attr.multiple && value.getClass().isArray()) {
                for (Object o : (Object[]) value)
                    log.entry(attr, o);
                continue;
            }

            log.entry(attr, attr.parse(value));
        }

        return log;
    }

    public TLog processRFC5424SysLog(InetSocketAddress address, int sysLogId, String value) {

        TLog log = createSysLog(address, sysLogId);

        String str = value.substring(value.indexOf(">") + 1).trim();


        return log;
    }


    public TLog processSysLog(InetSocketAddress address, int sysLogId, String value) {

        TLog log = createSysLog(address, sysLogId);

        String str = value.substring(value.indexOf(">") + 1).trim();

        if (str.indexOf(" ") > 0) {
            String s = str.substring(0, str.indexOf(" "));
            if (strInt(s) != null) // wersja w formacie RFC 5424
                str = str.substring(s.length()).trim();
        }


        if (str.length() >= 16 && str.charAt(3) == ' ' && str.charAt(6) == ' ')
            try {
                log.entry(DATE, new SimpleDateFormat("MMM dd HH:mm:ss yyyy",
                        Locale.ENGLISH).parse(str.substring(0, 15) + " "
                        + Calendar.getInstance().get(Calendar.YEAR)));
                str = str.substring(16);
            } catch (Exception pe) {
            }
        else if (str.contains(" ")) {
            String s = str.substring(0, str.indexOf(" "));
            if (s.contains("Z") && s.contains("T"))
                try {
                    s = s.replace("T", " ").replace("Z", " ");
                    log.entry(DATE, new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS").parse(s));
                    str = str.substring(s.length()).trim();
                } catch (Exception e) {

                }
        }

        str = str.trim();

        if (str.contains(":")) {
            // rsyslog
            String[] split = str.substring(0, str.indexOf(":")).split(" ");

            if (split.length == 2) {
                log.device(split[0]);

                String s = split[1];
                if (s.contains("[") && s.endsWith("]")) {
                    s = s.substring(s.indexOf("[") + 1, s.indexOf("]"));
                    Integer pid = strInt(s);
                    if (pid != null) {
                        log.processID((long) pid);
                        s = split[1].substring(0, split[1].indexOf("["));
                    }
                }
                log.tag(s);
                str = str.substring(str.indexOf(":") + 1);
            }
        }

        log.value(str.trim());

        /*
         * Numerical Code	Facility
         0	kernel messages
         1	user-level messages
         2	mail system
         3	system daemons
         4	security/authorization messages
         5	messages generated internally by syslogd
         6	line printer subsystem
         7	network news subsystem
         8	UUCP subsystem
         9	clock daemon
         10	security/authorization messages
         11	FTP daemon
         12	NTP subsystem
         13	log audit
         14	log alert
         15	clock daemon
         16	local use 0
         17	local use 1
         18	local use 2
         19	local use 3
         20	local use 4
         21	local use 5
         22	local use 6
         23	local use 7
         */

        return log;

    }

    private TLog createSysLog(InetSocketAddress address, int sysLogId) {
        TLog log = new TLog(this, address);

        log.entry(ADDRESS, address.toString());
        log.entry(DATE, new Date());

        //   log.protocol = "SysLog";

        int sev = sysLogId % 8;
        int fac = sysLogId / 8;

        String severity = "";
        String facility = "";

        switch (sev) {
            case 0:
                log.entry(KIND, LogKind.FATAL);
                severity = "Emergency";
                break;
            case 1:
                log.entry(KIND, LogKind.INFO);
                severity = "Alert";
                break;
            case 2:
                log.entry(KIND, LogKind.ERROR);
                severity = "Critical";
                break;
            case 3:
                log.entry(KIND, LogKind.ERROR);
                severity = "Error";
                break;
            case 4:
                log.entry(KIND, LogKind.WARNING);
                severity = "Warning";
                break;
            case 5:
                log.entry(KIND, LogKind.QUERY);
                severity = "Notice";
                break;
            case 6:
                log.entry(KIND, LogKind.INFO);
                severity = "Information";
                break;
            case 7:
                log.entry(KIND, LogKind.DEBUG);
                severity = "Debug";
                break;
        }


        /*
         * 0	Emergency: system is unusable
         1	Alert: action must be taken immediately
         2	Critical: critical conditions
         3	Error: error conditions
         4	Warning: warning conditions
         5	Notice: normal but significant condition
         6	Informational: informational messages
         7	Debug: debug-level messages
         */
        switch (fac) {
            case 0:
                facility = "Kernel";
                break;
            case 1:
                facility = "User";
                break;
            case 2:
                facility = "Mail";
                break;
            case 3:
                facility = "Daemons";
                break;
            case 4:
                facility = "Security";
                break;
            case 5:
                facility = "Syslogd";
                break;
            case 6:
                facility = "Printer";
                break;
            case 7:
                facility = "Network";
                break;
            case 8:
                facility = "UUCP";
                break;
            case 9:
                facility = "Clock";
                break;
            case 10:
                facility = "Security";
                break;
            case 11:
                facility = "FTP";
                break;
            case 12:
                facility = "NTP";
                break;
            case 13:
                facility = "Audit";
                break;
            case 14:
                facility = "Alert";
                break;
            case 15:
                facility = "Clock";
                break;

            case 16:
            case 17:
            case 18:
            case 19:
            case 20:
            case 21:
            case 22:
            case 23:
                facility = "Local";
                break;
        }
        log.tag(facility);

        log.attribute("Facility", facility);
        log.attribute("Severity", severity);
        return log;
    }

    private static Integer strInt(String param) {
        try {
            return Integer.valueOf(param);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
