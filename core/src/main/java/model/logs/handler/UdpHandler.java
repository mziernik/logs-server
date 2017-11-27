package model.logs.handler;

import model.logs.Log;
import org.springframework.stereotype.Service;
import utils.JsonBuilder;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetSocketAddress;
import java.nio.charset.Charset;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;

//@Service
public class UdpHandler extends LogHandler {
    private DatagramSocket socket;
    private final Set<InetSocketAddress> addresses = new LinkedHashSet<>();

    public UdpHandler(InetSocketAddress... addresses) {
        this.addresses.addAll(Arrays.asList(addresses));
    }

    @Override
    public void publish(Log log) {

        if (socket == null)
            try {
                socket = new DatagramSocket();

            } catch (Throwable e) {
                e.printStackTrace();
            }


        JsonBuilder json = new JsonBuilder();
        log.toJson(json);
        byte[] data = json.toString().getBytes(Charset.forName("UTF-8"));

        try {
            for (InetSocketAddress addr : addresses)
                socket.send(new DatagramPacket(data, data.length, addr));

        } catch (Throwable e) {
            e.printStackTrace();
        }


    }


}


