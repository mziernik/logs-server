package model.logs.server;

import model.logs.handler.WebConsoleHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetSocketAddress;
import java.net.SocketException;
import java.nio.charset.Charset;

@Service
public class UdpServer extends LogServer {

    private DatagramSocket serverSocket;
    private Thread thread;

    protected UdpServer() {
        super(LogProtocol.UDP);
    }

    private void run() {

        byte[] data = new byte[65535];

        try {
            serverSocket = new DatagramSocket(5140);
            while (true) {
                DatagramPacket pck = new DatagramPacket(data, data.length);
                serverSocket.receive(pck);
                String value = new String(data, 0, pck.getLength(), Charset.forName("UTF-8"));
                TLog log = parse(InetSocketAddress.createUnresolved(pck.getAddress().getHostAddress(), pck.getPort()), value);
                if (log != null)
                    log.publish();
            }
        } catch (Throwable e) {
            e.printStackTrace();
        }
    }

    @PostConstruct
    private void init() throws SocketException {
        thread = new Thread(this::run);
        thread.start();
    }

    @PreDestroy
    private void destroy() {
        if (thread != null) thread.interrupt();
        if (serverSocket != null)
            serverSocket.close();
    }

}
