package controller;

import core.webapi.AbstractWebApiEndpoint;
import core.webapi.Arg;
import core.webapi.WebApiSession;

public class WebApiEndpoint extends AbstractWebApiEndpoint {

    public WebApiEndpoint(WebApiSession<?> session) {
        super(session);
    }

    public String test1(@Arg(name = "name") String name,
                        @Arg(name = "value") Integer value,
                        @Arg(name = "bool") Boolean state,
                        String empty
                      ) {
      if (true) throw new Error("sssssssssssss");
        return "OK";
    }

}
