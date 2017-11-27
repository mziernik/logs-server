// @flow
'use strict';

import EError from "./EError";
import "./DOMPrototype";
import * as Utils from "./Utils";
import {DEBUG_MODE} from "../Dev";

const js_errors: JsError[] = [];
let tContent; // tag zawierający treść błędów


function canDisplay(err: EError) {
    return true;
}

function sendLog(err: EError) {

}


export function onError(msg: any, file: ?any, line: ?number, column: ?number, ex: ?Error) {

    if (!DEBUG_MODE)
        return;

    const err: EError = new EError(msg || ex);
    let sendLog: boolean = true;
    let jserr: ?JsError = null;

    const now = new Date().getTime();

    if (js_errors.length > 0) {
        const er = js_errors[js_errors.length - 1];
        if (err.message === er.message
            && (!err.line || err.line === er.line)
            && (!err.file || err.file === er.file)) {
            jserr = er;
            ++jserr.cnt;
            //   sendLog &= now - jserr.ts > 1000;
            er.ts = now;
        }
    }

    if (!jserr)
        jserr = new JsError(err);
    // try {
    //     sendLog(err);
    // } catch (e) {
    //     console.error(e);
    // }
    if (!err.message && !err.file)
        return;
    if (!canDisplay(err))
        return;

    let tag = window.$id("_err-dlg_");
    if (!tag) {
        const body: Node = window.document.body;
        if (!body)
            return;

        // $FlowFixMe
        tag = body.tag("div")
            .attr("id", "_err-dlg_")
            .css({
                position: "fixed",
                left: 0,
                right: 0,
                top: 0,
                height: 0,
                zIndex: 999999,
                textAlign: "center"
            });

        tag = tag.tag("div").css({
            margin: "6px",
            maxWidth: "75%",
            border: "2px solid #DD3C10",
            opacity: "0.9",
            boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.5)",
            backgroundColor: "rgba(255, 235, 232, 0.9)",
            fontFamily: "Verdana",
            color: "black",
            fontSize: "10pt",
            fontWeight: "bold",
            borderRadius: "0 0 8px 8px",
            display: "inline-flex"
        });

        tContent = tag.tag("div")
            .css({
                display: "inline-block",
                float: "left",
                padding: "8px 64px",
                userSelect: "text"
            });

        const close = tag.tag("div", "x")
            .css({
                display: "inline-block",
                float: "right",
                cursor: "pointer",
                color: "#c55",
                fontSize: "14pt",
                paddingRight: "6px"
            })
            .on("mouseover", () => {
                close.style.color = "blue";
            })
            .on("mouseout", () => {
                close.style.color = "#d66";
            })
            .on("click", () => {
                js_errors.length = 0;
                window.$id("_err-dlg_").remove();
            });
    }


    tContent.innerHTML = "";
    for (let i = 0; i < js_errors.length; i++) {
        let el = js_errors[i];
        let s = el.message || "";
        if (s.indexOf("Uncaught ") === 0 && s.indexOf(":") > 0)
            s = s.substring("Uncaught ".length).trim();
        tContent.tag("div", (el.cnt > 1 ? "[" + el.cnt + "x] " : "") + s);

        let stack = Utils.toString(el.file) + ", line: " + Utils.toString(el.line);
        if (el.stack && el.stack.length > 1) {
            let arr = [];
            el.stack.forEach(elm => {
                if (!elm.startsWith("<anonymous>"))
                    arr.push(elm);
            });

            let elm: ?string = undefined;
            arr.forEach((s: string) => {
                if (elm === null || s.indexOf(":") === -1)
                    return;
                s = s.substring(0, s.indexOf(":"));

                if (elm === undefined) {
                    elm = s;
                    return;
                }
                elm = elm !== s ? null : elm;
            });

            stack = elm === "bundle.js" ? null : arr.join(", ");
        }

        if (el.file && stack)
            tContent.tag("div", stack)
                .css({
                    fontWeight: "normal",
                    fontSize: "8pt"
                });
        if (i < js_errors.length - 1)
            tContent.tag("br");
    }

    return false;
}

class JsError {
    ts = new Date().getTime();
    cnt: number = 1;
    message: ?string = null;
    file: ?string = null;
    line: ?number = null;
    stack: string[] = [];

    constructor(err: EError) {
        this.ts = new Date().getTime();
        this.cnt = 1;
        this.message = err.message;
        this.file = err.file;
        this.line = err.line;
        if (err.stack) {

            const split = err.stack.split("\n");
            this.stack = [];
            for (let i = 0; i < split.length; i++) {
                let s = split[i].trim();
                if (s.indexOf("at ") !== 0 || s.indexOf(" (") <= 0)
                    continue;
                s = s.substring(s.indexOf(" (") + 2);
                s = s.substring(0, s.indexOf(")"));
                if (s.indexOf("/") >= 0)
                    s = s.substring(s.lastIndexOf("/") + 1);
                if (s.split(":").length > 2)
                    s = s.substring(0, s.lastIndexOf(":"));
                this.stack.push(s);
            }

        }

        js_errors.push(this);
    }
}

window.addEventListener("error", onError);