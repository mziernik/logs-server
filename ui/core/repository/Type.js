import * as Check from "../utils/Check";
import * as Utils from "../utils/Utils";
import * as Is from "../utils/Is";
import Icon from "../component/glyph/Icon";


export type SimpleType = "any" | "boolean" | "number" | "string" | "object" | "array";

const all = {};


export class DataType {

    /** Typ bazowy np dla elementów listowych (int[] -> int)*/
    raw: DataType = this;

    simpleType: SimpleType;
    parser: (value: any) => any;
    serializer: (value: any) => any;
    formatter: (value: any, enumerate: Map) => string;
    name: string;
    single: boolean;
    description: string;
    /** Ikony poszczególnych pozycji enumeraty wyświetlane w trybie inline*/
    enumIcons: ?Object = null;
    enumStyles: ?Object = null;

    enumerate: ?[] = null; // np.: [['tekst',{wartość}],['tekst2',{wartość2}],...]
    isBinary: boolean = false;

    units: ?[] = null; // [klucz, nazwa, mnożnik]

    constructor(config: (dt: DataType) => void, single: boolean = true) {
        Check.isFunction(config);
        config(this);
        this.single = single;

        if (single) {
            if (all[this.name]) throw new Error("Typ danych " + Utils.escape(this.name) + " już istnieje");
            all[this.name] = this;
        }

        //  name: string, simpleType: SimpleType, parser: (value: any) => any)
        Check.isFunction(this.parser);
        Check.instanceOf(this.simpleType, ["any", "boolean", "number", "string", "object", "array"]);
    }

    get isList(): boolean {
        return this instanceof ListDataType;
    }

    get isMultiple(): boolean {
        return this instanceof MultipleDataType;
    }

    /** Formatuje dane enumeraty z mapy, obiektu lub tablicy do postaci funkcji zwrotnej */
    static getMap(source: any): Map {
        if (!source) return null;

        if (Is.func(source))
            source = source();

        if (source instanceof Map)
            return source;

        const map = new Map();
        Utils.forEach(source, (v, k) => map.set(k, v));
        return map;
    }

    /** Zwraca wartość wyświetlaną */
    formatDisplayValue(value: any, enumerate: ?Map): string {

        enumerate = enumerate || this.enumerate;

        if (enumerate) enumerate = DataType.getMap(enumerate);

        if (this.formatter)
            return this.formatter(value, enumerate);

        return Utils.toString(Utils.coalesce(enumerate ? enumerate.get(value) : null, value));
    }

    equals(v1: any, v2: any) {
        if (v1 === v2)
            return true;

        if (v1 === null || v1 === undefined || v2 === null || v2 === undefined) return false;

        const x1 = this.serialize(v1);
        const x2 = this.serialize(v2);

        if (Is.array(x1) && Is.array(x2))
            return window.JSON.stringify(x1) === window.JSON.stringify(x2);

        return x1 === x2;
    }

    clone(): DataType {
        const result = new this.constructor(this.name, this.simpleType, this.parser);
        Utils.clone(this, result);
        return result;
    }

    parse(value: ?any): any {
        return value === null || value === undefined ? value : this.parser(value);
    }

    serialize(value: ?any): any {
        return value === null || value === undefined ? value : this.serializer ? this.serializer(value) : value;
    }

    // /** @private */
    // setEnumerate(enumerate: [], multiple: boolean = false): DataType {
    //     this.enumerate = enumerate;
    //     this.multiple = multiple;
    //     return this;
    // }
    //
    // /** @private */
    // setUnits(units: Map<string, String>): DataType {
    //     this.units = units;
    //     return this;
    // }

    //==================================================================================================================

    //--------------------- CellsDataType ---------------------

    //static BOOL_STRING = new CellsDataType("boolStr", [DataType.BOOLEAN, DataType.STRING], val => val);
}


export function get(name: string): DataType {

    let result: DataType = all[name];
    if (result)
        return result;

    if (name.endsWith("[]"))
        return new ListDataType(get(name.substring(0, name.length - 2).trim()));
    //  return ENUMS;

    if (name.startsWith("{") && name.endsWith("}"))
        return new MapDataType(get(name.substring(1, name.length - 1).trim()));


    if (name.startsWith("(") && name.endsWith(")")) {
        const names = name.substring(1, name.length - 1).split(",");
        return new MultipleDataType(names.map(name => get(name.trim())));
    }

    throw new Error("Nieznany typ danych " + Utils.escape(name));
}


export class ListDataType extends DataType {


    constructor(type: DataType) {
        super((dt: DataType) => {
            dt.name = type.name + "[]";
            dt.simpleType = "array";
            dt.parser = value => {
                Check.isArray(value);
                value = Utils.forEach(value, elm => this.raw.parse(elm));
                return value;
            };
            dt.formatter = (val, map) => Utils.forEach(val, v => this.raw.formatDisplayValue(v, map)).join(", ");

        }, false);
        this.raw = Check.instanceOf(type, [DataType]);
    }

}

