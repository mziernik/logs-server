// @flow
import * as Utils from "./Utils";

'use strict';
import {asArray} from "./Utils";


// Zamienia wszystkie wystąpienia frazy
// $FlowFixMe
String.prototype.replaceAll = String.prototype.contains || function (from: string, to: string): boolean {
    return this.split(from).join(to);
};


// czy string zawiera daną frazę
// $FlowFixMe
String.prototype.contains = String.prototype.contains || function (str: string): boolean {
    if (!(typeof str === "string"))
        return false;
    return this.toLowerCase().indexOf(str.toLowerCase()) >= 0;
};

/**
 * czy string kończy się daną wartością
 * @type {string} suffix
 */
// $FlowFixMe
String.prototype.endsWith = String.prototype.endsWith || function (suffix: string): boolean {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

/**
 * czy string ropoczyna się od danej wartości
 * @type {string} prefix
 */
// $FlowFixMe
String.prototype.startsWith = String.prototype.startsWith || function (prefix: string): boolean {
    return this.indexOf(prefix) === 0;
};

/**
 * Zwraca true jeśli przycięty tekst jest identyczny bez uwzlędnienia wielkości znaków
 * @param text
 * @return {boolean}
 */
// $FlowFixMe
String.prototype.same = String.prototype.same || function (text: string): string {
    if ((typeof text === 'undefined') || (text === null))
        return false;
    return this.trim().toLowerCase() === text.trim().toLowerCase();
};

/**
 * Konwersja polskich znaków do ANSI
 */
// $FlowFixMe
String.prototype.convertPolishChars = String.prototype.convertPolishChars || function (): string {
    const src = 'ąćęśźńżółĄĆĘŚŹŃŻÓŁ';
    const dest = 'acesznzolACESZNZOL';
    let res = '';
    let c, v;
    for (let i = 0; i < this.length; i++) {
        c = this[i];
        v = src.indexOf(c);
        res += (v >= 0) ? dest[v] : c;
    }
    return res;
};

/**
 * Zamień znaki w strinuu
 */
// $FlowFixMe
String.prototype.replaceChars = String.prototype.replaceChars || function (from: string, to: string): string {
    let res = '';
    for (let i = 0; i < this.length; i++)
        res += from.indexOf(this[i]) >= 0 ? to : this[i];
    return res;
};

/**
 * Zaokrąglenie wartości numerycznej do określonej ilości miejsc po przecinku
 * @param {number} places Ilość miejsc dziesiętnych
 * @return {number}
 */
// $FlowFixMe
Number.prototype.round = Number.prototype.round || function (places: number): number {
    if (!places)
        places = 0;
    const factor = Math.pow(10, places);
    return Math.round(this * factor) / factor;
};


/**
 * Zwróć kopię tablicy
 * @return {Array}
 */
// $FlowFixMe
Array.prototype.clone = Array.prototype.clone || function (): [] {
    return this.slice(0);
};

/**
 * Zwróć nową instancję tablicy zawierającą tylko unikalne elementy
 * @return {Array}
 */
// $FlowFixMe
Array.prototype.unique = Array.prototype.unique || function (): [] {
    return Array.from(new Set(this));
};


/**
 * Wyczyść tablicę
 *  @return {Array}
 */
// $FlowFixMe
Array.prototype.clear = Array.prototype.clear || function (): [] {
    this.length = 0;
    return this;
};

/**
 * Czy tablica jest pusta
 * @return {boolean}
 */
// $FlowFixMe
Array.prototype.isEmpty = Array.prototype.isEmpty || function (): boolean {
    return this.length === 0;
};

/**
 * Czy tablica zawiera element
 * @return {boolean}
 */
// $FlowFixMe
Array.prototype.contains = Array.prototype.contains || function (element: any): boolean {
    return this.indexOf(element) >= 0;
};

/**
 * Czy tablica zawiera dowolny element z innej tablicy
 * @return {boolean}
 */
// $FlowFixMe
Array.prototype.containsAny = Array.prototype.containsAny || function (elements: any[]): boolean {
    return asArray(elements).find(elm => this.indexOf(elm) >= 0) !== undefined;

};

/**
 *  Dodaj element na danej pozycji tablicy
 * @return {Array}
 */
// $FlowFixMe
Array.prototype.insert = Array.prototype.insert || function (index: number, item: any): [] {
    this.splice(index, 0, item);
    return this;
};

/**
 * usuwa element z tablicy
 * @return {boolean}
 */
// $FlowFixMe
Array.prototype.remove = Array.prototype.remove || function (obj: any): boolean {
    let result = false;
    let i = this.indexOf(obj);
    while (i >= 0) {
        this.splice(i, 1);
        result = true;
        i = this.indexOf(obj);
    }
    return result
};


/**
 * Zwraca losowy element
 * @return {any}
 */
// $FlowFixMe
Array.prototype.random = Array.prototype.random || function (): any {
    if (!this.length) return undefined;
    return this[Math.round(Math.random() * (this.length - 1))];
};

/**
 * ustala limit rozmiaru na tablicę. W przypadku przekroczenia usuwa lementy
 * z początku [fromBegin] lub z końca tablicy
 * @return {Array}
 */
// $FlowFixMe
Array.prototype.limit = Array.prototype.limit || function (itemsCount: number, fromBegin: boolean = true): [] {
    if (itemsCount > 0 && itemsCount <= this.length)
        this.splice(fromBegin ? 0 : this.length - itemsCount, this.length - itemsCount);
    return this;
};

/**
 * Przenieś element w obrebie tablicy
 * @type {Function}
 */
// $FlowFixMe
Array.prototype.moveItem = Array.prototype.moveItem || function (index: number, newIndex: number): boolean {
    if (index < 0 || index >= this.length || newIndex < 0 || newIndex >= this.length)
        return false;
    if (newIndex >= this.length) {
        let k = newIndex - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(newIndex, 0, this.splice(index, 1)[0]);
    return true;
};


/**
 * zwraca pierwszy element z tablicy
 * @type {Function}
 */
// $FlowFixMe
Array.prototype.first = Array.prototype.first || function (): ?any {
    if (this.length > 0)
        return this[0];
    return undefined;
};

/**
 * Zwraca ostatni element tablicy
 * @type {Function}
 */
// $FlowFixMe
Array.prototype.last = Array.prototype.last || function (): ?any {
    if (this.length > 0)
        return this[this.length - 1];
    return undefined;
};


/**
 * Dodanie elementu do listy z opcjonalną funkcją zwrotną
 * @type {Function}
 */
// $FlowFixMe
Array.prototype.add = Array.prototype.add || function (element: any, callback: ?(element: any, array: []) => void = null): [] {
    if (element !== undefined) {
        this.push(element);
        if (typeof callback === "function")
            callback(element, this);
    }
    return this;
};

/**
 * Dodaje wszystkie elementy do tablicy
 * @type {Function}
 */
// $FlowFixMe
Array.prototype.addAll = Array.prototype.addAll || function (elements: []): [] {
    if (elements)
        Utils.forEach(elements, el => this.push(el));
    return this;
};

/**
 * porównanie zawartości dwóch tablic (kolejność elementów nie ma znaczenia)
 * @return {boolean}
 */
// $FlowFixMe
Array.prototype.equals = Array.prototype.equals || function (array: []): boolean {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length !== array.length)
        return false;

    this.sort();
    // $FlowFixMe
    array.sort();
    for (let i = 0; i < this.length; i++) {
        // Check if we have nested arrays
        // $FlowFixMe
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].compare(array[i]))
                return false;
            // $FlowFixMe
        } else if (this[i] !== array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};


/**
 * doaje (lub odejmuje) godziny
 * @type {Function}
 */
// $FlowFixMe
Date.prototype.addHours = Date.prototype.addHours || function (count: number): Date {
    debugger;
    this.setHours(this.getHours() + count);
    return this;
};

Date.prototype.formatMS = function () {
    "use strict";

    const f = (number) => (number < 10 ? "0" : "") + number;

    let ms = this.getMilliseconds().toString();
    while (ms.length < 3) ms = "0" + ms;

    return f(this.getFullYear())
        + "-" + f(this.getMonth() + 1)
        + "-" + f(this.getDate())
        + " " + f(this.getHours())
        + ":" + f(this.getMinutes())
        + ":" + f(this.getSeconds())
        + "." + ms;

};
