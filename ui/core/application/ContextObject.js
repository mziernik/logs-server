/**
 * Klasa umożliwia zarządzanie cyklem życia obiektów powiązanych z danym kontekstem.
 * Jeśli dany kontekst (np strona) zostaje zniszczony, to automatycznie zostaje również wywołana funkcja zwrotna
 * [onContextDestroy] metody [add]
 */

import * as Check from "../utils/Check";
import MapList from "../utils/MapList";

const map: Map<any, object[]> = new Map();

/**
 * Dodaje klasę do listy. Metodę należy używać rozważnie. Referencje przetrzymywane są statycznie i żyją tak długo, aż
 * zostanie wywołana metoda [contextDestroyed] dla tego samego obiektu kontekstu co w metodzie add. Jeśli metoda
 * [contextDestroyed] nie zostanie wywołana \, powstanie wyciek pamięci
 * @param context
 * @param object
 * @param onContextDestroy
 */

export function add(context: any, object: any, onContextDestroy: (object: any, context: any) => void) {
    if (context === null || context === undefined)
        return;

    const arr: [] = map.get(context);
    if (!arr) return;

    arr.push({
        object: object,
        onContextDestroy: Check.isFunction(onContextDestroy)
    });
}

export function contextCreated(context: any) {
    if (map.has(context))
        throw new Error("Kontekst już istnieje");
    map.set(context, []);
}

export function contextDestroyed(context: any) {
    const arr: [] = map.get(context);
    if (!arr)
        throw new Error("Kontekst nie istnieje");

    map.delete(context);

    arr.forEach(o => {
        o.onContextDestroy(o.object, context);
    });
}

export function getMap(): MapList<any, object> {
    return map;
}