export class MapDataType extends DataType {

    types: DataType[];

    constructor(type: DataType) {
        super((dt: DataType) => {
            dt.name = "{" + type.name + "}";
            dt.simpleType = "object";
            dt.parser = value => {
                Check.isObject(value);
                const result: Map = new Map();
                Utils.forEach(value, (val, key) => {
                    if (value instanceof Array) {
                        key = val instanceof Array ? val[0] : null;
                        val = val instanceof Array ? val[1] : null;
                    }

                    result.set(Utils.toString(key).trim(), this.raw.parse(val));
                });
                return result;
            };
            dt.formatter = (val: Map) => Utils.forEach(val, (v, k) => Utils.toString(k) + ": " + this.raw.formatDisplayValue(v)).join(",\n");

        }, false);

        this.raw = type;
        this.types = [STRING, type];
    }

}

export class MultipleDataType extends DataType {

    types: DataType[];

    constructor(types: DataType[]) {
        super((dt: DataType) => {
            dt.name = "(" + types.map(c => c.name).join(", ") + ")";
            dt.simpleType = "array";
            dt.parser = value => {
                // debugger;
                return value;
            }
        }, false);
        this.types = types;
    }
}


function parseNumber(value: any, parsed: number) {
    if (value instanceof Array || isNaN(value) || isNaN(parsed))
        throw new Error('Nieprawidłowa wartość numeryczna: ' + Utils.escape(value));
    return parsed;
}

export const ANY: DataType = new DataType((dt: DataType) => {
    dt.name = "any";
    dt.simpleType = "any";
    dt.parser = val => val;
    dt.formatter = val => Utils.escape(val);
});

export const JSON: DataType = new DataType((dt: DataType) => {
    dt.name = "json";
    dt.simpleType = "any";
    dt.parser = val => val;
    dt.formatter = val => Utils.escape(val);
});

export const BOOLEAN: DataType = new DataType((dt: DataType) => {
    dt.name = "boolean";
    dt.simpleType = "boolean";
    dt.parser = val => {
        return !!val;
    };
    dt.formatter = (value: boolean) => value ? "Tak" : "Nie";
    dt.enumIcons = {
        true: Icon.CHECK,
        false: Icon.TIMES,
    }
});

export const STRING: DataType = new DataType((dt: DataType) => {
    dt.name = "string";
    dt.simpleType = "string";
    dt.parser = val => "" + val;
});

export const URL: DataType = new DataType((dt: DataType) => {
    dt.name = "url";
    dt.simpleType = "string";
    dt.parser = val => "" + val;
});

export const CHAR: DataType = new DataType((dt: DataType) => {
    dt.name = "char";
    dt.simpleType = "string";
    dt.parser = val => val ? Utils.toString(val)[0] : val;
});


export const UUID: DataType = new DataType((dt: DataType) => {
    dt.name = "uid";
    dt.simpleType = "string";
    dt.parser = val => {
        if (!Is.defined(val))
            return;
        const v = Utils.toString(val).trim().toLowerCase();
        if (!v.length) return null;

        if (v === "00000000-0000-0000-0000-000000000000")
            throw new Error("UID nie może mieć wartości " + v);

        if (!v.match("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"))
            throw new Error(Utils.escape(val) + " nie jest prawidłowym identyfikatorem UID");

        return v;
    }
});

export const GUID: DataType = new DataType((dt: DataType) => {
    dt.name = "guid";
    dt.simpleType = UUID.simpleType;
    dt.parser = UUID.parser;
});

export const REGEX: DataType = new DataType((dt: DataType) => {
    dt.name = "regex";
    dt.simpleType = "string";
    dt.parser = val => val instanceof RegExp ? val : new RegExp(val);
});

export const FILE_NAME: DataType = new DataType((dt: DataType) => {
    dt.name = "fileName";
    dt.simpleType = "string";
    dt.parser = val => val;
});

export const PASSWORD: DataType = new DataType((dt: DataType) => {
    dt.name = "password";
    dt.simpleType = "string";
    dt.parser = val => "" + val;
});

export const KEY: DataType = new DataType((dt: DataType) => {
    dt.name = "key";
    dt.simpleType = "string";
    dt.parser = val => "" + val;
});

// textarea
export const MEMO: DataType = new DataType((dt: DataType) => {
    dt.name = "memo";
    dt.simpleType = "string";
    dt.parser = val => "" + val;
});

export const EMAIL: DataType = new DataType((dt: DataType) => {
    dt.name = "email";
    dt.simpleType = "email";
    dt.description = "Adres e-mail";
    //ToDo: walidacja emaila
    dt.parser = val => {
        return val;
    };
});

