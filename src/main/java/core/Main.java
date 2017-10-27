package core;

import model.logs.Logger;
import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.support.SpringBootServletInitializer;

import java.util.Properties;

@SpringBootApplication
public class Main extends SpringBootServletInitializer {



    public Main() {
        Logger.DEFAULT.addProjectPackage("core");
        Logger.DEFAULT.addProjectPackage("controller");
        Logger.DEFAULT.addProjectPackage("model");
        Logger.DEFAULT.addProjectPackage("utils");
        Logger.DEFAULT.setApplicationName("Demo App");
        Logger.DEFAULT.setHostName("LAP");
        Logger.DEFAULT.setDevice("Laptop");
    }

    protected SpringApplicationBuilder createSpringApplicationBuilder() {
        SpringApplicationBuilder builder = super.createSpringApplicationBuilder();

        Properties props = new Properties();
        props.setProperty("spring.main.banner-mode", "off");
        props.setProperty("server.port", "${port:8000}");


        builder.properties(props)

                .bannerMode(Banner.Mode.OFF)
                .sources(Main.class);

        return builder;
    }


    public static void main(String[] args) throws Exception {
        new Main().createSpringApplicationBuilder().run(args);
    }

}