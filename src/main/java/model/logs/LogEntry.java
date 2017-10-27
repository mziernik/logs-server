package model.logs;

import model.logs.entity.LogAttributeEntity;
import utils.JsonBuilder;

import java.util.ArrayList;
import java.util.Objects;
import java.util.function.Consumer;

public class LogEntry {

    public final LogAttr attr;
    public final ArrayList<Object> values = new ArrayList<>();
    private LogAttributeEntity entity;

    LogEntry(LogAttr attr) {
        this.attr = Objects.requireNonNull(attr);
    }

    @Override
    public String toString() {

        JsonBuilder json = new JsonBuilder();
        if (attr.multiple)
            json.array(() -> {
                for (Object o : values)
                    json.value(o);
            });
        else
            json.value(values.isEmpty() ? null : values.get(0));

        return attr.key + ": " + json;
    }


    public LogAttributeEntity getEntity() {
        return entity;
    }

    public void setEntity(LogAttributeEntity entity) {
        this.entity = entity;
    }

    public void toJson(JsonBuilder json) {
        json.name(attr.key);

        final Consumer<Object> writer = obj -> {
            if (obj != null && obj.getClass().isArray())
                json.array(() -> {
                    for (Object o : (Object[]) obj)
                        json.value(attr.serialize(o));
                });
            else
                json.value(attr.serialize(obj));
        };

        if (!attr.multiple)
            writer.accept(values.isEmpty() ? null : values.get(0));
        else
            json.array(() -> {
                for (Object o : values)
                    writer.accept(o);
            });

    }

}
