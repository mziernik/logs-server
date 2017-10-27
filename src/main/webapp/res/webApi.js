//# sourceURL=file:///webApi.js

class DataSet {
    constructor(data) {
        data = data || {};
        this._pk = data.pk;
        this._columns = data.columns;
        this._key = data.key;
        this._name = data.name;
        this._rows = [];
    }

    put(name, value) {
        this[name] = value;
        this._rows.push(value);
    }

    forEach(callback) {
        this._rows.forEach(callback);
    }
}

class DataSetRow {

    constructor(parent) {
        this.__parent__ = parent;
    }
}

//ToDo: Dodać timeout dla żądań (30 sekund)
WebApi = function () {
    "use strict";

    this.httpUrl = null;
    this.wsUrl = null;

    this.hash;
    var wapi = this;
    var impl = this.impl; // implementacja WebApi
    var eventHandlers = [];
    var ws = undefined;
    this.connected = false;
    eventHandlers.registered = false;

    var processed = {};
    var queue = [];

    if (window.spa && window.spa.webApi === null)
        window.spa.webApi = this;

    this.initImpl = function (_impl) {
        impl = this.impl = _impl;

        this.httpUrl = new URL(this.httpUrl).replaceHost().toString();
        this.wsUrl = new URL(this.wsUrl).replaceHost().toString()
                .replace("https://", "wss://")
                .replace("http://", "ws://");

    };

    this.registerEvent = function (controller, sourceName, hashes, callback) {
        if (!sourceName || !hashes)
            return;

        var h = [];

        if (typeof hashes === "string")
            h.push(hashes);

        if (hashes.constructor === Array)
            for (var i = 0; i < hashes.length; i++)
                h.push(hashes[i]);

        eventHandlers.push([controller, sourceName, h, callback]);
    };

    // metoda do przeciążenia
    this.onEvent = function (controller, sourceName, hashes, callback, data) {
        if (callback)
            callback(data);
    };

    this.onMessage = function (data) {
        if (window.spa && window.spa.alert)
            window.spa.alert(data);
    };

    this.downloadFile = function (file) {
        var a = document.createElement("a");
        a.setAttribute("href", file.url);
        a.setAttribute("download", file.name);
        //    document.body.appendChild(a);
        a.click();
        // document.body.removeChild(a);


        // window.location = file.url;

    };

    this.headers = {
        "Local-TS": -1,
        "User-Agent": window.navigator.userAgent,
        "Accept-Language": window.navigator.language
    };

    this.call = function (endpoint, hash, flags, data, fields) {

        let _data = {
            //ToDo: Obsłużyć background
            background: false, // żądanie ma być wykonane w tle (bez blokowania ekranu, komunikatów błędów)
            params: {}, // parametry / argumenty funkcji
            data: null, // dane (post) - obiekt, który zostanie zserializowany do JSON-a
            onEvent: null, // handler obsługi komunikatów typu event przychodzacych z serwera,
            onSent: null // zdarzenie wysłania danych
        };

        data = data || {};

        function validate() {

            var pars = data.params || {};

            for (var name in fields) {
                var field = fields[name];
                var par = pars[name];
                var expected = field[0];
                var currrent = Utils.className(par).toLowerCase();

                if (expected && expected.toLowerCase() === "json")
                    expected = null;

                // ToDo: Dodać obsługę typu "json"

                if (name === "") {
                    par = data.data;
                    currrent = Utils.className(par).toLowerCase();

                    if (field[1] && (par === null || par === undefined))
                        throw Error("Brak danych (post) metody '" + endpoint + "'");

                    if (expected && par !== null && par !== undefined && currrent !== expected)
                        throw Error("Nieprawidłowy typ  danych (post) metody '" + endpoint
                                + "'. Oczekiwany: " + expected + ", aktualny: " + currrent);
                    continue;
                }

                if (field[1] && (par === null || par === undefined))
                    throw Error("Brak parametru '" + name + "' metody '" + endpoint + "'");

                if (expected && par !== null && par !== undefined && currrent !== expected)
                    throw Error("Nieprawidłowy typ parametru '" + name + "' metody '" + endpoint
                            + "'. Oczekiwany: " + expected + ", aktualny: " + currrent);
            }


            if (data.data !== null && data.data !== undefined && !fields[""])
                window.console.warn("Nadmiarowe dane (post) metody '" + endpoint + "'");

            for (var name in pars)
                if (!(fields[name]))
                    window.console.warn("Nieznany parametr ('" + name + "') metody '" + endpoint + "'");
        }
        ;
        validate();

        var createRequest = () => {

            var _promiseResolve = null;
            var _promiseReject = null;

            var req = new Promise((resolve, reject) => {
                _promiseResolve = resolve;
                _promiseReject = reject;
            });

            req.id = "";
            for (var i = 0; i < 4; i++)
                req.id += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);

            req.location = window.location.href;
            req.hash = hash;
            req.endpoint = endpoint;
            req.data = data.data;
            req.ignoreMessages = false;         // todo
            req.params = {};
            req.headers = {};
            req.spinner = data.spinner === undefined || data.spinner !== null ?
                    new Spinner() : null;

            // przepisywanie globalnych nagłówków
            for (var name in this.headers)
                if (!this.headers[name])
                    req.headers[name] = wapi.headers[name];

            if (this.headers["Local-TS"] === -1)
                req.headers["Local-TS"] = new Date().getTime();

            req.onPromiseResolve = _promiseResolve;
            req.onPromiseReject = _promiseReject;
            req.onResponse = null;
            req.onError = null;
            req.onSuccess = null;
            req.onSent = data.onSent;

            req.event = (name, data) => {
                ws.send(JSON.stringify({
                    id: req.id,
                    event: name,
                    data: data
                }));
            };

            req.cancel = () => {
                ws.send(JSON.stringify({
                    id: req.id,
                    event: "cancel"
                }));
            };


            for (var name in data)
                if (req[name] !== undefined)
                    req[name] = data[name];

            processed[req.id] = req;
            return req;
        };

        var req = createRequest();

        wsInit(this);
        doSend(req);
        /*
         req.promise.event = function (name, data) {
         ws.send(JSON.stringify({
         id: req.id,
         event: name,
         data: data
         }));
         };
         */
        return req;
    };




    function doSend(msg) {
        if (!wapi.connected) {
            queue.push(msg);
            return;
        }

        if (!eventHandlers.registered) {
            eventHandlers.registered = true;
            var data = {};

            for (var i = 0; i < eventHandlers.length; i++) {
                var h = eventHandlers[i];
                if (!data[h[1]])
                    data[h[1]] = {};
                data[h[1]] = h[2];
            }

            impl.service.notifications.register({
                data: data
            });

        }

        ws.send(JSON.stringify({
            id: msg.id,
            location: msg.location,
            endpoint: msg.endpoint,
            data: msg.data,
            params: msg.params,
            headers: msg.headers,
            hash: msg.hash
        }));

        if (typeof msg.onSent === "function")
            msg.onSent(msg);

    }

    function processResponse(data) {


        var type = data.type;

        if (type === "event" && !data.id) {
            for (var i = 0; i < eventHandlers.length; i++) {
                var h = eventHandlers[i];
                if (wapi.onEvent)
                    wapi.onEvent(h[0], h[1], h[2], h[3], data);
            }
            return;
        }

        var req = processed[data.id];
        if (!req)
            return;

        if (req.spinner && req.spinner.hide)
            req.spinner.hide();


        if (typeof data.hash === "string") {
            var split = data.hash.split("\/");
            if (split.length === 2 && data.mode === "dev") {
                if (wapi.hash !== split[0])
                    console.warn("Wersja api uległa zmianie");

                if (req.hash !== split[1])
                    console.warn(`Wersja endpoint-u ${req.endpoint} uległa zmianie`);
            }

        }

        if (req.onResponse)
            req.onResponse(data);

        if (type === "response")
            delete processed[data.id];

        data.request = req;


        if (type === "event") {
            if (data.request && data.request.onEvent)
                data.request.onEvent(data);
            return;
        }

        var err;
        var errMsg;

        if (data.messages)
            for (var i = 0; i < data.messages.length; i++) {
                var msg = data.messages[i];
                if (data.error && msg.type === "error") {
                    err = new EError();
                    err.message = msg.value;
                    err.title = msg.title;
                    err.details = msg.details;
                    errMsg = (msg.title ? msg.title + ": " : "") + msg.value;
                    break;
                }
                wapi.onMessage(msg);
            }

        if (data.file && data.file.url) {
            wapi.downloadFile(data.file);
            return;
        }

        if (data.error) {

            if (typeof req.onPromiseReject === "function")
                req.onPromiseReject(errMsg);

            if (typeof req.onError === "function")
                req.onError(data, err);
            else
            if (window.spa && window.spa.onError)
                window.spa.onError(err);
        }

        if (!data.error) {
            if (typeof req.onPromiseResolve === "function")
                req.onPromiseResolve(data);

            if (typeof req.onSuccess === "function")
                req.onSuccess(data);
        }


    }


    function WebApiResponse(strData) {
        var data = JSON.parse(strData);
        for (var name in data)
            this[name] = data[name];

        this.unnest = (dataSet) => {
            dataSet = dataSet || data;
            if (!dataSet || !dataSet.columns || !dataSet.rows)
                return null;

            var name = dataSet.key;
            name = "DS_" + name[0].toUpperCase() + name.substring(1);

            let result = dataSet.pk ? null : [];

            if (!result)
                result = new (eval(`class ${name} extends DataSet { constructor(data) {super(data);} }`))(dataSet);

            name = "DSR_" + name.substr(3);
            var rowCls = eval(`class ${name} extends DataSetRow { constructor(parent) { super(parent); } }`);


            dataSet.rows.forEach(row => {
                let idx = 0;
                let obj = new rowCls(result);

                for (var colName in dataSet.columns)
                    obj[colName] = row[idx++];

                if (dataSet.pk) {
                    result[obj[dataSet.pk]] = obj;
                    result._rows.push(obj);
                } else
                    result.push(obj);
            });
            return result;
        };
    }

    function wsInit(api) {
        if (ws !== undefined || !api.wsUrl)
            return;

        ws = new WebSocket(api.wsUrl);

        ws.onopen = function () {
            api.connected = true;
            for (var i = 0; i < queue.length; i++)
                doSend(queue[i]);
            queue = [];
        };

        ws.onclose = function (e) {
            api.connected = false;
        };

        ws.onerror = function (e) {
            api.connected = false;
        };

        ws.onmessage = function (msg) {
            processResponse(new WebApiResponse(msg.data));
        };
    }

    function ajax(data) {
        var url = null; // ToDo

        var xhr = new XMLHttpRequest();
        xhr.data = data;

        xhr.onerror = function (e) {
            //   this.error = true;
        };

        xhr.ontimeout = function () {
//            this.error = true;
//            if (data.window.$error)
//                data.window.$error("Prezekroczono limit czasu odpowiedzi serwera");
        };
        xhr.onreadystatechange = function () {
            if (this.readyState !== 4)
                return;

            this.headers = {};
            this.contentType = null;

            var hdrs = this.getAllResponseHeaders().split("\n");
            for (var i = 0; i < hdrs.length; i++) {
                var arr = hdrs[i].split(":");
                if (arr.length === 2)
                    this.headers[arr[0].trim()] = arr[1].trim();
            }
        };
        xhr.withCredentials = true;
        xhr.open("POST", url, true);
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");



        if (data.headers)
            for (var hdr in data.headers)
                xhr.setRequestHeader(hdr, encodeURIComponent(data.headers[hdr]));

        xhr.setRequestHeader("Content-Type", "application/javascript");


        xhr.send(data.data ? JSON.stringify(data.data) : null);
    }



};




//var wapi;
//addEventListener("load", function () {
//    wapi = new WApi("wsapi");
//});




