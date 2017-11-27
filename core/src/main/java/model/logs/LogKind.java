package model.logs;


public enum LogKind {


    TRACE('T'),
    DEBUG('D'),
    QUERY('Q'),
    REQUEST('R'),
    INFO('I'),
    WARNING('W'),
    ERROR('E'),
    FATAL('F');

    public final char key;

    LogKind(char key) {
        this.key = key;
    }


    public static LogKind get(String value) {
        for (LogKind lk : values())
            if (value.equals(Character.toString(lk.key)) || value.equalsIgnoreCase(lk.name()))
                return lk;

        throw new IllegalArgumentException("Incorrect LogKind value: " + value);
    }
}