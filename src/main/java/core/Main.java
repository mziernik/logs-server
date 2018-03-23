package core;

import core.config.AppConfig;
import org.springframework.boot.Banner;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
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
        System.setProperty("visualvm.display.name", "Logs Server");
        Main.args = args;

        System.out.println("" +
                "\n" +
                "  _________                                   .____                                \n" +
                " /   _____/ _____________  _  __ ___________  |    |    ____   ____   ______  _  __\n" +
                " \\_____  \\_/ __ \\_  __ \\ \\/ \\/ // __ \\_  __ \\ |    |   /  _ \\ / ___\\ /  _ \\ \\/ \\/ /\n" +
                " /        \\  ___/|  | \\/\\     /\\  ___/|  | \\/ |    |__(  <_> ) /_/  >  <_> )     / \n" +
                "/_______  /\\___  >__|    \\/\\_/  \\___  >__|    |_______ \\____/\\___  / \\____/ \\/\\_/  \n" +
                "        \\/     \\/                   \\/                \\/    /_____/                \n");

        // inicjalizacja
        getConfig();

        new SpringApplicationBuilder()
                .sources(Main.class)
                .bannerMode(Banner.Mode.OFF)
                .properties(getConfig())
                .run();
    }


}