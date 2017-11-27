package model.logs.handler;

import core.config.AppConfig;
import core.config.Database;
import core.config.DbSession;
import model.logs.Log;
import model.logs.LogAttr;
import model.logs.LogEntry;
import model.logs.LogKind;
import model.logs.entity.BlockValueEntity;
import model.logs.entity.LogAttributeEntity;
import model.logs.entity.LogEntity;
import org.hibernate.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Component
public class DatabaseHandler extends LogHandler {

    private static int blockValuesCount = 3000;

    @Autowired
    private Database db;

    private Cache cache;

    @Autowired
    private AppConfig config;


    DatabaseHandler() {
        register();
    }

    @Override
    public void publish(Log log) {

        if (db == null) return;


        try (DbSession session = db.session()) {

            Transaction transaction = session.beginTransaction();

            if (cache == null)
                cache = new Cache(session);

            if (cache.values.size() > blockValuesCount)
                cache = new Cache(cache);

            LogEntity le = new LogEntity();
            le.setKind((LogKind) log.get(LogAttr.KIND));
            le.setDate((Date) log.get(LogAttr.DATE));
            le.setUptime((Long) log.get(LogAttr.UPTIME));
            le.setBlock(cache.blockId);
            session.save(le);

            for (LogEntry en : log.entries.values()) {

                if (en.values.isEmpty()) continue;

                short index = 0;

                for (Object value : en.values) {

                    if (value == null)
                        continue;

                    Object[] values = new Object[]{value};

                    if (value.getClass().isArray())
                        values = (Object[]) value;

                    for (Object o : values) {
                        BlockValueEntity val = cache.getValue(session, en.attr, o);

                        LogAttributeEntity attr = new LogAttributeEntity();
                        en.setEntity(attr);
                        attr.setId(cache.attributeId++);
                        attr.setValue(val);
                        attr.setLog(le);
                        attr.setIndex(index);

                        session.save(attr);
                        le.addAttribute(attr);
                    }


                    index++;


                }

            }

            transaction.commit();
        }
    }
}


class Cache {

    public final int blockId;
    public long attributeId;
    public final List<BlockValueEntity> values = new ArrayList<>();


    Cache(Cache previous) {
        this.blockId = previous.blockId + 1;
        this.attributeId = previous.attributeId + 1;
    }

    Cache(DbSession session) {
        Integer block = LogEntity.lastBlock(session);
        blockId = block != null ? block + 1 : 1;

        Long attr = LogAttributeEntity.lastId(session);
        attributeId = attr != null ? attr + 1l : 1l;
    }

    public BlockValueEntity getValue(DbSession session, LogAttr attr, Object value) {

        String val = value.toString();

        for (BlockValueEntity bve : values)
            if (bve.getAttribute() == attr && bve.getValue().equals(val))
                return bve;

        BlockValueEntity bve = new BlockValueEntity();
        bve.setBlock(blockId);
        bve.setAttribute(attr);
        bve.setValue(val);
        values.add(bve);
        session.save(bve);
        return bve;
    }
}

/*
SELECT l.*, a.index, bv.attr, bv.value
FROM logs_log l
JOIN logs_attr a ON a.log_id = l.id
JOIN logs_block_value bv ON a.value_id = bv.id
 */