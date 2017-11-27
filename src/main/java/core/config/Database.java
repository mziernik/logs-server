package core.config;

import model.logs.entity.BlockValueEntity;
import model.logs.entity.LogEntity;
import model.logs.entity.LogAttributeEntity;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


@Component
public class Database {


    private static SessionFactory factory;
    @Autowired
    private AppConfig config;

    public SessionFactory getSessionFactory() {
        if (factory != null)
            return factory;

        Configuration config = new Configuration();

        config.addAnnotatedClass(LogEntity.class)
                .addAnnotatedClass(LogAttributeEntity.class)
                .addAnnotatedClass(BlockValueEntity.class);

        config.addProperties(this.config);

//        config.setProperty("hibernate.dialect", "org.hibernate.dialect.PostgreSQL82Dialect")
//                .setProperty("hibernate.connection.driver_class", Driver.class.getName())
//                .setProperty("hibernate.connection.url", "jdbc:postgresql://localhost/logs")
//                .setProperty("hibernate.connection.username", "postgres")
//                .setProperty("hibernate.connection.password", "postgres")
//                .setProperty("hibernate.use_sql_comments", "true")
//                .setProperty("hibernate.hbm2ddl.auto", "create");


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