export const FILE: DataType = new DataType((dt: DataType) => {
    dt.name = "file";
    dt.simpleType = "object";
    dt.description = "Plik";
    dt.isBinary = true;
    dt.parser = val => val instanceof BinaryData ? val : new BinaryData(val);
    dt.formatter = (val: BinaryData) => val ? val.name : null;
    dt.serializer = (val: BinaryData) => val ? {
        id: val.id,
        name: val.name,
        size: val.size
    } : null;
});

export const IMAGE: DataType = new DataType((dt: DataType) => {
    dt.name = "image";
    dt.simpleType = "object";
    dt.description = "Obrazek";
    dt.isBinary = true;
    dt.parser = FILE.parser;
    dt.formatter = FILE.formatter;
    dt.serializer = FILE.serializer;
});

export const PHONE: DataType = new DataType((dt: DataType) => {
    dt.name = "phone";
    dt.simpleType = "string";
    dt.description = "Numer telefonu";
    dt.parser = val => {
        return val;
    };
});


export const ICON: DataType = new DataType((dt: DataType) => {
    dt.name = "icon";
    dt.simpleType = "string";
    dt.description = "Ikona"; //FontAwesome
    dt.parser = val => {
        return val;
    };
    dt.enumerate = {};
    dt.enumIcons = {};

    Icon.ALL.forEach((icon: Icon) => {
        dt.enumIcons[icon.name] = icon;
        dt.enumerate[icon.name] = icon.name;
    });


    dt.enumIcons = {
        true: Icon.CHECK,
        false: Icon.TIMES,
    }


});


export const DATA_TYPE: DataType = new DataType((dt: DataType) => {
    dt.name = "dataType";
    dt.simpleType = "string";
    dt.description = "Typ danych";
    dt.enumerate = () => {
        const map = new Map();
        Utils.forEach(all, (d: DataType) => map.set(d.name, d.name));
        return map;
    };
    dt.parser = val => {
        return val;
    };
});

export const BYTE: DataType = new DataType((dt: DataType) => {
    dt.name = "byte";
    dt.simpleType = "number";
    dt.parser = val => parseNumber(val, parseInt(Number(val)));
});

export const SHORT: DataType = new DataType((dt: DataType) => {
        dt.name = "short";
        dt.simpleType = "number";
        dt.parser = val => parseNumber(val, parseInt(Number(val)));
    }
);
export const INT: DataType = new DataType((dt: DataType) => {
        dt.name = "int";
        dt.simpleType = "number";
        dt.parser = val => parseNumber(val, parseInt(Number(val)));
    }
);

export const LONG: DataType = new DataType((dt: DataType) => {
        dt.name = "long";
        dt.simpleType = "number";
        dt.parser = val => parseNumber(val, parseInt(Number(val)));
    }
);

// rozmiar danych w bajtach
export const SIZE: DataType = new DataType((dt: DataType) => {
    dt.name = "size";
    dt.simpleType = "number";
    dt.parser = val => parseNumber(val, parseInt(Number(val)));
    dt.units = [
        ["b", "B", 1],
        ["kb", "KB", 1024],
        ["mb", "MB", 1024 * 1024],
        ["gb", "GB", 1024 * 1024 * 1024],
    ];
    dt.formatter = (val: number) => Utils.formatFileSize(val);
});

export const FLOAT: DataType = new DataType((dt: DataType) => {
    dt.name = "float";
    dt.simpleType = "number";
    dt.parser = val => parseNumber(val, parseFloat(Number(val)))
});

export const DOUBLE: DataType = new DataType((dt: DataType) => {
    dt.name = "double";
    dt.simpleType = "number";
    dt.parser = val => parseNumber(val, parseFloat(Number(val)))
});

export const DATE: DataType = new DataType((dt: DataType) => {
    dt.name = "date";
    dt.simpleType = "number";
    dt.parser = val => {

        if (val <= 0)
            return new Date();

        if (typeof val === "number")
            return new Date(val * (1000 * 60 * 60 * 24));

        const date = new Date(val);
        if (isNaN(date))
            throw new Error('Nieprawidłowa wartość daty (' + Utils.escape(val) + ")");
        return date;
    };
    dt.formatter = val => !Is.defined(val) ? val
        : _fix2(val.getDate()) + "-" + _fix2(val.getMonth() + 1) + "-" + val.getFullYear();
    /** Liczba dni które upłynęły od 01/01/1970*/
    dt.serializer = (val: Date) => Math.round(val.getTime() / (1000 * 60 * 60 * 24));
});

function _fix2(number: number) {
    return (number < 10 ? "0" : "") + number;
}

