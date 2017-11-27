package core.config;

import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.Transaction;

import java.io.Closeable;
import java.io.Serializable;
import java.util.List;
import java.util.Queue;

public class DbSession implements Closeable {

    private final Session session;

    DbSession(Session session) {
        this.session = session;
    }

    @Override
    public void close() {
        session.close();
    }


    public <T extends Serializable> List<T> list(Class<T> entity) {
        return session.createQuery("from " + entity.getSimpleName()).list();
    }

    public void save(Object entity) {
        session.save(entity);
    }

    public Transaction beginTransaction() {
        return session.beginTransaction();
    }


    public Query createQuery(String queryString) {
        return session.createQuery(queryString);
    }

    public void persist(Object entity) {
        session.persist(entity);
    }
}
