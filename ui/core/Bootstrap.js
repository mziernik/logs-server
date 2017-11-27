export const MODULES: Map<string, () => void> = new Map();
const NAMES: string[] = [];
const LISTENERS: [] = [];
const ON_LOAD: [] = [];

let loaded = false;

class Module {
    name: string;
    module: any;
    created: Date = new Date();
}

window._registerModule = function (name: string, module: any, pos: number) {

    const mod: Module = new Module();
    mod.name = name;
    mod.module = module;

    //console.log(name);

    MODULES.set(name, mod);
    NAMES.push(name);

    const toRemove = [];

    LISTENERS.forEach((arr, idx) => {
        if (NAMES.find(name => name === arr[0])) {
            try {
                arr[1](mod);
            } catch (e) {
                console.error(e);
            }
            toRemove.push(arr);
        }
    });


    if (!toRemove.length) return;
    toRemove.forEach(elm => LISTENERS.remove(elm));

};

export function onLoad(callback: () => void) {
    if (loaded) callback(); else ON_LOAD.push(callback);
}


export function onReady(fileName: string, callback: () => void): boolean {
    const result = NAMES.find(name => name === fileName);
    if (result) {
        callback();
        return true;
    }

    if (loaded)
        throw new Error("Wszystkie moduły zostały już załadowane. Prawdopodobnie nazwa pliku \"" + fileName
            + "\" jest nieprawidłowa lub moduł nie został nigdzie zaimportowany");

    LISTENERS.push([fileName, callback]);
    return false
}


window.addEventListener("load", () => {
    loaded = true;

    ON_LOAD.forEach(f => f());

    if (!LISTENERS.length) return;
    debugger;

    const names = [];
    LISTENERS.forEach(arr => {
        const n = '"' + arr[0] + '"';
        if (names.indexOf(n) === -1)
            names.push(n);
    });

    throw new Error("Poniższe moduły nie zostały już załadowane (prawdopodobnie nazwa pliku jest " +
        "nieprawidłowa lub moduł nie został nigdzie zaimportowany):\n" + names.join("\n"));

});