// @flow
'use strict';

import "../utils/DOMPrototype";
import WebApi, {OnSuccess, OnError} from "./WebApi";
import WebApiResponse from "./Response";
import Spinner from "../component/spinner/Spinner";
import EError from "../utils/EError";
import Dev from "../Dev";

let lastId = 0;

export default class WebApiRequest {
    onSent: (WebApiRequest) => void;
    onSuccess: (data: ?any, response: WebApiResponse) => void;
    onResponse: (response: WebApiResponse) => void;
    onEvent: (response: WebApiResponse) => void;
    onError: (error: ?EError, response: WebApiResponse) => void;

    _processed: boolean = false;

    webApi: WebApi;
    id: string = "" + ++lastId;
    location: string = window.location.href;
    hash: string;
    method: string;
    params: Object;
    headers: Object = {};
    spinner: ?Spinner;
    promise: Promise;
    _resolve: (data: Object, response: WebApiResponse) => void;
    _reject: (error: Error, response: WebApiResponse) => void;

    transportData: Object;
    sendTime: Date;

    constructor(webApi: WebApi, method: string, hash: ?string, params: ?Object, onSuccess: ?OnSuccess, onError: ?OnError) {
        this.webApi = webApi;
        this.promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });

        // przechwyć wyjątki z promise aby nie wyrzucało błędów w konsoli
        this.promise.catch((e) => {

        });

        // for (let i = 0; i < 4; i++)
        //     this.id += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);

        this.hash = hash;
        this.method = method;
        this.onSuccess = onSuccess;
        this.onError = onError;
        this.params = params;
        //    req.spinner = data.spinner === undefined || data.spinner !== null ?         new Spinner() : null;

        // przepisywanie globalnych nagłówków
        for (let name in WebApi.headers)
            if (!this.headers[name])
                this.headers[name] = WebApi.headers[name];


        window.setTimeout(() => webApi.send(this));
    }

    // wyślij zdarzenie związane z danym żądaniem
    event(name: string, data: any) {
        if (this._processed) {
            Dev.warning(`Żądanie ${this.id} zostało już przetworzone`);
            return;
        }


        /*
         ws.send(JSON.stringify({
         id: req.id,
         event: name,
         data: data
         }));*/
    };


    cancel() {/*
     ws.send(JSON.stringify({
     id: req.id,
     event: "cancel"
     }));*/
    };

}
