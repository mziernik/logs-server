package model.logs.entity;

import core.config.Database;
import core.config.DbSession;
import model.logs.Log;
import model.logs.LogAttr;
import model.logs.LogKind;
import model.logs.Logger;
import org.hibernate.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.Date;
import java.util.Locale;

@Component
public class LogsDao {


    @Autowired
    private Database db;

}
