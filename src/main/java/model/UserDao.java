package model;

import core.config.Database;
import core.config.DbSession;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.LinkedList;
import java.util.List;

@Component
public class UserDao {


    @Autowired
    private Database db;

    @PostConstruct
    public void test() {
        if (true)
            return;

        try (DbSession ses = db.session()) {


            long ts = System.currentTimeMillis();
            List<User> list = ses.list(User.class);
            ts = System.currentTimeMillis() - ts;


            if (list.isEmpty()) {

                ts = System.currentTimeMillis();

                Transaction transaction = ses.beginTransaction();

                for (int i = 0; i < 10; i++) {
                    User user = new User();
                    user.login = "imie.nazwisko." + i;
                    user.firstName = "Imię " + i;


                    Address addr = new Address();
                    addr.home = "1234";
                    addr.street = "Ulica a" + i;
                    addr.city = "Miasto a" + i;
                    ses.persist(addr);
                    user.addresses.add(addr);

                    addr = new Address();
                    addr.home = "321";
                    addr.street = "Ulica b" + i;
                    addr.city = "Miasto b" + i;
                    ses.persist(addr);
                    user.addresses.add(addr);


                    ses.persist(user);
                }


                ts = System.currentTimeMillis() - ts;

                System.out.println(ts);

                transaction.commit();
            }
        }


/*

        Session session = db.openSession();
        session.beginTransaction();

        session.op

        List list = session.createQuery("from User").list();



        session.getTransaction().commit();
        session.close();
        */
    }
}
