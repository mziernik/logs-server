package core.config;

import controller.SocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistration;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import java.util.HashMap;
import java.util.Map;

@Configuration
//@EnableWebMvc
@EnableWebSocket
public class WebConfig extends WebMvcConfigurerAdapter implements WebSocketConfigurer {

    @Autowired
    private SocketHandler hanlder;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        //   registry.addResourceHandler("images/**").addResourceLocations("images/");

        //     registry.addResourceHandler("/**").addResourceLocations("webapp/");
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {

        //   registry.addViewController("/").setViewName("forward:/index.html");
    }


    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        WebSocketHandlerRegistration wshr = registry.addHandler(hanlder, "/console");
        wshr.setAllowedOrigins("*");
    }


}


