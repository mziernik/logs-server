//# sourceURL=file:///res/utils.js

/* global HTMLInputElement */
/* global HTMLElement */
/* global HTMLSelectElement */
/* global HTMLCollection*/
/* global Node */
/* global Element */
/* global Error */
/* global MouseEvent */

"use strict";

if (!window.Utils)
    window.Utils = {};

//  document.getElementById
function $id(objectOrId) {
    return typeof objectOrId === "string" ? document.getElementById(objectOrId) : objectOrId;
}

//  document.createElement
function $tag(tagName, textContent) {
    if (!tagName)
        return null;
    var tag = document.createElement(tagName);
    if (textContent !== null && textContent !== undefined)
        tag.txt(textContent);
    return tag;
}

function dump(object, prefix, trace) {
    'use strict';
    prefix = prefix || 'Object dump: ';
    console.log(
            prefix + '(' + typeof object + ') -> ' + JSON.stringify(object, null, '    '));
    if (trace)
        console.trace();
    return true;
}

URL.prototype.replaceHost = function (dstUrl) {
    if (!dstUrl)
        dstUrl = window.document.location;

    if (!(dstUrl instanceof URL))
        dstUrl = new URL(dstUrl);

    this.protocol = dstUrl.protocol;
    this.hostname = dstUrl.hostname;
    this.port = dstUrl.port;

    if ((!this.port || this.port === "0") && this.protocol)
        switch (this.protocol.toLowerCase()) {
            case "http:":
                this.port = 80;
                break;
            case "https:":
                this.port = 443;
                break;
            case "ftp:":
                this.port = 21;
                break;
        }

    return this;
};

// zamienia wszystkie słowa kluczowe
String.prototype.replaceAll = function (src, dst) {
    var temp = this + ""; // aby nie tworzyl tablicy znakow tylko string
    var index = temp.indexOf(src);
    while (index !== -1) {
        temp = temp.replace(src, dst);
        index = temp.indexOf(src);
    }
    return temp;
};

// czy string zawiera daną frazę
String.prototype.contains = function (str) {
    if (!(typeof str === "string"))
        return false;
    return this.toLowerCase().indexOf(str.toLowerCase()) >= 0;
};

// czy string kończy się daną wartością
String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

// czy string ropoczyna się od danej wartości
String.prototype.startsWith = function (suffix) {
    return this.indexOf(suffix) === 0;
};

// Zwraca true jeśli przycięty tekst jest identyczny bez uwzlędnienia wielkości znaków
String.prototype.same = function (text) {
    if ((typeof text === 'undefined') || (text === null))
        return false;
    return this.trim().toLowerCase() === text.trim().toLowerCase();
};

// konwersja polskich znaków do ANSI
String.prototype.convertPolishChars = function () {
    var src = 'ąćęśźńżółĄĆĘŚŹŃŻÓŁ';
    var dest = 'acesznzolACESZNZOL';
    var res = '';
    var c, v;
    for (var i = 0; i < this.length; i++) {
        c = this[i];
        v = src.indexOf(c);
        res += (v >= 0) ? dest[v] : c;
    }
    return res;
};

// zaokraglenie wartoci numerycznej do okreslonej ilości miejsc po przecinku
Number.prototype.round = function (places) {
    if (!places)
        places = 0;
    var factor = Math.pow(10, places);
    return Math.round(this * factor) / factor;
};


Node.prototype.on = function (name, callback) {
    this["on" + name.toLowerCase()] = callback;
    return this;
};

// pobierz n-tego rodzica danego elemntu na podstawie nazwy tagu lub poziomu zagnieżdzenia
Node.prototype.getParent = function (tagNameOrLevel) {

    if (tagNameOrLevel > 0) {
        var nd = this;
        for (var i = 0; i < tagNameOrLevel; i++) {
            if (!nd)
                return null;
            nd = nd.parentNode;
        }
        if (!nd)
            return null;

        return nd;
    }

    if (!tagNameOrLevel)
        return this;

    var nd = this;
    while (nd) {
        if (nd.nodeName.toLowerCase() === tagNameOrLevel.toLowerCase())
            return nd;
        nd = nd.parentNode;
    }
    return null;
};


// dodaje tag i opcjonalnie ustawia dla niego zawartość tekstową
Node.prototype.tag = function (tagName, textContent) {
    if (!tagName)
        return null;
    var t = document.createElement(tagName);
    this.appendChild(t);
    if (textContent !== null && textContent !== undefined)
        t.txt(textContent);
    return t;
};

Node.prototype.tagNS = function (namespace, tagName, textContent) {
    var t = document.createElementNS(namespace, tagName);
    this.appendChild(t);
    if (textContent !== null && textContent !== undefined)
        t.txt(textContent);
    return t;
};

Node.prototype.insertAfter = function (newNode) {
    this.parentNode.insertBefore(newNode, this.nextSibling);
};
/*
 Node.prototype.addTagFirst = function(tagName) {
 // dodaj nowy tag jako pierwsze dziecko
 var tag = this.children[0];
 if (!tag)
 return this.tag(tagName);
 var tt = document.createElement(tagName);
 this.insertBefore(tt, tag);
 return tt;
 };
 */

