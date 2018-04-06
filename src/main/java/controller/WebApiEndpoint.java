package controller;

import core.webapi.Arg;

public class WebApiEndpoint {

    public void test1(@Arg(name = "name") String name,
                      @Arg(name = "value") Integer value,
                      @Arg(name = "bool") Boolean state) {
        System.out.println("dsfsdf");
    }

}
