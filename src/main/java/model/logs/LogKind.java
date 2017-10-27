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


}