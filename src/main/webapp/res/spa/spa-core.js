/* global spaVendor */

function SPA(window, document) {
    "use strict";
    var spa = this;
    this.files = {};
    this.meta = {};
    this.webApi = null;
    this.language = {};
    this.loaded = false;
    this.container = null; // tag kontenera, do którego będą wczytywane szablony 
    this.controllers = [];

    this.beforeControllerChange = null;
    this.onHashChange = null;
    this.currCtrl = null;

    this.onLoad = null;

    var allLoadedCalled = false;

    if (spaVendor.files.language)
        this.language = spaVendor.files.language;

    if (spaVendor.meta)
        this.meta = spaVendor.meta;

    // wczytano wszystkie obiekty vendor-a
    this.onAllLoaded = () => {

        if (allLoadedCalled)
            return;
        allLoadedCalled = true;

        if (window.jQuery) {

            $(document).ajaxSend(function (event, jqXHR, ajaxOptions) {
                jqXHR.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            });

            $(document).ajaxError(function (event, jqxhr, settings, thrownError) {
                this.onError(new EError(jqxhr));
                return true;
            });
        }


        delete window.spaVendor;

        if (typeof this.onLoad === 'function')
            this.onLoad();

        window.dispatchEvent(new CustomEvent('load', {detail: {spaLoad: true}}));
        this.loaded = true;

        for (var i = 0; i < this.controllers.length; i++)
            this.controllers[i] = new SPAController(this, this.controllers[i]);

        this.hashChangeEvent();
    };


    this.alert = (e) => {
        if (!e)
            return;

        var msg = {};
        msg.type = e.type || "info";
        msg.title = e.message || e.value;
        msg.text = e.title;

        if (typeof e === "string")
            msg.text = e;

        swal(msg);

    };

    this.onError = (e) => {
        if (window.Utils && Utils.checkInstance)
            Utils.checkInstance(e, "EError");

        this.alert({
            type: "error",
            message: e.message,
            title: e.title,
            details: e.details
        });
    };



    this.hashChangeEvent = () => {
        var hash = window.location.hash.substring(1);
        if (!hash)
            return;

        if (spa.webApi
                && spa.webApi.impl
                && spa.webApi.impl.service
                && spa.webApi.impl.service.notifications
                && spa.webApi.impl.service.notifications.hashChange)
            spa.webApi.impl.service.notifications.hashChange({params: {hash: hash}});

        var url = hash;
        var params = {};

        if (hash.contains("?")) {
            url = hash.substring(0, hash.indexOf("?"));

            var query = hash.substring(hash.indexOf("?") + 1);
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (typeof params[pair[0]] === "undefined") {
                    params[pair[0]] = decodeURIComponent(pair[1]);
                } else if (typeof params[pair[0]] === "string") {
                    var arr = [params[pair[0]], decodeURIComponent(pair[1])];
                    params[pair[0]] = arr;
                } else
                    params[pair[0]].push(decodeURIComponent(pair[1]));

            }
        }

        var split = url.split("/");
        var path = [];
        for (var i = 0; i < split.length; i++)
            if (split[i].trim())
                path.push(split[i].trim());

        var spinner = new Spinner();
        try {


            if (typeof spa.onHashChange === "function")
                spa.onHashChange({
                    url: url,
                    path: path,
                    params: params
                });

            var newCtrl = null;
            spa.controllers.forEach((ctrl) => {
                for (var i = 0; i < ctrl.urls.length; i++)
                    if (hash.match("^" + ctrl.urls[i] + "$")) {
                        matchedUrl = ctrl.urls[i];
                        newCtrl = ctrl;
                        break;
                    }
                return newCtrl !== null;
            });


            if (typeof spa.beforeControllerChange === "function")
                spa.beforeControllerChange({
                    url: url,
                    path: path,
                    params: params,
                    current: spa.currCtrl,
                    controller: newCtrl
                });


            if (spa.currCtrl && spa.currCtrl.onUnload)
                spa.currCtrl.onUnload({
                    url: url,
                    path: path,
                    params: params,
                    controller: newCtrl
                });

            if (spa.currCtrl) {
                spa.currCtrl.visible = false;
                spa.currCtrl.htmlDoc = null;
                if (!spa.currCtrl.clearOnUnload) {
                    // przenieś strukturę DOM do spa.currCtrl.htmlDoc
                    spa.currCtrl.htmlDoc = document.createElement("div");
                    while (spa.container.childNodes.length > 0)
                        spa.currCtrl.htmlDoc.appendChild(spa.container.childNodes[0]);
                }

            }

            var newInstance = true;

            if (spa.container && newCtrl && newCtrl.htmlTemplate) {
                spa.container.clear();
                if (newCtrl.htmlDoc) {
                    while (newCtrl.htmlDoc.childNodes.length > 0)
                        spa.container.appendChild(newCtrl.htmlDoc.childNodes[0]);
                    newCtrl.htmlDoc = null;
                    newInstance = false;
                } else {
                    var data = spa.files[newCtrl.htmlTemplate];
                    if (!data)
                        throw "File not found '" + newCtrl.htmlTemplate + "'";
                    Utils.copyNode(data, spa.container);
                }
            }

            if (newCtrl && newCtrl.language)
                processLanguage(spa.container, newCtrl);

            if (newInstance && newCtrl && newCtrl.onNewInstance)
                newCtrl.onNewInstance({
                    url: url,
                    path: path,
                    params: params,
                    controller: spa.currCtrl,
                    newInstance: newInstance
                });

            if (newCtrl && newCtrl.onLoad)
                newCtrl.onLoad({
                    url: url,
                    path: path,
                    params: params,
                    controller: spa.currCtrl,
                    newInstance: newInstance
                });

            spa.currCtrl = newCtrl;

            if (spa.currCtrl)
                spa.currCtrl.visible = true;


        } finally {
            spinner.hide();
        }
    }

    addEventListener("hashchange", this.hashChangeEvent);




    // przetwarzanie zmiennych w htmlu
    function processLanguage(src, ctrl) {

        for (var i = 0; i < src.childNodes.length; i++) {
            var node = src.childNodes[i];

            switch (node.nodeType) {
                case 3: //Node.TEXT_NODE
                    var txt = node.nodeValue;
                    if (!txt || txt.indexOf("${") < 0)
                        break;

                    var elements = txt.split("${");

                    var result = "";
                    for (var i = 0; i < elements.length; i++) {
                        var elm = elements[i];
                        if (!elm)
                            continue;
                        var line = "${" + elm;
                        var end = elm.indexOf("}");
                        if (end > 0) {
                            var s = elm.substring(0, end);

                            if (ctrl.language[s]) {
                                var d = document.createElement("div");
                                d.innerText = ctrl.language[s];
                                line = d.innerHTML + elm.substring(end + 1);
                            }
                        }
                        result += line;
                    }

                    node.nodeValue = result;
                    break;

                case 1:
                    processLanguage(node, ctrl);
                    break;
            }

        }

    }

    Object.preventExtensions(this);

}

window.spa = new SPA(window, document);

