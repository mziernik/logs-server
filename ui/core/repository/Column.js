// @flow
'use strict';

import {DEV_MODE} from "../core";
import {Check, Is, Utils} from "../$utils";
import {DataType} from "./Type";
import * as Type from "./Type";
import RepoFlag from "./RepoFlag";


//ToDo: Miłosz: readOnly + !autoUpdate = konflikt
export default class Column {

    type: ?DataType = null;
    key: ?string = null;
    name: ?string = null;
    subtitle: ?string = null;
    hint: ?string = null;
    description: ?string = null;
    /**  wartość zostanie wczytana na żądanie pobrania rekordu - zalecane dla dużych danych */
    onDemand: boolean = false;
    enumerate: ?() => Map | Object | Array = null;
    /** Ikony poszczególnych pozycji enumeraty wyświetlane w trybie inline*/
    enumIcons: ?Object = null;
    enumStyles: ?Object = null;
    units: ?() => {} = null;
    readOnly: ?RepoFlag = null;
    required: ?RepoFlag = null;
    hidden: ?RepoFlag = null;
    unique: ?boolean = null;
    /** Czy wartość kolumny  - */
    writable: ?boolean = true;
    min: ?number = null;
    max: ?number = null;
    regex: ?RegExp = null;
    autoGenerated: ?boolean = null;
    trimmed: ?boolean = null;
    value: ?any = null;
    defaultUnit: ?[] = null; //domyślna jednostka [klucz, tekst, mnożnik]
    //ToDo: Parsowanie ze stringa
    textCasing: ?string = null; // określa formatowanie tekstu (uppercase/lowercase/capitalize)
    validator: ?(value: any) => void = null;

    sortable: ? boolean = null;
    sortOrder: ? boolean = null;
    filterable: ? boolean = null;
    searchable: ? boolean = null;

    compare: ?(a: ?any, b: ?any) => number = null;
    filter: ?(filter: ?any, cell: ?any) => boolean = null;
    foreign: ?Foreign = null;
    repository: ?Repository = null;

    constructor(config: (c: Column) => void) {
        if (DEV_MODE)
            this["#instance"] = null;

        const overloaded = this.constructor !== Column.prototype.constructor;
        if (!overloaded)
            Object.preventExtensions(this);

        Check.isFunction(config);
        config(this);

        if (DEV_MODE)
            this["#instance"] = this.key;

        this._update();
    }

    _load(data: Object) {
        for (let name in this)
            if (data[name] !== undefined)
                this[name] = data[name];
        this._update();
    }

    _update() {

        Check.id(this.key);
        Check.nonEmptyString(this.name, new Error("Nazwa kolumny " + this.key + " nie może być pusta"));
        Check.isDefined(this.type);

        if (!(this.type instanceof DataType))
            this.type = Type.get(this.type);

        if (this.trimmed === null && this.type.single === "string" && this.type !== Type.PASSWORD)
            this.trimmed = true;

        Is.string(this.type, t => this.type = Type.get(t));
        Check.instanceOf(this.type, [DataType]);

        Check.nonEmptyString(this.key);
        Check.nonEmptyString(this.name);

        this.hidden = new RepoFlag(this.hidden);
        this.readOnly = new RepoFlag(this.readOnly);

        this.required = new RepoFlag(this.required);
        this.hint = this.hint || this.name;

        this.regex && (this.regex = new RegExp(this.regex));
        //
        // if (Is.string(this.foreign)) {
        //     const foreignRepoKey = this.foreign;
        //     this.foreign = () => Repository.get(foreignRepoKey, true);
        // }

        if (!this.enumerate && this.type.enumerate)
            this.enumerate = () => this.type.enumerate;

        this.enumIcons = this.enumIcons || this.type.enumIcons;
        this.enumStyles = this.enumStyles || this.type.enumStyles;

        if (this.enumerate && !Is.func(this.enumerate)) {
            const arr = this.enumerate instanceof Array;
            const map: Map = new Map();
            Utils.forEach(this.enumerate, (value, key) => {
                if (arr) {
                    key = value;
                    if (value instanceof Array) {
                        key = value[0];
                        value = Is.defined(value[1]) ? value[1] : key;
                    }
                }
                map.set(this.type.raw.parse(key), value);
            });
            this.enumerate = () => map;
        }


        if (this.type.units && !this.units)
            this.units = () => this.type.units;

        const Foreign = require("./Foreign").default;

        Is.defined(this.enumerate, e => Check.isFunction(e));
        Is.defined(this.units, e => Check.isFunction(e));

        if (this.foreign && !(this.foreign instanceof Foreign))
            this.foreign = new Foreign(this, this.foreign);
    }

    parse(value: any): any {
        return this.type.parse(value);
    }


}