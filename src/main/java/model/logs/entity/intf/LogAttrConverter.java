package model.logs.entity.intf;

import model.logs.LogAttr;

import javax.persistence.AttributeConverter;
import javax.persistence.Convert;

@Convert
public class LogAttrConverter implements AttributeConverter<LogAttr, String> {

    public String convertToDatabaseColumn(LogAttr value) {
        return value != null ? value.key : null;
    }

    public LogAttr convertToEntityAttribute(String value) {
        if (value == null)
            return null;

        for (LogAttr attr : LogAttr.values())
            if (attr.key.equals(value))
                return attr;

        return null;
    }
}