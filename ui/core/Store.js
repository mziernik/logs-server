import Dev from "./Dev";
import * as Check from "./utils/Check";

export class Store {

    _base: any;

    constructor(base: any) {
        this._base = base;
    }

    /**
     * Wczytaj wartość zapamiętaną w Storage. Rezultatem jest wartość, obiekt lub tablica
     * @param {type} name
     * @returns {undefined|Array|Object}
     */
    get (name: string): ?any {
        let value = this._base.getItem(name)
        try {
            if (value && value.length > 1 && value.indexOf("#") === 0)
                value = window.atob(value.substring(1));
            return value ? JSON.parse(value) : undefined;
        } catch (e) {
            Dev.error(this, e);
            return undefined;
        }
    };

    /**
     * Zapamiętaj wartość w local storage powiązaną z danym kontrolerem - wartością jest dowolny obiekt
     * @param {type} name
     * @param {type} value
     * @returns {undefined}
     */
    set (name: string, value: ?any, encode: boolean = false) {
        if (value === undefined) return;
        value = JSON.stringify(value);
        this._base.setItem(name, encode ? "#" + window.btoa(value) : value);
    };


    remove(name: string) {
        this._base.removeItem(name);
    }

    variable(key: string): StoreVariable<*> {
        return new StoreVariable(this, key);
    }
}


export const LOCAL: Store = new Store(window.localStorage);
export const SESSION: Store = new Store(window.sessionStorage);
