package core.config;

import model.Address;
import model.User;

import model.logs.entity.BlockValueEntity;
import model.logs.entity.LogEntity;
import model.logs.entity.LogAttributeEntity;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.boot.registry.StandardServiceRegistry;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.cfg.Configuration;
import org.hibernate.tool.hbm2ddl.SchemaExport;
import org.springframework.stereotype.Component;

import java.lang.management.ManagementFactory;


@Component
public class Database {

    public Database() {
        System.out.println("============================== Database - uptime: " + ManagementFactory.getRuntimeMXBean().getUptime());
    }

    private static SessionFactory factory;

    public SessionFactory getSessionFactory() {
        if (factory != null)
            return factory;

        Configuration config = new Configuration();
        config.addAnnotatedClass(User.class);
        config.addAnnotatedClass(Address.class);
        config.addAnnotatedClass(LogEntity.class);
        config.addAnnotatedClass(LogAttributeEntity.class);
        config.addAnnotatedClass(BlockValueEntity.class);

        config.configure();
//
//        SchemaExport schema = new SchemaExport(config);
//        schema.create(true, true);

        SessionFactory sessionFactory = config.buildSessionFactory();


        return Database.factory = sessionFactory;
    }

    public DbSession session() {
        return new DbSession(getSessionFactory().openSession());
    }

    public Session openSession() {
        return getSessionFactory().openSession();
    }
}
