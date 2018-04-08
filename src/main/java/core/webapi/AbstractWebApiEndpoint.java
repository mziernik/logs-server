package core.webapi;

public class AbstractWebApiEndpoint {

    protected final WebApiSession<?> session;


    public AbstractWebApiEndpoint(WebApiSession<?> session) {
        this.session = session;

    }
}
