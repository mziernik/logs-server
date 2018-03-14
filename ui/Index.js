// @flow
import "./core/Bootstrap";
import "./core/utils/ErrorHandler";
import "./core/core";
import "./core/component/enhsplitter/enhsplitter.js";
import "./core/component/enhsplitter/enhsplitter.css";

import Logs from "./view/console";
import {TEST_MODE} from "./core/core";

window.addEventListener("load", () => {
    $('#main').enhsplitter({position: '20%'});
    $('#content').enhsplitter({vertical: false, position: '20%', minSize: 0});

    debugger;

    window.logs = new Logs();


    var url = window.location.href.replace("http://", "ws://") + "console";

    const ws = new WebSocket(url);

    ws.onclose = function (code, reason, wasClear) {

    };

    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.logs)
            window.logs.add(data.logs);
    };

    ws.onopen = function (event) {

    };
});

