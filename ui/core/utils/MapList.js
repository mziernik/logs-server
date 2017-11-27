export default class MapList<K, V> {

    map: Map<K, V[]> = new Map();

    constructor() {
    }

    add(key: K, value: V) {
        let arr: [] = this.map.get(key);
        if (!arr) {
            arr = [];
            this.map.set(key, arr);
        }
        arr.push(value);
    }

    get (key: K): V[] {
        return this.map.get(key);
    }

    delete(key: K) {
        this.map.delete(key);
    }

    has(key: K): boolean {
        return this.map.has(key);
    }

}