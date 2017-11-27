// @flow
'use strict';


import "../utils/DOMPrototype";
import WebApiResponse from "./Response";

export default class WebApiMessage {

    response: WebApiResponse;
    type: ["error"];
    value: string;
    title: string;
    details: string;
    stackTrace: string;

    constructor(response: WebApiResponse, src: Object) {
        this.response = response;
        this.type = src.type;
        this.value = src.value;
        this.title = src.title;
        this.details = src.details;
        this.stackTrace = src.stackTrace;
    }

}
