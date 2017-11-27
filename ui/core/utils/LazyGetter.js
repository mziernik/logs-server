import * as Check from "./Check";

export default class LazyGetter {

    _value: any;
    _processed: boolean = false;
    _processor: (value: any) => any;

    constructor(value: any, processor: (value: any) => any) {
        this._value = value;
        this._processed = Check.isFunction(processor);
    }

    get value(): any {
        if (!this._processed) {
            this._value = this._processor(value);
            this._processed = true;
        }

        return this._value;
    }

    set value(value: any) {
        this._value = value;
        this._processed = false;
    }

}