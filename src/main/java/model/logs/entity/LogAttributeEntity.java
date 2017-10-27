package model.logs.entity;

import core.config.DbSession;

import javax.persistence.*;
import java.io.Serializable;

@Entity(name = "logs_attr")
//@Table(schema = "logs")
public class LogAttributeEntity implements Serializable {

    @Id
    private Long id;

//    @ManyToOne
//    private LogEntity log;

    private Integer block;

    //private LogEntity log;

    private Long parrent;

    @OneToOne()
    // @Column(name = "block_value")
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

    public Integer getBlock() {
        return block;
    }

    public void setBlock(Integer block) {
        this.block = block;
    }

    public Long getParrent() {
        return parrent;
    }

    public void setParrent(Long parrent) {
        this.parrent = parrent;
    }

    public static Long lastId(DbSession session) {
        return (Long) session.createQuery("SELECT max(id) FROM logs_attr").uniqueResult();
    }

}
