import * as Check from "./utils/Check";
import * as Store from "./Store";
import * as Utils from "./utils/Utils";


export default class Var<T> {
    _store: Store = null;
    _key: string = null;
    _storeLoaded: boolean = false;
    _instanceOf: [] = null;
    _notNull: boolean = false;
    _nonEmpty: boolean = false;

    constructor(value: T) {
        this._value = value;
        Object.preventExtensions(this);
    }

    _value: T = null;

    get value(): T {
        if (this._store && this._key && !this._storeLoaded) {
            const v = this._store.get(this._key);
            this._value = v === undefined ? this._value : v;
            this._storeLoaded = true;
        }
        return this._value;
    }

    set value(value: T) {
        if (this._instanceOf)
            Check.instanceOf(value, this._instanceOf);
        if (this._notNull)
            Check.isDefined(value);
        if (this._nonEmpty)
            Check.nonEmptyString(value);
        if (this._store && this._key)
            value === undefined ? this._store.remove(this._key) : this._store.set(this._key, value);
        this._value = value;
    }

    localStorage(key: string): Var<T> {
        this._store = Store.LOCAL;
        this._key = Check.nonEmptyString(key);
        return this;
    }

    sessionStorage(key: string): Var<T> {
        this._store = Store.SESSION;
        this._key = Check.nonEmptyString(key);
        return this;
    }

    instanceOf(instances: []): Var<T> {
        this._instanceOf = instances;
        return this;
    }

    notNull(notNull: boolean): Var<T> {
        this._notNull = !!notNull;
        return this;
    }

    nonEmpty(nonEmpty: boolean): Var<T> {
        this._nonEmpty = !!nonEmpty;
        return this;
    }


}

export class VarArray extends Var<Array> {

    constructor(array: []) {
        if (array === undefined) array = [];
        super(array);
    }

    push(item: any) {
        if (!this._value)
            this._value = [];
        this._value.push(item);
        this.value = this._value;
    }

    remove(item: any) {
        if (!this._value) return;
        this._value.remove(item);
        this.value = this._value;
    }

    contains(item: any) {
        this.value; // inicjalizacja
        return this.value && this.value.contains(item);
    }

    forEach(func: (item: any, index: number) => void): [] {
        return Utils.forEach(this.value, func);
    }
}