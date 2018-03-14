// @flow
'use strict';


import UrlBuilder from "./UrlBuilder";
import Dev from "../Dev";

declare function $id(objectOrId: string | Node): any;

//  document.getElementById
window.$id = function (objectOrId: string | Node): ?Node {
    return typeof objectOrId === "string" ? document.getElementById(objectOrId) : objectOrId;
};

//  document.createElement
window.$tag = function (tagName: string, textContent: ?string): ?Node {
    if (!tagName)
        return null;
    let tag: Node = document.createElement(tagName);
    if (textContent !== null && textContent !== undefined) {
        // $FlowFixMe
        tag.txt(textContent);
    }
    return tag;
};

// $FlowFixMe
Node.prototype.on = Node.prototype.on || function (name: string, callback: (e: Event) => any): Node {
    if (this["on" + name.toLowerCase()] === undefined)
        console.warn("Zdarzenie " + name + " nie istnieje");

    this["on" + name.toLowerCase()] = callback;
    return this;
};

/**
 * Pobierz n-tego rodzica danego elementu na podstawie nazwy tagu lub poziomu zagnieżdżenia
 * @param {string | number} tagNameOrLevel
 * @return {Node}
 */
// $FlowFixMe
Node.prototype.getParent = Node.prototype.getParent || function (tagNameOrLevel: string | number): ?Node {

    // $FlowFixMe
    if (tagNameOrLevel > 0) {
        let nd = this;
        // $FlowFixMe
        for (let i = 0; i < tagNameOrLevel; i++) {
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

    let nd = this;
    while (nd) {
        // $FlowFixMe
        if (nd.nodeName.toLowerCase() === tagNameOrLevel.toLowerCase())
            return nd;
        nd = nd.parentNode;
    }
    return null;
};


/**
 * dodaje tag i opcjonalnie ustawia dla niego zawartość tekstową
 * @param {string} tagName
 * @param {string}textContent
 * @return {Node}
 */
// $FlowFixMe
Node.prototype.tag = Node.prototype.tag || function (tagName: string, textContent: ?string): Node {
    if (!tagName)
        return null;
    const t: Node = document.createElement(tagName);
    this.appendChild(t);
    if (textContent !== null && textContent !== undefined)
    // $FlowFixMe
        t.txt(textContent);
    return t;
};

// $FlowFixMe
Node.prototype.tagNS = Node.prototype.tagNS || function (namespace: string, tagName: string, textContent: ?string): Node {
    const t = document.createElementNS(namespace, tagName);
    this.appendChild(t);
    if (textContent !== null && textContent !== undefined)
    // $FlowFixMe
        t.txt(textContent);
    return t;
};

// $FlowFixMe
Node.prototype.insertAfter = Node.prototype.insertAfter || function (newNode: Node): Node {
    this.parentNode.insertBefore(newNode, this.nextSibling);
    return this;
};


/**
 * dodaj gałąź tekstową do bieżącej gałęzi
 * @param {string} str
 */
// $FlowFixMe
Node.prototype.addText = Node.prototype.addText || function (str: string): Node {
    this.appendChild(document.createTextNode(str));
    return this;
};

/**
 * Usuń wszystkie gałęzie tekstowe z bieżącej i dodaj nową
 * @param {string} str
 * @return {Node}
 */
// $FlowFixMe
Node.prototype.setText = Node.prototype.setText || function (str: string): Node {
    this.innerText = str;
    return this;
}
;

/**
 * Usuń wszystkie gałęzie tekstowe z bieżącej i dodaj nową
 * @param {string} str
 * @return {Node}
 */
// $FlowFixMe
Node.prototype.updateText = Node.prototype.setText || function (str
:
string
):
Node
{
    this.forEach(function (node) {
        if (node.nodeName === "#text")
            node.parentNode.removeChild(node);
    });
    this.appendChild(document.createTextNode(str));
    return this;
};

// $FlowFixMe
Node.prototype.txt = Node.prototype.txt || function (str: ?string): Node {
    return this.setText(str);
};


/**
 * Wyczyść wszystkie potomne gałęzie
 * @return {Node}
 */
// $FlowFixMe
Node.prototype.clear = Node.prototype.clear || function (): Node {
    while (this.firstChild)
        this.innerHTML = '';
//        this.removeChild(this.firstChild);
    return this;
};

/**
 * Ustaw klasę css
 * @param {string} className
 * @return {Node}
 */
// $FlowFixMe
Node.prototype.cls = Node.prototype.cls || function (className: string): Node {
    this.className = className;
    return this;
};

/**
 * usuń dany element drzewa DOM
 * @return {Node}
 */
// $FlowFixMe
Node.prototype.remove = Node.prototype.remove || function (): Node {
    this.parentNode.removeChild(this);
    return this;
};

/**
 * Pętla iterująca po wszystkich polach danego elementu
 * @param {function} func
 * @param {boolean} elementsOnly
 */
// $FlowFixMe
Node.prototype.forEach = Node.prototype.forEach || function (func: (node: Node) => ?boolean, elementsOnly: boolean = true): void {
    if (!func)
        return;

    const arr = [];
    for (let i = 0; i < this.childNodes.length; i++)
        if (!elementsOnly || this.childNodes[i].nodeType === 1)
            arr.push(this.childNodes[i]);

    for (let i = 0; i < arr.length; i++)
        if (func(arr[i]) === false)
            return;
};


function copyNode(src: Element, dst: Element): void {
    for (let i = 0; i < src.attributes.length; i++)
        dst.setAttribute(src.attributes[i].name, src.attributes[i].value);

    for (let i = 0; i < src.childNodes.length; i++) {
        // $FlowFixMe
        const node: Element = src.childNodes[i];

        switch (node.nodeType) {
            case 3: //Node.TEXT_NODE
                dst.appendChild(document.createTextNode(node.nodeValue));
                break;
            case 1:
                break;
        }

        if (node.nodeType === 1) {
            const tag = document.createElement(node.nodeName);
            dst.appendChild(tag);
            copyNode(node, tag);
        }
    }
}


/**
 *  kopiuje zawartość bieżącej gałęzi do docelowej
 * @param {Node} dst
 * @return {Node}
 */
// $FlowFixMe
Node.prototype.copyTo = Node.prototype.copyTo || function (dst: Element): Node {
    copyNode(this, dst);
    return this;
};

/**
 * Pętla forEach na kolekcji typu HTMLCollection
 * @param {function} func
 * @return {HTMLCollection}
 */
// $FlowFixMe
HTMLCollection.prototype.forEach = HTMLCollection.prototype.forEach || function (func: (node: Node) => ?boolean): Node {
    const arr = [];
    for (let i = 0; i < this.length; i++)
        arr.push(this[i]);

    for (let i = 0; i < arr.length; i++)
        if (func(arr[i]) === false)
            return this;

    return this;
};


/**
 * Element.setAttribute
 * @param data
 * @param value
 * @return {Element}
 */
// $FlowFixMe
Element.prototype.attr = Element.prototype.attr || function (data: string | Object, value: ?any): Element {
    if (typeof data === "string" && value !== null && value !== undefined) {
        this.setAttribute(data, value);
        return this;
    }

    if (!data || (typeof data !== "object"))
        return this;

    for (let name: string in (data: Object)) {
        const val: any = data[name];
        if (typeof val === "function")
            continue;

        if (val === undefined)
            this.removeAttribute(name);
        else
            this.setAttribute(name, val);
    }
    return this;
};


// $FlowFixMe
Element.prototype.replaceStyle = Element.prototype.replaceStyle || function (from: string, to: string): Element {
    const styles = (this.className || "").split(" ");
    if (from)
        styles.remove(from);
    if (to)
        styles.push(to);
    this.className = styles.join(" ");
    return this;
};


/**
 * Edycja arkuszy styli
 * @param {Object} data
 * @return {Element}
 */
// $FlowFixMe
Element.prototype.css = Element.prototype.css || function (data: Object): Element {
    if (!data || (typeof data !== "object"))
        return this;

    for (let name in data) {
        const val = data[name];
        if (typeof val === "function")
            continue;

        if (this.style[name] === undefined) {

            debugger;

            let s = name[0].toUpperCase() + name.substring(1);

            if (this.style["webkit" + s] !== undefined) {
                // autokorekata
                this.style["webkit" + s] = val;
                continue;
            }

            if (this.style["Moz" + s] !== undefined) {
                // autokorekata
                this.style["Moz" + s] = val;
                continue;
            }

            Dev.warning(null, "Nieznany selektor \"" + name + "\"");
        }

        this.style[name] = val;
    }
    return this;
};

/**
 * zwraca zaznaczoną wartość z elementu select
 * @return {string}
 */
// $FlowFixMe
HTMLSelectElement.prototype.selectedValue = HTMLSelectElement.prototype.selectedValue || function (): ?string {
    if (this.selectedIndex === -1)
        return null;
    return this.options[this.selectedIndex].value;
};

// $FlowFixMe
Node.prototype.svg = Node.prototype.svg || function (width: number, height: number, viewBox: string): Element {
    const svg = this.tagNS("http://www.w3.org/2000/svg", "svg");
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
    svg.tag = (name: string) => {
        const tag = this.tagNS("http://www.w3.org/2000/svg", name);
        tag.attr = function (name, value) {
            this.setAttribute(name, value);
            return this;
        };
        return tag;
    };
    svg.polygon = (points: string) => {
        return this.tag("polygon").attr("points", points);
    };
    svg.path = (points: string) => {
        return this.tag("path").attr("d", points);
    };
    return svg;
};


export function updateCssRule(selector, style, value) {
    for (let i = 0; i < document.styleSheets.length; i++) {
        const sheet = document.styleSheets[i];
        // $FlowFixMe
        for (let j = 0; j < sheet.cssRules.length; j++) {
            // $FlowFixMe
            const sel = sheet.cssRules[j].selectorText;
            if (!sel)
                continue;
            /*   if (sel.substring(0, 1) === "."
             || sel.substring(0, 1) === "#"
             || sel.substring(0, 1) === "@")
             sel = sel.substr(1);
             */

            if (sel.toLowerCase() !== selector.toLowerCase())
                continue;
            // $FlowFixMe
            let rule: string = sheet.cssRules[j].cssText;
            let v1 = rule.indexOf(style);
            let v2 = 0;
            if (v1 < 0) {
                v1 = rule.indexOf("{") + 1;
                v2 = v1;
            } else
                v2 = rule.indexOf(";", v1);
            if (v2 < 0)
                v2 = rule.indexOf("}", v1);
            rule = rule.substring(0, v1) + style + ": " + value
                + (v1 === v2 ? "; " : "") + rule.substring(v2, rule.length);
            // $FlowFixMe
            sheet.deleteRule(j);
            // $FlowFixMe
            sheet.insertRule(rule, j);
        }
    }
    return null;
}


export function serializeForm(form: HTMLFormElement, builder: UrlBuilder) {
    if (typeof form === 'string')
        form = $id(form);

    if (!form || !form.elements)
        return;
    if (!builder instanceof UrlBuilder)
        builder = new UrlBuilder();
    let i, j, first;
    const elems = form.elements;
    for (i = 0; i < elems.length; i += 1, first = false) {
        // $FlowFixMe
        if (elems[i].name.length > 0) { /* don't include unnamed elements */
            // $FlowFixMe
            switch (elems[i].type) {
                case 'select-one':
                    first = true;
                    break;
                case 'select-multiple':
                    // $FlowFixMe
                    for (j = 0; j < elems[i].options.length; j += 1)
                        // $FlowFixMe
                        if (elems[i].options[j].selected) {
                            // $FlowFixMe
                            builder.add(elems[i].name, elems[i].options[j].value);
                            if (first)
                                break;
                            /* stop searching for select-one */
                        }
                    break;
                case 'checkbox':
                case 'radio':
                    if (!elems[i].checked)
                        break;
                    /* else continue */
                    // $FlowFixMe
                    builder.add(elems[i].name, elems[i].value);
                    break;
                default:
                    // $FlowFixMe
                    builder.add(elems[i].name, elems[i].value);
                    break;
            }
        }
    }

    return builder.toString();
}

export function SVG(parent, width, height, viewBox) {
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
