package model.logs.entity;

import core.config.DbSession;
import model.logs.LogAttr;
import model.logs.entity.intf.LogAttrConverter;

import javax.persistence.*;
import java.io.Serializable;

@Entity(name = "logs_attr")
//@Table(schema = "logs", name = "logs_attr")
public class LogAttributeEntity implements Serializable {

    @Id
    private Long id;

    @OneToOne
    private LogEntity log;


//    @Column(name = "index", columnDefinition = "smallin")
    private Short index;

    @OneToOne()
    private BlockValueEntity value;

    public void setValue(BlockValueEntity value) {
        this.value = value;
    }

    public BlockValueEntity getValue() {
        return value;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public void setLog(LogEntity log) {
        this.log = log;
    }

    public void setIndex(Short index) {
        this.index = index;
    }

    public Short getIndex() {
        return index;
    }

    public LogEntity getLog() {
        return log;
    }


    public static Long lastId(DbSession session) {
        return (Long) session.createQuery("SELECT max(id) FROM logs_attr").uniqueResult();
    }

}
