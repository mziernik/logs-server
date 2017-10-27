package model.logs.handler;

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

//@Component
public class DatabaseHandler extends LogHandler {

    private static int blockValuesCount = 100;

    @Autowired
    private Database db;

    private Cache cache;


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
            session.persist(le);


            for (LogEntry en : log.entries.values()) {

                if (en.values.isEmpty()) continue;

                BlockValueEntity val = cache.getValue(session, en.attr, en.values);

                LogAttributeEntity attr = new LogAttributeEntity();
                en.setEntity(attr);
                attr.setId(cache.attributeId++);
                attr.setBlock(le.getBlock());
                attr.setValue(val);
//
//                if (en.parent != null)
//                    attr.setParrent(en.parent.getEntity().getId());

                session.persist(attr);
                le.addAttribute(attr);
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
        session.persist(bve);
        return bve;
    }
}