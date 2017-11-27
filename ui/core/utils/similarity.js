//http://fusejs.io/

import Fuse from "fuse.js";
import * as Utils from "./Utils";

export default class Similarity {

    list: [] = [];
    results: Map;

    search(string: string): number {
        //     const string2 = this.convert(string);

        var fuse = new Fuse(this.list, {
            id: "object",
            shouldSort: true,
            threshold: 0.2,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: ["values"]
        }); // "list" is the item array

        fuse._format = res => {
            this.results = new Map();
            Utils.forEach(res, o => this.results.set(o.item.object, o));
            return this.results;
        };

        return fuse.search(string.convertPolishChars());
    }


    add(object: any, values: string[]): Similarity {
        this.list.push({
            object: object,
            values: Utils.forEach(Utils.asArray(values), s => s.convertPolishChars())
        });
        return this;
    }


    convert(string: string) {
        string = (string || "").toLocaleUpperCase().convertPolishChars();

        let result = "";

        for (let i = 0; i < string.length; i++) {
            const c: number = string.charCodeAt(i);
            if ((c >= 48 && c <= 57) || (c >= 65 && c <= 90))
                result += string[i];
        }

        return result;

    }

}


