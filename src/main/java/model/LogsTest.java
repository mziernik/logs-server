package model;

import core.config.Database;
import model.logs.AppMode;
import model.logs.Log;
import model.logs.LogKind;
import model.logs.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Locale;

@Service
public class LogsTest {


    private final static Logger LOG = new Logger(LogsTest.class);

    @Autowired
    private Database db;


    // @PostConstruct
    public void test() {

        Error ex1 = new Error("sadsaasd");
        IOException ex2 = new IOException("zzzzzzzzzzzzzzzz");
        new Thread(() -> {

            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            Log.log(LogKind.INFO, log -> log
                    .address("10.0.0.1")
                    .thread(Thread.currentThread())
                    .processID(1234l)
                    .application("Aplikacja")
                    .hostName("Serwer")
                    .comment("Komentarz")
                    .color("blue")
                    .background("yellow")
                    .url("http://localhost:8080")
                    .value("FULL")
                    .tag("TAG")
                    .value("Wartość @@ </>")
                    .device("lap")
                    .userName("admin")
                    .userAgent("WebKit")
                    .context("Kontekst")
                    .method("test()")
                    .version("1.0 beta")
                    .operatingSystem("Linux")
                    .mode(AppMode.PROD)
                    .locale(Locale.UK)
                    .data("plik XML", "<root>\n\taaaaaa\n</root>")
                    .attribute("Pojedyncza wartość atrybutu")
                    .attribute("Atrybut bez grupy", "Wartość")
                    .attribute("Grupa", "Nazwa", "Wartość")
            );

            LOG.error(ex1);
            LOG.fatal(ex2);
            Log.info("Linia 1\r\nLinia 2\r\nLinia 3");
            Log.log(LogKind.DEBUG, log -> log.value("Test 2")
                    .attribute("Atrybut1", "Wartość atrybutu 1")
                    .attribute("Atrybut2", "Wartość atrybutu 3")
                    .attribute("Atrybut3", "Wartość atrybutu 3"));

//            for (int i = 0; i < 100; i++)
//                Log.trace("Log " + i);


        }).start();


    }
}
