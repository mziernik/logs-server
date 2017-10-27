package model;


import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "user_address")
public class Address implements Serializable {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column
    public Long id;

    @ManyToOne
    public User user;

    @Column(name = "street", unique = true, updatable = false)
    public String street;


    @Column(name = "city")
    public String city;

    @Column(name = "home")
    public String home;


}