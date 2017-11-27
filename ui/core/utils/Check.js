// @flow
'use strict';

/**
 * Zbiór funkcji weryfikujących.
 * Każda z nich zwraca weryfikowany obiekt (wzorzec builder) jeśli jest poprawny, lub wyjątek.
 * Można deklarować własne wyjątki, np let array = Check.isArray(obj, new Error("Wymagana tablica"));
 */

import "./DOMPrototype";
import "./Prototype";
import * as Utils from "./Utils";

export function isDefined(value: ?any, error: ?Error = null): any {
    if (value === undefined || value === null)
        throw error ? error : new Error("Niezdefiniowana wartość");
    return value;
}

/**
 * Sprawdza czy wartość jest zgodna z jedną z dozwolonych
 * @param value
 * @param allowed
 * @param error
 */
export function oneOf<T:any>(value: T, allowed: any[], error: ?Error = null): T {
    allowed = Utils.asArray(allowed);
    for (let i = 0; i < allowed.length; i++)
        if (allowed[i] === value)
            return value;
    throw error ? error : new Error("Nieprawidłowa wartość " + Utils.escape(value) + ". Dozwolone: "
        + allowed.map(v => Utils.escape(v)).join(", "));
}

export function isString(value: ?string, error: ?Error = null): string {
    if (typeof value === "string")
        return value;
    throw error ? error : new Error("Wymagana wartość typu string" + _details(value));
}

export function isFunction(value: ?() => ?any, error: ?Error = null): () => ?any {
    if (typeof value === "function")
        return value;
    throw error ? error : new Error("Wymagana funkcja" + _details(value));
}


export function isArray(value: ?[], error: ?Error = null): Array {
    if (value instanceof Array)
        return value;
    throw error ? error : new Error("Wymagana tablica" + _details(value));
}

export function isObject(value: ?Object, error: ?Error = null): Object {
    if (value instanceof Object)
        return value;
    throw error ? error : new Error("Wymagany obiekt" + _details(value));
}

export function isPlainObject(value: ?Object, error: ?Error = null): Object {
    if (typeof value === 'object' && value.constructor === Object)
        return value;
    throw error ? error : new Error("Wymagany obiekt" + _details(value));
}

export function isBoolean(value: ?[], error: ?Error = null): Array {
    if (typeof value === "boolean")
        return value;
    throw error ? error : new Error("Wymagany boolean" + _details(value));
}


export function nonEmptyString(value: ?string, error: ?Error = null): string {
    if (value === null || value === undefined)
        throw error ? error : new Error("Wartość nie może być pusta");
    isString(value, error);
    if (!value.trim())
        throw error ? error : new Error("Wartość nie może być pusta");
    return value;
}

export function nonEmptyArray(value: ?Array, error: ?Error = null): string {
    isArray(value, error);
    if (!value.length)
        throw error ? error : new Error("Tablica nie może być pusta");
    return value;
}

/**
 * Sprawdza czy obiekt zawiera pola [fields]
 * @param object
 * @param {Array | Object} fields lista nazw pól (w przypadku tablicy) lub nazw i typów pól (w przypadku obiektu)
 * @return {?Array}
 */
export function shape(object: ?Object, fields: Object | Array, error: ?Error = null): Object {
    isObject(object);

    const keys = Object.getOwnPropertyNames(object);

    if (fields instanceof Array) {
        fields.forEach(field => {
            if (keys.indexOf(field) === -1)
                throw error ? error : new Error('Obiekt nie zawiera wymaganego pola "' + field + '"');
        });
        return object;
    }

    Utils.forEach(fields, (value, field) => {
        if (keys.indexOf(field) === -1)
            throw error ? error : new Error('Obiekt nie zawiera wymaganego pola "' + field + '"');
        instanceOf(object[field], value, error);
    });

    return object;
}


/**
 * Funkcja sprawdza czy wartość przekazana w argumencie id jest prawidłowym identyfikatorem
 * @param {string} id
 * @param {string} extraChars
 * @param error
 * @returns {string} id
 */
export function id(id: string, extraChars: string = "", error: ?Error) {
    id = nonEmptyString(id).trim();
    const allowed = "0123456789_abcdefghijklmnopqrstuwvxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
        + (typeof extraChars === "string" ? extraChars : "");
    for (let i = 0; i < id.length; i++)
        if (allowed.indexOf(id[i]) < 0)
            throw error ? error : new Error('Nieprawidłowy identyfikator "' + id + '", niedozwolony znak "' + id[i] + '"');
    return id;
}

/**
 * Funkcja sprawdza czy obiekt należy do jednej z instancji przekazanej w argumencie instances
 * @param object - argument może być null-em, funkcja nie zgłosi błędu
 * @param {type|string} instances - tablica lub elementy (funkcję lub nazwy klas)
 * @param error
 * @returns object
 */
export function instanceOf<T:any>(object: T, instances: any[], error: ?Error = null): T {
    const res = Utils.verifyObjectInstance(object, instances);
    if (res === null)
        return object;
    throw error ? error : new Error("Nieprawidłowa instancja obiektu.\nOczekiwana "
        + (res: string[]).join(" lub ") + _details(object));
}


function _details(value: any) {

    let val = null;
    if (value === null)
        val = "null";
    else if (value === undefined)
        val = "undefined";
    else {
        val = Utils.escape(value);
        if (val === {}.toString() || val === [].toString())
            val = null;
    }

    return ", aktualnie: " + (value === null ? "null" : value === undefined ? "undefined"
        : Utils.className(value) + (val ? " (" + val + ")" : ""));
}