import * as Utils from "./Utils";

export default class Exception extends Error {

    map: Map<String, String> = new Map();

    constructor(context: any, e: Error) {
        if (!(context instanceof Error))
            e.message = Utils.className(context) + ": " + e.message;
        super(e);
    }

    add(name: any, value: any): Exception {
        this.map.set(Utils.toString(name), Utils.toString(value));
        return this;
    }
}