// dodaj gałąź tekstową do bieżącej gałęzi
Node.prototype.addText = function (str) {
    this.appendChild(document.createTextNode(str));
    return this;
};

// usuń wszystkie gałęzie tekstowe z bieżącej i dodaj nową
Node.prototype.setText = function (str) {
    this.forEach(function (node) {
        if (node.nodeName === "#text")
            node.parentNode.removeChild(node);
    });
    this.appendChild(document.createTextNode(str));
    return this;
};

Node.prototype.txt = function (str) {
    return this.setText(str);
};

// wyczyść wszystkie potomne gałęzie
Node.prototype.clear = function () {
    while (this.firstChild)
        this.innerHTML = '';
//        this.removeChild(this.firstChild);
    return this;
};

// uswaw klasę css
Node.prototype.cls = function (className) {
    this.className = className;
    return this;
};

// usuń element drzewa DOM
Node.prototype.remove = function () {
    this.parentNode.removeChild(this);
};

// Pętla iterująca po wszystkich polach danego elementu
Node.prototype.forEach = function (func, elementsOnly) {
    if (!func)
        return;

    var arr = [];
    for (var i = 0; i < this.childNodes.length; i++)
        if (!elementsOnly || this.childNodes[i].nodeType === 1)
            arr.push(this.childNodes[i]);

    for (var i = 0; i < arr.length; i++)
        func(arr[i]);

};



Utils.copyNode = function (src, dst) {
    for (var i = 0; i < src.attributes.length; i++)
        dst.setAttribute(src.attributes[i].name, src.attributes[i].value);

    for (var i = 0; i < src.childNodes.length; i++) {
        var node = src.childNodes[i];

        switch (node.nodeType) {
            case 3: //Node.TEXT_NODE
                dst.appendChild(document.createTextNode(node.nodeValue));
                break;
            case 1:
                break;
        }

        if (node.nodeType === 1) {
            var tag = document.createElement(node.nodeName);
            dst.appendChild(tag);
            Utils.copyNode(node, tag);
            continue;
        }
    }
};

// kopiuje zawartość bieżącej gałęzi do docelowej
Node.copyTo = function (dst) {
    Utils.copyNode(this, dst);
};
// pętla forEach na kolekcji typu HTMLCollection
HTMLCollection.prototype.forEach = function (func) {
    var arr = [];
    for (var i = 0; i < this.length; i++)
        arr.push(this[i]);

    for (var i = 0; i < arr.length; i++)
        func(arr[i]);
};

// wyczyść tablicę
Array.prototype.clone = function () {
    var result = [];
    for (var i = 0; i < this.length; i++)
        result.push(this[i]);
    return result;
};

// wyczyść tablicę
Array.prototype.clear = function () {
    this.length = 0;
};

// czy tablica jest pusta
Array.prototype.isEmpty = function () {
    return this.length === 0;
};

// czy tablica zawiera element
Array.prototype.contains = function (element) {
    return this.indexOf(element) >= 0;
};

// dodaj element na początku tablicy
Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};

// usuwa element z tablicy
Array.prototype.remove = function (obj) {
    var i = this.indexOf(obj);
    if (i >= 0) {
        this.splice(i, 1);
        return true;
    }
    return false;
};

// ustala limit rozmiaru na tablicę. W przypadku przekroczenia usuwa lementy
// z początku [fromBegin] lub z końca tablicy
Array.prototype.limit = function (itemsCount, fromBegin) {
    // Ogranicz liczbę lementów tablicy
    if (!this)
        return this;
    if (itemsCount > 0 && itemsCount <= this.length)
        this.splice(fromBegin ? 0 : this.length - itemsCount, this.length - itemsCount);
    return this;
};

// przenieś element w obrebie tablicy
Array.prototype.moveItem = function (index, newIndex) {
    if (index < 0 || index >= this.length || newIndex < 0 || newIndex >= this.length)
        return;
    if (newIndex >= this.length) {
        var k = newIndex - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(newIndex, 0, this.splice(index, 1)[0]);
};

// zwraca pierwszy element z tablicy
Array.prototype.first = function () {
    if (this.length > 0)
        return this[0];
    return undefined;
};

Array.prototype.last = function () {
    if (this.length > 0)
        return this[this.length - 1];
    return undefined;
};

// porówanie zawartości dwóch tablic (kolejność elementów nie ma znaczenia)
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length !== array.length)
        return false;

    this.sort();
    array.sort();
    for (var i = 0; i < this.length; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].compare(array[i]))
                return false;
        } else if (this[i] !== array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};


// Element.setAttribute
Element.prototype.attr = function (data, optional) {
    if (typeof data === "string" && optional !== null && optional !== undefined) {
        this.setAttribute(data, optional);
        return this;
    }

    if (!data || (typeof data !== "object"))
        return this;

    for (var name in data) {
        var val = data[name];
        if (typeof val === "function")
            continue;

        if (val === undefined)
            this.removeAttribute(name);
        else
            this.setAttribute(name, val);
    }
    return this;
};

