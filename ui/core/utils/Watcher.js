import {Check, Is} from "../$utils";

/**
 * Klasa monitorująca pola obiektu.
 */

export default class Watcher {

    _object: Object;
    _values: Map = new Map();
    _onGet: (name: string, value: any) => any;
    _onSet: (name: string, value: any) => any;
    _onFirstGet: (name: string, value: any) => void;
    _onFirstSet: (name: string, value: any) => void;

    constructor(object: Object) {
        this._object = object;
    }

    watch(filter: (name: string, value: any) => boolean | string[]): Watcher {

        const names: string[] = Is.array(filter) ? filter : Object.getOwnPropertyNames(this._object);

        let firstGet = true;
        let firstSet = true;

        names.forEach(name => {
            const val = this._object[name];
            if (Is.func(filter) && !filter(name, val))
                return;

            this._values.set(name, val);

            Object.defineProperty(this._object, name, {
                get: () => {
                    let value = this._values.get(name);
                    if (firstGet && this._onFirstGet) {
                        firstGet = false;
                        this._onFirstGet(name, value);
                        value = this._values.get(name);
                    }
                    firstGet = false;
                    if (this._onGet)
                        value = this._onGet(name, value);
                    return value;

                },
                set: value => {
                    if (firstSet && this._onFirstSet) {
                        firstSet = false;
                        this._onFirstSet(name, value);
                    }
                    firstSet = false;
                    if (this._onSet)
                        value = this._onSet(name, value);
                    this._values.set(name, value);
                }
            });

        });

        return this;
    };

    onGet(func: (name: string, value: any) => any): Watcher {
        this._onGet = Check.isFunction(func);
        return this;
    }

    onSet(func: (name: string, value: any) => any): Watcher {
        this._onSet = Check.isFunction(func);
        return this;
    }

    onFirstGet(func: (name: string, value: any) => void): Watcher {
        this._onFirstGet = Check.isFunction(func);
        return this;
    }

    onFirstSet(func: (name: string, value: any) => void): Watcher {
        this._onFirstSet = Check.isFunction(func);
        return this;
    }

}