import ConfigField from "./ConfigField";
import * as Type from "../repository/Type";
import ConfigNode from "./ConfigNode";


class Skin extends ConfigNode {

    dark: ConfigField;


    constructor(node: ConfigNode) {
        super(node, "skin", "Skin");
        this.dark = this.field(Type.BOOLEAN, "dark", "Ciemny", true);
        this.dark.onChange.listen(this, () => document.body.setAttribute("dark", this.dark.value));
    }

}

class UI extends ConfigNode {

    idleTimeout: ConfigField;
    historyBackOnCreate: ConfigField;
    skin: Skin;

    constructor(cc: CoreConfig) {
        super(cc, "ui", "UI");
        this.skin = new Skin(this);
        this.idleTimeout = this.field(Type.DURATION, "idleTimeout", "Maksymalny czas nieaktywności", 15 * 60 * 1000); // 15 minut
        this.historyBackOnCreate = this.field(Type.BOOLEAN, "historyBackOnCreate", "Powrót po zapisaniu nowego rekordu", true);
    }

}

class API extends ConfigNode {

    wsUrl: ConfigField;
    httpUrl: ConfigField;

    constructor(cc: CoreConfig) {
        super(cc, "api", "API");
        this.wsUrl = this.field(Type.URL, "wsUrl", "Adres URL serwera WebSocket", window.location.origin);
        this.httpUrl = this.field(Type.URL, "httpUrl", "Adres URL serwera HTTP", window.location.origin);
    }
}

class CoreConfig extends ConfigNode {

    ui: UI;
    api: API;
    debugMode: ConfigField;

    constructor() {
        super(null, "core", "System");
        this.ui = new UI(this);
        this.api = new API(this);
        this.debugMode = this.field(Type.BOOLEAN, "debugMode", "Tryb debugowania", false);
    }
}

const cc: CoreConfig = new CoreConfig();
export default cc;
export const api = cc.api;
export const ui = cc.ui;




