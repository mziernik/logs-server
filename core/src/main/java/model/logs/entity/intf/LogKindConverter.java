package model.logs.entity.intf;

import model.logs.LogKind;

import javax.persistence.AttributeConverter;
import javax.persistence.Convert;

@Convert
public class LogKindConverter implements AttributeConverter<LogKind, Character> {

    public Character convertToDatabaseColumn(LogKind value) {
        return value != null ? value.key : null;
    }

    public LogKind convertToEntityAttribute(Character value) {
        if (value == null)
            return null;

        for (LogKind kind : LogKind.values())
            if (kind.key == value)
                return kind;

        return null;
    }
}