export const TIME: DataType = new DataType((dt: DataType) => {
    dt.name = "time";
    dt.simpleType = "number";
    dt.formatter = val => !Is.defined(val) ? val
        : _fix2(val.getHours()) + ":" + _fix2(val.getMinutes())
        + (val.getSeconds() > 0 ? ":" + _fix2(val.getSeconds()) : "");

    dt.parser = val => {

        if (val <= 0)
            return new Date();

        if (typeof val === "number") {
            const ms = val % 1000;
            val = (val - ms) / 1000;
            const s = val % 60;
            val = (val - s) / 60;
            const m = val % 60;
            val = (val - m) / 60;
            const h = val % 24;
            val = (val - h) / 24;
            return new Date(0, 0, 0, h, m, s, ms);
        }

        const date = new Date(val);
        if (isNaN(date))
            throw new Error('Nieprawidłowa wartość czasu (' + Utils.escape(val) + ")");
        return date;
    };
    dt.serializer = (val: Date) => val.getMilliseconds()
        + val.getSeconds() * 1000
        + val.getMinutes() * 1000 * 60
        + val.getHours() * 1000 * 60 * 60;
});

export const TIMESTAMP: DataType = new DataType((dt: DataType) => {
    dt.name = "timestamp";
    dt.simpleType = "number";
    dt.parser = val => {
        if (val <= 0)
            return new Date();
        const date = new Date(val);
        if (isNaN(date))
            throw new Error('Nieprawidłowa wartość znacznika czasu (' + Utils.escape(val) + ")");
        return date;
    };
    dt.formatter = (val: Date) => !Is.defined(val) ? val
        : _fix2(val.getFullYear()) + "-" + _fix2(val.getMonth() + 1) + "-" + val.getDate() + " "
        + _fix2(val.getHours()) + ":" + _fix2(val.getMinutes()) + ":" + _fix2(val.getSeconds());

    dt.serializer = (val: Date) => val.getTime();
});

// upływ czasu (milisekundy)
export const DURATION: DataType = new DataType((dt: DataType) => {
    dt.name = "duration";
    dt.simpleType = "number";
    dt.parser = val => {
        //ToDo: dopisać
        return val;
    };
    dt.formatter = (val: number) => Utils.formatUnits(val, {
        h: 1000 * 60 * 60,
        m: 1000 * 60,
        s: 1000,
        ms: 0
    });

    dt.units = [
        ["ms", "ms", 1],
        ["s", "s", 1000],
        ["m", "m", 1000 * 60],
        ["h", "h", 1000 * 60 * 60],
        ["d", "d", 1000 * 60 * 60 * 24]
    ];
});

/** Jedna wartość z enumeraty */
export const ENUM: DataType = new DataType((dt: DataType) => {
    dt.name = "enum";
    dt.simpleType = "string";
    dt.parser = val => {
        return val;
    };
    dt.formatter = (val, map) => frmt(val, map);
});

/** Wiele wartości z enumeraty*/
export const ENUMS: DataType = new DataType((dt: DataType) => {
    dt.name = "enums";
    dt.simpleType = "array";
    dt.parser = val => {
        // debugger;
        return val;
    };
    dt.serializer = val => {
        //   debugger;
        return val;
    };

    dt.formatter = (val, map) => frmt(val, map);
});

function frmt(value: any, map: ?Map): string {
    if (value instanceof (Array))
        value = Utils.forEach(value, (val) => {
            return map ? map.get(val) : val;
        });
    else
        value = map ? map.get(value) : value;
    const val: string = Utils.escape(Utils.toString(value)) || "";
    return val.substring(1, val.length - 1);
}

export const TEXT_CASING = {
    NONE: null,
    UPPERCASE: 'uppercase',
    LOWERCASE: 'lowercase',
    CAPITALIZE: 'capitalize'
};

export class BinaryData {

    id: string;
    name: string;
    size: number;
    preview: boolean;
    href: ?string;

    constructor(data: Object) {
        this.id = Check.nonEmptyString(data.id);
        this.name = Check.nonEmptyString(data.name);
        this.size = data.size;
        this.preview = data.preview;

        this.href = data.href;
        if (this.href && !this.href.contains("://")) {
            this.href = require("../config/CoreConfig").api.httpUrl.value + "/" + this.href;
        }
    }
}

export class UploadData extends BinaryData {

    file: File;
    now: boolean; // czy uploadowanie ma być rozpoczęte od razu
    multiPart: boolean; // tryb multipart
    headers: object; // opcjonalne nagłówki HTTP
    uploaded: boolean;

    constructor(file: File, data: Object) {
        data.name = data.name || file.name;
        data.size = data.size || file.size;
        super(data);
        this.file = file;
        this.now = data.now;
        this.multiPart = data.multiPart;
        this.headers = data.headers;
    }
}