// edycja arkuszy styli
Element.prototype.css = function (data) {
    if (!data || (typeof data !== "object"))
        return this;

    for (var name in data) {
        var val = data[name];
        if (typeof val === "function")
            continue;

        if (this.style[name] === undefined)
            throw "Nieznany selektor \"" + name + "\"";

        this.style[name] = val;
    }
    return this;
};

// zwraca zaznaczoną wartość z elementu select
HTMLSelectElement.prototype.selectedValue = function () {
    if (this.selectedIndex === -1)
        return null;
    return this.options[this.selectedIndex].value;
};


//=================================== UTILS ====================================
(function () {
    Utils.className = function (object) {
        // Zwraca nazwę klasy obiektu
        if (typeof object !== "undefined"
                && object !== null
                && object.constructor
                && object.constructor.name)
            return object.constructor.name;
        return typeof object;
    };



    /**
     * Mierzy czas trwania funkcji [callback]
     * @param {type} name
     * @param {type} callback
     * @returns {undefined}
     */
    Utils.duration = function (name, callback) {
        var ts = new Date().getTime();
        callback();
        console.log(name + ": " + (new Date().getTime() - ts));
    };

    Utils.makeFinal = function (obj, field) {

        var fields = Object.getOwnPropertyNames(obj);

        var fieldName;
        for (var i = 0; i < fields.length; i++)
            if (obj[fields[i]] === field) {
                fieldName = fields[i];
                break;
            }

        if (!fieldName)
            return;

        Object.defineProperty(obj, fieldName, {
            value: field,
            writable: false,
            enumerable: false,
            configurable: false
        });
    };

    /**
     * Funkcja sprawdza czy wartość przekazana w argumencie id jest prawidłowym identyfikatorem
     * @param {string} id
     * * @param {string} extraChars
     * @returns {string} id
     */
    Utils.checkId = function (id, extraChars) {
        Utils.checkInstance(Utils.requireNonEmpty(id), "string");
        const allowed = "0123456789_abcdefghijklmnopqrstuwvxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
                + (typeof extraChars === "string" ? extraChars : "");
        for (var i = 0; i < id.length; i++)
            if (allowed.indexOf(id[i]) < 0)
                throw new Error("Incorrect identifier \"" + id + "\"");
        return id;

    };

    /**
     * Funkcja sparawdza czy obiekt należy do jednej z instancji przekazanej w argumencie instances
     * @param {type} object - argument może być null-em, funkcja nie zgłosi błędu
     * @param {type} instances - tablica lub elementy (fukccje lub nazwy klas)
     * @returns object
     */
    Utils.checkInstance = function (object, instances) {
        var res = check(object, instances);
        if (res === null)
            return object;

        throw Error("Incorrect object instance.\nExpected "
                + res.join(" or ") + ", actual " + Utils.className(object));
    };

    /**
     * Sprawdza czy obiekt nie jest pusty i jest danej instancji
     * @param {type} object
     * @param {type} instances
     * @returns {unresolved}
     */
    Utils.checkInstanceF = function (object, instances) {
        return Utils.requireNotNull(Utils.checkInstance(object, instances));
    };

    /**
     * Sprawdza czy obiekt jest danej instancji
     * @param {type} object
     * @param {type} instances
     * @returns {Boolean}
     */

    Utils.instanceOf = function (object, instances) {
        return check(object, instances) === null;
    };

    function check(object, instances) {

        if (object === null || object === undefined)
            return null;

        var args = [];
        for (var i = 1; i < arguments.length; i++)
            if (arguments[i] instanceof Array)
                args = args.concat(arguments[i]);
            else
                args.push(arguments[i]);


        var names = [];

        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (!arg)
                continue;
            if (typeof arg === "function" || typeof arg === "object") {
                var arg = arg.name || arg.toString();
                if (arg.startsWith("function") && arg.contains("("))
                    arg = arg.substring("function".length, arg.indexOf("(")).trim();
            }

            if (typeof arg !== 'string')
                arg = arg.toString();
            names.push(arg);
        }


        if (args.length === 0)
            return null;

        var className = Utils.className(object).toLowerCase();
        for (var i = 0; i < names.length; i++)
            if (names[i].toLowerCase() === className)
                return null;

        var constr = object.constructor;
        while (constr) {
            for (var i = 0; i < names.length; i++)
                if (names[i] === constr.name)
                    return null;
            constr = constr.__proto__;
        }

        return  names;
    }

    Utils.getCookie = function (c_name) {
        var i, x, y, ARRcookies = document.cookie.split(";");
        for (i = 0; i < ARRcookies.length; i++) {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if (x === c_name) {
                return unescape(y);
            }
        }
        return null;
    };

    Utils.setCookie = function (c_name, value, exdays) {
        var exp = null;
        if (!isNaN(exdays))
            exp = new Date().setDate(exdate.getDate() + exdays).toUTCString();
        document.cookie = c_name + "=" + encodeURIComponent(value) + (exp
                ? "; expires=" + exp : "");
    };

    Utils.setCookieHttpOnly = function (c_name, value, exdays) {
        var exdate = new Date();
        exdays = parseInt(exdays);
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escapeUrl(value) + ((exdays === null)
                ? "" : "; expires=" + exdate.toUTCString());
        document.cookie = c_name + "=" + c_value + "; HttpOnly";
    };

    Utils.randomUid = function () {
        var uid = "";
        for (var i = 0; i < 4; i++) {
            uid += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return uid;
    };

    Utils.randomId = function (length) {
        var chars = "abcdefghijklmnopqrstuwvxyzABCDEFGHIJKLMNOPQRSTUWVXYZ1234567890";
        if (!length)
            length = 10;
        var id = "";
        for (var i = 0; i < length; i++)
            id += chars[Math.floor(Math.random() * (chars.length - (i === 0 ? 10 : 0))) ];
        return id;
    };

    Utils.serializeForm = function (form, builder) {
        if (typeof form === 'string')
            form = $id(form);
        if (!form || !form.elements)
            return;
        if (!builder instanceof UrlBuilder)
            builder = new UrlBuilder();
        var i, j, first;
        var elems = form.elements;
        for (i = 0; i < elems.length; i += 1, first = false) {
            if (elems[i].name.length > 0) { /* don't include unnamed elements */
                switch (elems[i].type) {
                    case 'select-one':
                        first = true;
                    case 'select-multiple':
                        for (j = 0; j < elems[i].options.length; j += 1)
                            if (elems[i].options[j].selected) {
                                builder.add(elems[i].name, elems[i].options[j].value);
                                if (first)
                                    break; /* stop searching for select-one */
                            }
                        break;
                    case 'checkbox':
                    case 'radio':
                        if (!elems[i].checked)
                            break; /* else continue */
                    default:
                        builder.add(elems[i].name, elems[i].value);
                        break;
                }
            }
        }

        return builder.toString();
    };

    Utils.formatFileSize = function (size) {

        function frmt(base) {
            var val = size / base;
            return val.round(val >= 100 ? 0 : val >= 10 ? 1 : 2);
        }

        if (size >= 0x40000000)
            return frmt(0x40000000) + " GB";
        if (size >= 0x100000)
            return frmt(0x100000) + " MB";
        if (size >= 0x400)
            return frmt(0x400) + " KB";
        return size + " B";
    };

    Utils.trimFileName = function (name, length) {
        if (!name || !length)
            return name;
        name = name.trim();
        if (name.length <= length)
            return name;
        if (name.indexOf("." > 0)) {
            var ext = name.substring(name.lastIndexOf("."), name.length);
            name = name.substring(0, name.length - ext.length);
            name = name.substring(0, length - ext.length - 1).trim();
            return name + "\u2026" + ext;
        }

        return name.substring(0, length - 1).trim() + "\u2026";
    };

    Utils.isFontInstalled = function (name) {
        name = name.replace(/['"<>]/g, '');
        var body = document.body,
                test = document.createElement('div'),
                installed = false,
                template =
                '<b style="display:inline !important; width:auto !important; font:normal 10px/1 \'X\',sans-serif !important">ii</b>' +
                '<b style="display:inline !important; width:auto !important; font:normal 10px/1 \'X\',monospace !important">ii</b>',
                ab;
        if (name) {
            test.innerHTML = template.replace(/X/g, name);
            test.style.cssText = 'position: absolute; visibility: hidden; display: block !important';
            body.insertBefore(test, body.firstChild);
            ab = test.getElementsByTagName('b');
            installed = ab[0].offsetWidth === ab[1].offsetWidth;
            body.removeChild(test);
        }
        return installed;
    };

    /*
     Odnajduje w tekscie linki i formatuje je do postaci odnosnikow
     */
    Utils.linkify = function (text) {
        if (!(typeof text === "string"))
            return text;
        var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~$_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return text.replace(urlRegex, function (url) {
            return '<a href="' + url + '" target="_blank">' + url + '</a>';
        });
    };

    Utils.coalesce = function () {
        // zwraca pierwszy z argumentów metody, który jest zdefiniowany i nie jest null-em
        for (var i = 0; i < arguments.length; i++)
            if (arguments[i] !== null && arguments[i] !== undefined)
                return arguments[i];
        return null;
    };

    Utils.updateCssRule = function (selector, style, value) {
        for (var i = 0; i < document.styleSheets.length; i++) {
            var sheet = document.styleSheets[i];
            for (var j = 0; j < sheet.cssRules.length; j++) {
//console.log(sheet.cssRules[j].selectorText);
                var sel = sheet.cssRules[j].selectorText;
                if (!sel)
                    continue;
                /*   if (sel.substring(0, 1) === "."
                 || sel.substring(0, 1) === "#"
                 || sel.substring(0, 1) === "@")
                 sel = sel.substr(1);
                 */

                if (sel.toLowerCase() !== selector.toLowerCase())
                    continue;
                var rule = sheet.cssRules[j].cssText;
                var v1 = rule.indexOf(style);
                var v2 = 0;
                if (v1 < 0) {
                    v1 = rule.indexOf("{") + 1;
                    v2 = v1;
                } else
                    v2 = rule.indexOf(";", v1);
                if (v2 < 0)
                    v2 = rule.indexOf("}", v1);
                rule = rule.substring(0, v1) + style + ": " + value
                        + (v1 === v2 ? "; " : "") + rule.substring(v2, rule.length);
                sheet.deleteRule(j);
                sheet.insertRule(rule, j);
            }
        }
        return null;
    };

    Utils.closeButton = function (parent, width, height) {
        /*
         * <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260">
         * <path fill="#000000" d="M6 198l68 -68 -68 -68c-8,-8 -8,-21 0,-29l26 -26c8,-8 21,-8 29,0l68 68 68 -68c8,-8 21,-8 29,0l26 26c8,8 8,21 0,29l-68 68 68 68c8,8 8,21 0,29l-26 26c-8,8 -21,8 -29,0l-68 -68 -68 68c-8,8 -21,8 -29,0l-26 -26c-8,-8 -8,-21 0,-29z"/></svg>
         
         
         *
         */

        width = coalesce(width, 16);
        height = coalesce(height, 16);
        var pre = parent.tag("div");
        var div = pre.tag("div");
        var svg = new SVG(div, (width - 5) + "px", (height - 5) + "px", "0 0 260 260");
        var p = svg.path("M6 198l68 -68 -68 -68c-8,-8 -8,-21 0,-29l26 -26c8,-8 21,-8 29,0l68 "
                + "68 68 -68c8,-8 21,-8 29,0l26 26c8,8 8,21 0,29l-68 68 68 68c8,8 "
                + "8,21 0,29l-26 26c-8,8 -21,8 -29,0l-68 -68 -68 68c-8,8 -21,8 "
                + "-29,0l-26 -26c-8,-8 -8,-21 0,-29z");
        div.onmouseover = function () {
            div.css({backgroundColor: "rgba(240,140,140,1)"});
        };
        div.onmouseout = function () {
            div.css({backgroundColor: "rgba(220,100,100,1)"});
            pre.css({padding: "1px"});
        };
        pre.onmousedown = function () {
            pre.css({padding: "2px 0 2px 0"});
        };
        pre.onmouseup = function () {
            pre.css({padding: "1px"});
        };
        pre.css({
            display: "inline-block",
            padding: "1px",
            margin: 0,
            lineHeight: 0
        });
        div.css({
            display: "inline-block",
            padding: "2px 6px",
            margin: 0,
            backgroundColor: "rgba(220,100,100,1)",
            opacity: 1,
            border: "1px solid #444",
            boxShadow: "1px 1px 2px rgba(0,0,0,0.4)",
            borderRadius: "2px",
            lineHeight: 0
        });
        p.css({
            fill: "#FFFFFF",
            pointerEvents: "all",
            stroke: "black",
            strokeWidth: "20"
        });
        return pre;
    };

    Utils.requireFunction = function (value, error) {
        if (typeof value !== "function")
            throw new Error(error ? error : "Wymagana funkcja, aktualnie " + Utils.className(value));
    };

    Utils.requireNotNull = function (value, error) {
        if (value !== null && value !== undefined)
            return value;
        throw new Error(error ? error : "Value is missing");
    };

    Utils.requireNonEmpty = function (value, error) {
        if (value !== null && value !== undefined && value.toString().trim())
            return value;
        throw new Error(error ? error : "Value is missing");
    };
//Breakpoint on access to a property, eg debugAccess(document, 'cookie');
    Utils.debugAccess = function (obj, prop, debugGet) {

        var origValue = obj[prop];
        Object.defineProperty(obj, prop, {
            get: function () {
                if (debugGet)
                    debugger;
                return origValue;
            },
            set: function (val) {
                debugger;
                return origValue = val;
            }
        });
    };
    /**
     * Funkcja parsuje obiekty JSON w notacji JavaScript (np bez cudzysłowów w kluczach)
     * @param {type} text
     * @returns {Function}
     */
    Utils.jsonParse = function (text) {
        var trim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;
        text = text.replace(trim, "");

        if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
                .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
                .replace(/(?:^|:|,)(?:\s*\[)+/g, ":")
                .replace(/\w*\s*\:/g, ":")))
            return (new Function("return " + text))();

        throw "Invalid JSON: " + text;
    };
}());

function EError(source) {
    this.message = null; // sformatowana postać tekstowa
    this.title = "Błąd";
    this.details = null;
    this.id = null;
    this.details = {};
    this.stack = null;
    this.file;
    this.line;
    this.column;
    if (!source)
        return;
    try {

        if (typeof source === "string") {
            this.message = source;
            return;
        }


        if (Utils.className(source) === "ErrorEvent") {
            this.message = source.message;
            this.file = source.filename;
            this.line = source.lineno;
            this.column = source.colno;
            this.stack = source.error ? source.error.stack : null;
            return;
        }

        if (this.title instanceof Error) {
            this.message = source.message;
            this.title = source.name;
            this.stack = source.stack || source.stacktrace || source.message;
        }

        if (Utils.className(source) === "XMLHttpRequest" || (source.status && source.statusText)) {
            // zakladamy ze jest to XMLHttpRequest
            this.message = "";
            this.ext = source.status !== 0 && source.statusText;
            if (!this.ext) {
                this.message = "Brak odpowiedzi serwera";
                return;
            }

            try {
                var err = getHeader(source, "Error");
                if (err)
                    err = JSON.parse(err);
                if (Utils.className(err) === "Array") {

                    this.id = err[0];
                    this.title = err[1];
                    this.message = err[2];
                    if (err[3])
                        for (var i = 0; i < err[3].length; i++)
                            this.details[err[3][i][0]] = err[3][i][1];
                }
            } catch (e) {
                window.console.error(e);
            }

            var ct = getHeader(source, "Content-Type");
            if (ct)
                ct = ct.toLowerCase();
            if (source.status === 0 && !source.statusText) {
                this.isEmpty = true;
                return;
            }

            var msg = this.message;
            if (!msg)
                msg = "Błąd " + source.status + ": " + source.statusText;
            if (ct && ct.indexOf("text/plain") >= 0 && source.responseText)
                msg = "Błąd " + source.status + ": " + source.responseText;
            this.message = msg;
        }


    } catch (ex) {
        window.console.error(ex);
    }
}


function UrlBuilder(baseUrl) {

// parametr typu null : tylko nazwa
// undefined zostanie zignorowany
    this.preUrl = "";
    this.items = new Array();
    this.add = function (nameOrObject, value) {
        // value moze byc niezdefiniowany

        if (!nameOrObject)
            return;
        if (typeof nameOrObject === "object") {
            for (var item in nameOrObject)
                this.add(item, nameOrObject[item]);
            return;
        }

        if (value instanceof Array) {
            for (var i = 0; i < value.length; i++)
                this.add(nameOrObject, value[i]);
            return;
        }

        if (value && typeof value === "object") {
            this.add(value);
            return;
        }

        if (value === undefined)
            return;
        this.items.push(escapeUrl(nameOrObject)
                + (value === null ? "" : "=" + escapeUrl(value)));
        return this;
    };
    this.toString = function () {
        var url = this.preUrl;
        for (var i = 0; i < this.items.length; i++) {
            if (i)
                url += "&";
            url += this.items[i];
        }
        return url;
    };
    if (baseUrl) {
        var builder = this;
        var url = this.preUrl = "" + baseUrl;
        if (!url.contains("?")) {
            this.preUrl += "?";
            return;
        }

        this.preUrl = url.substring(0, url.indexOf("?") + 1);
        var arr = url.substring(url.indexOf("?") + 1, url.length).split("&");
        arr.forEach(function (s) {
            if (s.trim())
                builder.items.push(s);
        });
    }
}


function ErrorHandler() {

    var handler = this;
    var js_errors = new Array();
    var tContent; // tag zawierający treść błędów

    function JsError(err) {
        this.ts = new Date().getTime();
        this.cnt = 1;
        this.message = err.message;
        this.file = err.file;
        this.line = err.line;
        this.stack;
        if (err.stack) {

            var split = err.stack.split("\n");
            this.stack = [];
            for (var i = 0; i < split.length; i++) {
                var s = split[i].trim();
//"    at Object.Utils.checkInstance (/utils.js:488:11)"
                if (s.indexOf("at ") !== 0 || s.indexOf(" (") <= 0)
                    continue;
                s = s.substring(s.indexOf(" (") + 2);
                s = s.substring(0, s.indexOf(")"));
                if (s.indexOf("/") >= 0)
                    s = s.substring(s.lastIndexOf("/") + 1);
                if (s.split(":").length > 2)
                    s = s.substring(0, s.lastIndexOf(":"));
                this.stack.push(s);
            }

        }


        js_errors.push(this);
    }

    this.canDisplay = function (err) {
        return true;
    };
    this.sendLog = function (err) {

    };
    this.onError = function (msg, file, line, column, ex) {
        var err = new EError(msg || ex);
        var sendLog = true;
        var jserr = null;


        if (js_errors.length > 0) {
            var er = js_errors[js_errors.length - 1];
            if (err.message === er.message
                    && (!err.line || err.line === er.line)
                    && (!err.file || err.file === er.file)) {
                jserr = er;
                ++jserr.cnt;
                var now = new Date().getTime();
                sendLog &= now - jserr.ts > 1000;
                er.ts = now;
            }
        }

        if (!jserr)
            jserr = new JsError(err);
        try {
            handler.sendLog(err);
        } catch (e) {
            console.error(e);
        }
        if (!err.message && !err.file)
            return;
        if (!handler.canDisplay(err))
            return;

        var tag = $id("_err-dlg_");
        if (!tag) {
            var body = document.body;
            if (!body)
                return;

            tag = body.tag("div")
                    .attr("id", "_err-dlg_")
                    .css({
                        position: "fixed",
                        left: 0,
                        right: 0,
                        top: 0,
                        height: 0,
                        zIndex: 999999,
                        textAlign: "center"
                    });

            tag = tag.tag("div").css({
                margin: "6px",
                opacity: "0.9",
                border: "2px solid #DD3C10",
                boxShadow: "2px 2px 3px #666666",
                backgroundColor: "#FFEBE8",
                fontFamily: "Verdana",
                color: "black",
                fontSize: "10pt",
                fontWeight: "bold",
                borderRadius: "0 0 8px 8px",
                display: "inline-block"
            });

            tContent = tag.tag("div")
                    .css({
                        display: "inline-block",
                        float: "left",
                        padding: "8px 64px"
                    });

            var close = tag.tag("div", "x")
                    .css({
                        display: "inline-block",
                        float: "right",
                        cursor: "pointer",
                        color: "#d66",
                        fontSize: "12pt",
                        paddingRight: "4px"
                    })
                    .on("mouseover", () => {
                        close.style.color = "blue";
                    })
                    .on("mouseout", () => {
                        close.style.color = "#d66";
                    })
                    .on("click", () => {
                        js_errors = new Array();
                        $id("_err-dlg_").remove();
                    });
        }


        tContent.innerHTML = "";
        for (var i = 0; i < js_errors.length; i++) {
            var el = js_errors[i];
            var s = el.message;
            if (s.indexOf("Uncaught ") === 0 && s.indexOf(":") > 0)
                s = s.substring("Uncaught ".length).trim();
            tContent.tag("div", (el.cnt > 1 ? "[" + el.cnt + "x] " : "") + s);

            var stack = el.file + ", line: " + el.line;
            if (el.stack && el.stack.length > 1) {
                stack = [];
                el.stack.forEach(elm => {
                    if (!elm.startsWith("<anonymous>"))
                        stack.push(elm);
                });
                stack = stack.join(", ");
            }

            if (el.file)
                tContent.tag("div", stack)
                        .css({
                            fontWeight: "normal",
                            fontSize: "8pt"
                        });
            if (i < js_errors.length - 1)
                tContent.tag("br");
        }

        return false;
    };
    window.addEventListener("error", this.onError);
}

function JsonSocket(url, connectWhenLoaded) {
    if (connectWhenLoaded === null || connectWhenLoaded === undefined)
        connectWhenLoaded = true;
    this.socket;
    this.onmessage;
    this.onerror;
    this.onopen;
    this.onclose;
    this.url;
    this.closedManually = false;
    this.error = null;
    this.wasConnected = false;
    this.autoReconnect = false; // automatycznie proboj wznowic polaczenie po utracie
    var retryCounter = 5;
    var ws;
    var self = this;
    this.url = url;
    this.errorBox; // okno błędu

    var msgQueue = [];
    this.close = function () {
        this.closedManually = true;
        this.socket.close();
    };
    this._initWS = function () {
        var url = new URL("http://localhost/" + this.url).replaceHost().toString()
                .replace("https://", "wss://")
                .replace("http://", "ws://");
        ws = self.socket = window.MozWebSocket
                ? new MozWebSocket(url)
                : new WebSocket(url);
        ws.onopen = function () {
            if (self.errorBox) {
                self.errorBox.close();
                self.errorBox = null;
            }

            if (self.onopen)
                self.onopen();
            for (var i = 0; i < msgQueue.length; i++)
                ws.send(JSON.stringify(msgQueue[i]));
            msgQueue = [];
            retryCounter = 5;
            self.wasConnected = true;
        };
        ws.onclose = function () {
            if (service.unloading)
                return;
            if (self.onclose)
                self.onclose();
            if (!self.wasConnected)
                ws.onerror(null);
            if (!self.closedManually
                    && self.autoReconnect
                    && retryCounter > 0)
                setTimeout(function () {
                    self._initWS();
                    --retryCounter;
                }, 1000);
        };
        ws.onerror = function (e) {
            if (service.unloading)
                return;
            self.error = true;
            if (self.onerror)
                if (self.onerror(e) === true)
                    return;
            if (e instanceof Array) {
                $error(e[0], e[1]);
                return;
            }

            self.errorBox = new CenterBox({
                text: typeof e === "string" ? e :
                        (self.wasConnected ? "Utracono połączenie" : "Błąd połączenia")
                        + " WebSocket\n\n"
                        + this.url + (self.autoReconnect && retryCounter > 0
                                ? "\n\nPróba ponowienia: "
                                + (6 - retryCounter) : ""),
                details: self.wasConnected ? null : "* Przyczyną problemu może "
                        + "być zablokowanie połączenia przez\nprogram antywirusowy, "
                        + "firewall lub serwer pośredniczący\n\n"
                        + "Rozwiązaniem może być przełączenie w tryb szyfrowany (HTTPS)",
                error: true
            });
        };
        ws.onmessage = function (msg) {
            var data = JSON.parse(msg.data);
            msg.message = data;
            try {
                if (data['#exception#']) {
                    ws.onerror(data['#exception#']);
                    return;
                }

                if (data['#eval#']) {
                    window.eval(data['#eval#']);
                }

                if (self.onmessage)
                    self.onmessage(data);
            } catch (e) {
                var err = new EError(e);
                ws.send(JSON.stringify({
                    '#exception#': {
                        url: document.location.href,
                        title: err.title,
                        message: err.message,
                        stack: err.stack
                    }
                }));
            }
        };
    };
    if (connectWhenLoaded && !$$service.documentLoaded)
        window.addEventListener("load", function () {
            self._initWS();
        });
    else
        this._initWS();
    this.call = function (functionName /*, params*/) {

        var args = [];
        for (var i = 1; i < arguments.length; i++)
            args.push(arguments[i]);
        var obj = {};
        obj[functionName] = args;
        this.write(obj);
    };
    this.write = function (object) {

        if (!this.socket) {
            msgQueue.push(object);
            return;
        }

        // zamykanie polaczenia
        if (this.socket.readyState > 1) {
            ws.onclose();
            return;
        }

        if (this.socket.readyState === 0) {
            setTimeout(function (socket) {
                socket.write(object);
            }, 1, this);
            return;
        }

        this.socket.send(JSON.stringify(object));
    };
}

function SVG(parent, width, height, viewBox) {
    var svg = parent.tagNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", viewBox);
    svg.tstyles = svg.tag("style");
    svg.tstyles.setAttribute("type", "text/css");
    svg.styles = function (selector) {
        if (!this.tstyles.innerHTML)
            this.tstyles.innerHTML = "";
        this.tstyles.innerHTML += selector + "\n";
    };
    svg.tag = function (name) {
        var tag = this.tagNS("http://www.w3.org/2000/svg", name);
        tag.attr = function (name, value) {
            this.setAttribute(name, value);
            return this;
        };
        return tag;
    };
    svg.polygon = function (points) {
        return this.tag("polygon").attr("points", points);
    };
    svg.path = function (points) {
        return this.tag("path").attr("d", points);
    };
    return svg;
}

/*  okno komunikatu na środku ekranu */
function CenterBox(data) {
    if (!data)
        return;
    var self = this;
    if (typeof data === "string")
        data = {
            text: data
        };
    var time = Utils.coalesce(data.delay, 0); // czas wyswietlania komunikatu
    var error = Utils.coalesce(data.error, false);
    var grayout = Utils.coalesce(data.grayout, false);
    var closeable = Utils.coalesce(data.closeable, true);
    var zIndex = Utils.coalesce(data.zIndex, null);
    var box = $id("$_center_box");
    if (!box)
        box = document.body.tag("div");
    box.innerHTML = "";
    box.setAttribute("id", "$_center_box");
    box.tag("div").setText(data.text);
    if (data.details) {
        box.tag("div")
                .setText(data.details)
                .css({
                    marginTop: "20px",
                    fontSize: "8pt",
                    fontStyle: "italic",
                    color: "#333"
                });
    }

    box.css({
        font: "10pt Verdana",
        padding: "25px 30px",
        position: "fixed",
        minWidth: "30%",
        textAlign: "center",
        color: "#000",
        border: "1px solid " + (error ? "#a00" : "#060"),
        opacity: 0.9,
        boxShadow: "0 0 4px " + (error ? "#a00" : "#060"),
        textShadow: "0, 0, 2px, #fff",
        zIndex: zIndex,
        transition: "opacity .3s ease-in-out",
        borderRadius: "4px"
    });
    if (error)
        gradient(box, "#faa", "#f66");
    else
        gradient(box, "#efe", "#8f8");
    if (closeable) {
        var btn = Utils.closeButton(box, 16, 16);
        btn.style.position = "absolute";
        btn.style.right = "4px";
        btn.style.top = "4px";
        btn.style.cursor = "pointer";
        btn.onclick = function () {
            self.close();
        };
    }

    var setPos = function () {
        box.css({
            left: (window.innerWidth / 2 - box.offsetWidth / 2) + "px",
            top: (window.innerHeight / 2 - box.offsetHeight / 2) + "px"
        });
    };
    window.addEventListener("resize", function () {
        setPos();
    });
    setPos();
    if (time > 0)
        window.setTimeout(function () {
            self.close();
        }, time, this);
    this.close = function () {
        box.style.opacity = 0;
        window.setTimeout(function () {
            box.remove();
        }, 500);
    };
}

// -------------------- watcher-y ---------------------------
if (!Object.prototype.watch) {
    Object.defineProperty(Object.prototype, "watch", {
        enumerable: false,
        configurable: true,
        writable: false,
        value: function (prop, handler) {
            var oldval = this[prop],
                    newval = oldval,
                    getter = function () {
                        return newval;
                    },
                    setter = function (val) {
                        oldval = newval;
                        return newval = handler.call(this, prop, oldval, val);
                    };

            if (delete this[prop]) { // can't watch constants
                Object.defineProperty(this, prop, {
                    get: getter,
                    set: setter,
                    enumerable: true,
                    configurable: true
                });
            }
        }
    });
}

// object.unwatch
if (!Object.prototype.unwatch) {
    Object.defineProperty(Object.prototype, "unwatch", {
        enumerable: false,
        configurable: true,
        writable: false,
        value: function (prop) {
            var val = this[prop];
            delete this[prop]; // remove accessors
            this[prop] = val;
        }
    });
}

/**
 * Klasa udostępnia element drzewa dom na żądanie. 
 * @param {type} source String(id), HTMLElement, Funkcja
 * @returns {HtmlElementProvider}
 */
function HtmlElementProvider(source) {
    this.source = source;
    this.value = null;

    this.get = () => {
        if (this.value)
            return this.value;

        if (typeof source === "string")
            this.value = $id(source);

        if (source instanceof HTMLElement)
            this.value = source;

        if (typeof source === "function")
            this.value = source();

        Utils.checkInstance(this.value, "HTMLElement");
        return this.value;
    };

}