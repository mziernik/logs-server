package model.logs.entity;

import model.logs.LogAttr;
import model.logs.entity.intf.LogAttrConverter;

import javax.persistence.*;
import java.io.Serializable;

@Entity(name = "logs_block_value")
//@Table(schema = "logs")
public class BlockValueEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column
    private long id;

    @Column(name = "block")
    private int block;

    @Column(name = "attr", length = 3)
    @Convert(converter = LogAttrConverter.class)
    private LogAttr attribute;

    @Column(name = "value", length = 10000)
    private String value;

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

    public LogAttr getAttribute() {
        return attribute;
    }

    public void setAttribute(LogAttr attribute) {
        this.attribute = attribute;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
