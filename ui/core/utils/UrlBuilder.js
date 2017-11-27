'use strict';

export default class UrlBuilder {

// parametr typu null : tylko nazwa
// undefined zostanie zignorowany

    constructor(baseUrl) {

        this.preUrl = "";
        this.items = [];

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

    add(nameOrObject, value) {
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
    }

    toString() {
        var url = this.preUrl;
        for (var i = 0; i < this.items.length; i++) {
            if (i)
                url += "&";
            url += this.items[i];
        }
        return url;
    }


}