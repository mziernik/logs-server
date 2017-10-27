package model;


import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.*;

@Entity
@Table(name = "users")
public class User implements Serializable {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column
    public Long id;

    @Column(name = "login", unique = true, updatable = false)
    public String login;


    @Column(name = "first_name")
    public String firstName;

    @Column(name = "last_name")
    public String lastName;

    @JoinColumn(name = "user_id")
    @OneToMany(targetEntity = Address.class)
    public final List<Address> addresses = new ArrayList<>();


}