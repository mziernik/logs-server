// @flow
'use strict';

import * as Utils from "./Utils"

export default class EError {

    message: string = ""; // sformatowana postać tekstowa
    title: string = "Błąd";
    details: ?string = null;
    id = null;
    stack: ?string = null;
    isEmpty: boolean = false;
    file: ?string = null;
    line: ?number = null;
    column: ?number = null;
    /** Wyjątek został obsłużony (np wyświetlony alert) */
    handled: ?boolean = null;

    constructor(source: any) {
        if (!source)
            return;

        try {

            if (source instanceof EError) {
                Utils.clone(source, this);
                return;
            }

            if (Utils.className(source) === "ErrorEvent") {
                this.message = source.message;
                this.file = source.filename;
                this.line = source.lineno;
                this.column = source.colno;
                this.stack = source.error ? source.error.stack : null;
                return;
            }

            if (source instanceof Error) {
                const err: Error = source;
                this.message = err.message;
                this.title = err.name;
                this.stack = err.stack || err.stacktrace || err.message;
                return;
            }

            if (Utils.className(source) === "XMLHttpRequest" || (source.status && source.statusText)) {
                const xhr: XMLHttpRequest = source;

                // zakładamy ze jest to XMLHttpRequest
                this.message = "";
                const ext = xhr.status !== 0 && xhr.statusText;
                if (!ext) {
                    this.message = "Brak odpowiedzi serwera";
                    return;
                }

                try {
                    let err = xhr.getResponseHeader("Error");
                    if (err)
                        err = JSON.parse(err);

                    // if (Utils.className(err) === "Array") {
                    //
                    //     this.id = err[0];
                    //     this.title = err[1];
                    //     this.message = err[2];
                    //     if (err[3])
                    //         for (let i = 0; i < err[3].length; i++)
                    //             this.details[err[3][i][0]] = err[3][i][1];
                    // }
                } catch (e) {
                    window.console.error(e);
                }

                let ct = xhr.getResponseHeader("Content-Type");
                if (ct)
                    ct = ct.toLowerCase();
                if (source.status === 0 && !source.statusText) {
                    this.isEmpty = true;
                    return;
                }

                let msg = this.message;
                if (!msg)
                    msg = "Błąd " + source.status + ": " + source.statusText;
                if (ct && ct.indexOf("text/plain") >= 0 && source.responseText)
                    msg = "Błąd " + source.status + ": " + source.responseText;
                this.message = msg;
                return;
            }

            this.message = Utils.toString(source);

        } catch (ex) {
            window.console.error(ex);
        }
    }


    toString(): string {
        return this.message;
    }
}