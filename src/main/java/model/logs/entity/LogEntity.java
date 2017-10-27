package model.logs.entity;

import core.config.DbSession;
import model.logs.LogKind;
import model.logs.entity.intf.LogKindConverter;
import org.hibernate.Query;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity(name = "logs_log")
//@Table(schema = "logs", name = "log")
public class LogEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column
    private long id;

    private int block;


    private Date date;

    private Long uptime;

    @Column(name = "kind", columnDefinition = "char")
    @Convert(converter = LogKindConverter.class)
    private LogKind kind;

    @OneToMany()
    @JoinColumn(name = "log")
    private final List<LogAttributeEntity> attributes = new ArrayList<>();


    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public int getBlock() {
        return block;
    }

    public void setBlock(int block) {
        this.block = block;
    }


    public Long getUptime() {
        return uptime;
    }

    public void setUptime(Long uptime) {
        this.uptime = uptime;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public LogKind getKind() {
        return kind;
    }

    public void setKind(LogKind kind) {
        this.kind = kind;
    }

    public List<LogAttributeEntity> getAttributes() {
        return attributes;
    }

    public void addAttribute(LogAttributeEntity attr) {
        attributes.add(attr);
    }

    public static Integer lastBlock(DbSession session) {
        return (Integer) session.createQuery("SELECT max(block) FROM logs_log").uniqueResult();
    }
}

