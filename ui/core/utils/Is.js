// @flow
'use strict';

/**
 * Zbiór metod weryfikujących dane.
 * Każda z metod zwraca boolean-a oraz może wywoływać funkcje zwrotne [then] oraz [otherwise].
 * Przydatne w połączeniu z wyrażeniami strzałkowymi
 */

import "./DOMPrototype";
import "./Prototype";
import * as Utils from "./Utils";

export function boolean(object: ?any, then: ?(object: string) => void, otherwise: ?(object: any) => void): boolean {
    return result(typeof object === "boolean", object, then, otherwise);
}

export function array(object: ?any, then: ?(object: []) => void, otherwise: ?(object: []) => void): boolean {
    return result(object instanceof Array, object, then, otherwise);
}

export function object(object: ?any, then: ?(object: []) => void, otherwise: ?(object: any) => void): boolean {
    return result(typeof object === "object", object, then, otherwise);
}

export function func(object: ?any, then: ?(object: () => void) => void, otherwise: ?(object: any) => void): boolean {
    return result(typeof object === "function", object, then, otherwise);
}

export function string(object: ?any, then: ?(object: string) => void, otherwise: ?(object: any) => void): boolean {
    return result(typeof object === "string", object, then, otherwise);
}

export function number(object: ?any, then: ?(object: number) => void, otherwise: ?(object: any) => void): boolean {
    return result(typeof object === "number", object, then, otherwise);
}

export function defined(object: ?any, then: ?(object: any) => void, otherwise: ?(object: any) => void): boolean {
    return result(object !== undefined && object !== null, object, then, otherwise);
}

export function iterable(object: ?any, then: ?(object: any) => void, otherwise: ?(object: any) => void): boolean {
    return result(typeof object && [Symbol.iterator] === 'function', object, then, otherwise);
}


/**
 * Funkcja sprawdza czy argument [object] jest zdefiniowany i zwraca go lub rezultat funkcji zwrotnych
 * @param object
 * @param then
 * @param otherwise
 */
export function def(object: ?any, then: any | ?(object: any) => void, otherwise: any | ?(object: any) => void): any {

    const cond = object !== undefined && object !== null;

    if (cond && typeof then === "function")
        return then(object);

    if (cond && then !== null && then !== undefined)
        return then;

    if (!cond && typeof otherwise === "function")
        return otherwise(object);

    if (cond && otherwise !== null && otherwise !== undefined)
        return otherwise;

    return object;
}


export function condition(condition: boolean, then: ?(object: any) => void, otherwise: ?(object: any) => void): boolean {
    return result(condition, condition, then, otherwise);
}

/**
 * Sprawdza czy obiekt jest danej instancji
 * @param {type} object
 * @param {type} instances
 * @returns {Boolean}
 */

export function instanceOf(object: any, instances: any[], then: ?(object: any) => void, otherwise: ?(object: any) => void): boolean {
    return result(Utils.verifyObjectInstance(object, instances) === null, object, then, otherwise);
}


export function isFontInstalled(name: string, then: ?(object: any) => void, otherwise: ?(object: any) => void): boolean {
    name = name.replace(/['"<>]/g, '');
    let body: Node = window.document.body;
    let test = document.createElement('div');
    let installed = false;
    let template = '<b style="display:inline !important; width:auto !important; font:normal 10px/1 \'X\',sans-serif !important">ii</b>' +
        '<b style="display:inline !important; width:auto !important; font:normal 10px/1 \'X\',monospace !important">ii</b>';


    if (name) {
        test.innerHTML = template.replace(/X/g, name);
        test.style.cssText = 'position: absolute; visibility: hidden; display: block !important';
        body.insertBefore(test, body.firstChild);
        let ab = test.getElementsByTagName('b');
        installed = ab[0].offsetWidth === ab[1].offsetWidth;
        body.removeChild(test);
    }
    return result(installed, name, then, otherwise);
}

/**
 * Czy dany obiekt (funkcja) jest klasą
 * @param obj
 * @return {boolean}
 */
export function clazz(obj) {
    return typeof obj === 'function' && obj.prototype.constructor === obj;
}


function result(condition: boolean, object: any, then: ?(object: any) => void, otherwise: ?(object: any) => void) {
    if (condition && typeof then === "function")
        then(object);
    if (!condition && typeof otherwise === "function")
        otherwise(object);
    return condition;
}