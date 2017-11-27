package controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@SuppressWarnings("UnusedDeclaration")
public class IndexController {

    // @Value("${example.message}")
    private String message;


    @RequestMapping(value = "/aaaa", method = RequestMethod.GET)
    @ResponseBody
    public String showIndex() {
        return message;
    }

/*
    @RequestMapping(value = "/console", method = RequestMethod.GET)
    @ResponseBody
    public String table() {


        //   userDao.test();


        return "tabelka";
    }*/

}
