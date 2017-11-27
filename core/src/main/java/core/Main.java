package core;

import core.config.AppConfig;
import model.logs.Logger;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.ServletContextInitializer;
import org.springframework.boot.web.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.WebApplicationInitializer;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRegistration;
import java.util.Enumeration;

@SpringBootApplication
@Configuration
@ComponentScan(basePackages = {"controller", "core", "model"})
public class Main extends SpringBootServletInitializer {

    private static AppConfig config;
    private static String[] args;
    private static boolean initialized;

    @Bean
    public static AppConfig getConfig() {
        return config != null ? config : (config = new AppConfig(args));
    }


    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        if (initialized) return;
        initialized = true;


        Enumeration<String> initParameterNames = servletContext.getInitParameterNames();
        System.out.println("-------------------------------------------------------------");

        while (initParameterNames.hasMoreElements()) {
            String elm = initParameterNames.nextElement();
            System.out.println("Init param " + elm + ": " + servletContext.getInitParameter(elm));
        }


        System.out.println("-------------------------------------------------------------");


        super.onStartup(servletContext);


    }


    public static void main(String[] args) throws Exception {
        Main.args = args;

        // inicjalizacja
        getConfig();

        new SpringApplicationBuilder()
                .sources(Main.class)
                .properties(getConfig())
                .run();
    }


}