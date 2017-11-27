// @flow
import {Check, Is, Utils} from "../$utils";
import { Type, Record, Repository, Trigger, Dispatcher, Store, DEV_MODE, CRUDE} from "../core";
import {DataType, TEXT_CASING} from "./Type";
import Column from "./Column";
import RepoFlag from "./RepoFlag";
import Dev from "../Dev";

export default class Field {

    _locked: boolean = false; // blokada możliwości zmiany edycji (tryb REMOTE i SYNCHRONIZED)
    _store: ?FieldStore = null;
    record: Record = null;
    config: Column;
    lastUpdate: ?number = null; // timestamp
    /** Walidator wartości
     * @type value wartość do zwalidatowania
     * @type done czy jest to wywołanie na koniec edycji
     * @return prawda jeśli jest ok, w innym przypadku false
     */
    validator: ?(value: ?any, done: boolean) => boolean = null;
    /** Lista handlerów błędów walidacji */
    onError: Dispatcher = new Dispatcher(this);
    /** Lista handlerów ostrzeżeń walidacji */
    onWarning: Dispatcher = new Dispatcher(this);
    /** Lista handlerów zdarzenia zmiany wartości */
    onChange: Dispatcher = new Dispatcher(this); // prevValue, currValue, wasChanged

    /** Zdarzenie aktualizacji pola z zewnątrz */
    onUpdate: Dispatcher = new Dispatcher(this);
    /** Zdarzenie zmiany flagi [wasChangedRecently]*/
    onUpdateMarkerChange = new Dispatcher(this);

    /** Zawartość pola uległa zmianie */
    changed: boolean = false;
    _getFullId: ?() => string = null;

    /** Pole nadrzędne - wykorzystywane w listach */
    parent: ?Field = null;

    /** Dowolne atrybuty */
    attributes: Object = {};
    /** Pola nadpisane przez funkcję zwrotną api*/
    redefined: RedefinedProps = new RedefinedProps(this);
    enumerateFilter: ?string[] | ?(enumerate: Map) => void = null;
    _cachedEnum: ?Map = null;
    _cachedEnumHash: ?string = null;

    constructor(cfg: Column | (cfg: Column) => void) {

        if (cfg instanceof Column)
            this.config = cfg;
        else {
            Check.isFunction(cfg);
            this.config = new Column(cfg);
        }

        cfg = this.config;


        Is.defined(cfg.value, val => this.value = val);
        Is.defined(cfg.defaultUnit, unit => this._unit = unit);

        if (DEV_MODE)
            this["#" + this.key + "[" + this.type.name + "]"] = null;

        let onChangeForward = false;
        this.onUpdateMarkerChange._onListen = () => {
            if (onChangeForward) return;
            this.onUpdate.listen(this, () => {
                this.onUpdateMarkerChange.dispatch(this, {state: true});
                setTimeout(() => this.onUpdateMarkerChange.dispatch(this, {state: false}), 3000)
            });
            onChangeForward = true;
        };

        Object.preventExtensions(this);
    }

    _error: ?string = null; // błędy walidacji

    get error(): ?string {
        return this._error;
    }

    clone(): Field {
        const field: Field = new Field(this.config);
        field.record = this.record;
        field.value = this.value;
        return field;
    }

    set error(err: ?string) {
        const prev = this._error;
        this._error = err;
        if (err !== prev)
            this.onError.dispatch(this, {field: this, error: this._error, prev: prev});
    }

    _warning: ?string = null; // ostrzeżenie (np. pole wymagane)

    get warning(): ?string {
        return this._warning;
    }

    set warning(war: ?string) {
        const prev = this._warning;
        this._warning = war;
        if (war !== prev)
            this.onWarning.dispatch(this, {field: this, warning: this._warning, prev: prev});
    }

    _unit: ?[] = null;

    get unit(): ?[] {
        return this._unit;
    }

    set unit(value: ?[]) {
        let val = this.unitValue;
        this._unit = value;
        this.value = val;
    }

    _value: ?T = null;

    get value(): ?any {
        let val = this._value;
        if (typeof  val === "string") {
            if (this.config.trimmed)
                val = val.trim();

            switch (this.config.textCasing) {
                case TEXT_CASING.LOWERCASE:
                    val = val.toLowerCase();
                    break;
                case TEXT_CASING.UPPERCASE:
                    val = val.toUpperCase();
                    break;
                default:
                    break;
            }
        }
        return val;
    }

    set value(value: ?any) {
        this.set(value, true);
    }

    /** Pełny identyfikator pola uwzględniający wszystkie elementy nadrzędne */
    get fullId() {
        if (this._getFullId)
            return this._getFullId();
        return (this.record ? this.record.fullId + "." : "") + this.key;
    }

    get key(): string {
        return this.config.key;
    }

    get name(): string {
        return Utils.coalesce(this.redefined.name, this.config.name);
    }

    get description(): string {
        return Utils.coalesce(this.redefined.description, this.config.description);
    }

    get hint(): string {
        return first(this.redefined.hint, this.config.hint);
    }

    get type(): DataType {
        return Utils.coalesce(this.redefined.type, this.config.type);
    }

    get enumerate(): Map {


        const process = () => {

            if (this.redefined.enumerate)
                return this.redefined.enumerate;

            const getEnum = () => {
                if (!this.config.foreign && !this.config.enumerate) return null;
                return this.config.foreign ? this.config.foreign.getEnumerate(this) : DataType.getMap(this.config.enumerate);
            };

            const result = getEnum();

            //sprawdzenie czy value ma dozwolone wartości
            if (result && !this.isEmpty) {
                if (this._value instanceof (Array)) {
                    let val: Array = Utils.forEach(this._value, (val) => {
                        if (result.has(val)) return val;
                    });
                    if (!val.equals(this._value))
                        this.value = val;
                } else if (!result.has(this._value))
                    if (this._value !== null)
                        this._value = null;
            }

            if (!result || !result.size)
                return result;

            if (this.record && this.record.action === CRUDE.CREATE && result.size === 1 && this._value === null && this.required)
                Utils.forEach(result, (v, k, stop) => {
                    this._value = this.type.isList ? [k] : k;
                    this.changed = true;
                    stop();
                });

            return result;
        };

        if (this.config.foreign && this.config.foreign.repo.hashCode !== this._cachedEnumHash)
            this._cachedEnum = null;

        if (!this._cachedEnum) {
            this._cachedEnum = process();
            this._cachedEnumHash = this.config.foreign && this.config.foreign.repo;
        }

        const map: Map = this._cachedEnum ? new Map() : null;
        Utils.forEach(this._cachedEnum, (v, k) => map.set(k, v));

        if (Is.array(this.enumerateFilter))
            Utils.forEachSafe(map, (v, k) => {
                if (!this.enumerateFilter.contains(k))
                    map.delete(k);
            });

        if (Is.func(this.enumerateFilter))
            this.enumerateFilter(map);
        return map;
    }

    get units(): ?() => {} {
        return this.config.units;
    }

    get action(): CRUDE {
        return this.record ? this.record.action : null;
    }

    get readOnly(): boolean {

        const value = first(this.redefined.readOnly || this.config.readOnly);

        if (Is.boolean(value)) return value;

        if (this.record && this.record.action)
            return new RepoFlag(value, false).ofCrude(this.record.action);

        return false;
    }

    get required(): boolean {

        const value = first(this.redefined.required || this.config.required);

        if (this.config.autoGenerated)
            return false;

        if (Is.boolean(value)) return value;

        if (this.record && this.record.action)
            return new RepoFlag(value, false).ofCrude(this.record.action);

        return false;
    }

    get visible(): boolean {

        if (this.redefined.visible)
            return this.redefined.visible;

        if (Is.boolean(this.config.hidden))
            return !this.config.hidden;

        if (this.record && this.record.action)
            return !(new RepoFlag(this.config.hidden, true).ofCrude(this.record.action));

        return true;
    }

    get escapedValue(): string {
        return Utils.escape(this.value);
    }

    get unique(): boolean {
        return first(this.redefined.unique, this.config.unique);
    }

    get isValid(): boolean {
        return this.config.readOnly || ( !(this._error) && (!this.required || this._value));
    }

    get isEmpty(): boolean {
        if (this._value === null || this._value === undefined || this._value === "")
            return true;
        return this.config.enumerate !== null && !this.config.type.single && this._value.length === 0;

    }

    /** Zwraca wartość przeliczoną przez jednostkę
     * @returns {?T}
     */
    get unitValue(): ?any {
        let val = this._value;
        if (val !== null && val !== undefined && this.unit && this.config.type.simpleType === 'number')
            val /= this.unit[2];
        return val;
    }

    /** Zwraca przeliczoną wartość, którą może wyświetlić react
     * @returns {string|number|boolean}
     */
    get displayValue(): string | number | boolean {

        const value = this.value;
        if (value === null)
            return null;

        const val = this.unitValue;

        // wartość przed formatowaniem jest identyczna jak po formatowaniu
        if (val === this._value)
            return Field.formatValue(this.config.type.formatDisplayValue(val, this.enumerate));

        let res = Field.formatValue(val);
        if (this.unit) res += " " + this.unit[0];
        return res;
    }

    /** Zwraca wartość, którą może wyświetlić react
     * @returns {string|number|boolean}
     */
    get simpleValue(): string | number | boolean {
        return Field.formatValue(this.value);
    }

    get serializedValue(): any {
        return this.type.serialize(this.value);
    }

    static create(type: DataType, key: string, name: string, defaultValue: any = null) {
        return new Field((c: Column) => {
            c.type = type;
            c.key = key;
            c.name = name;
            c.value = defaultValue;
        })
    }

    /** Formatuje wartość do postaci, którą może wyświetlić react*/
    static formatValue(value: any): string | number | boolean {
        if (value === null || value === undefined)
            return null;

        switch (typeof value) {
            case "string":
            case "number":
            case "boolean":
                return value;
        }

        if (value instanceof Repository)
            return (value: Repository).name;

        if (value instanceof Record)
            return (value: Record).fullId;

        if (value instanceof Date)
            return value.toLocaleString();

        if (value instanceof Array)
            return Utils.forEach(value, val => Field.formatValue(val)).join(", ");

        if (value instanceof Map)
            return Utils.forEach(value, (val, key) => Field.formatValue(key) + ": " + Field.formatValue(val)).join(", ");

        return Utils.toString(value);
    }

    /** Aktualizacja wartości 'z zewnątrz' (np z api) */
    update(context: any, value: ?any) {
        const prev = this._value;
        if (this.type.equals(value, prev)) return;
        this.lastUpdate = new Date().getTime();
        this.error = null;
        this._value = value;
        this.onUpdate.dispatch(context, {field: this, value: value, prev: prev});
    }


    /** Czy w pole zostało ostatnio zmienione (na potrzeby wizualne)*/
    get wasChangedRecently() {
        return this.lastUpdate && (new Date().getTime() - this.lastUpdate < 3000);
    }

    /**
     * Ustaw wartość pola, zweryfikuj poprawność danych
     * @param value
     * @param done {boolean}
     * @return {Field}
     */
    set(value: ?any = null, done: boolean = false): Field {
        const prev = this._value;
        if (this._locked)
            throw new Error(`Pole ${this.fullId} jest zablokowane`);
        if (value !== null && value !== undefined && this.unit && this.type.simpleType === 'number')
            value *= this.unit[2];

        if (!done)
            if (this.type.equals(value, prev))
                return this;

        if (value !== null && value !== undefined)
            try {
                value = this.config.parse(value);
                Is.func(this.validator, f => f(value));
            } catch (e) {
                e.message = this.fullId + ": " + e.message;
                this.error = e.message;
                throw e;
            }

        const wasChanged = this.changed;
        this.changed = true;
        this._value = value;
        this.error = null;
        this.validate(done);

        if (DEV_MODE && this["#" + this.key + "[" + this.type.name + "]"])
            this["#" + this.key + "[" + this.type.name + "]"] = value;


        this.onChange.dispatch(this, {
            field: this,
            done: done,
            record: this.record,
            prev: prev,
            value: value,
            wasChanged: wasChanged
        });
        return this;
    }

    /** walidacja wartości
     * @param done czy jest to wywołanie na koniec edycji wartości
     * @returns true - ok, false - error
     */
    validate(done: boolean): boolean {

        if (this.error)
            return false;

        const check = () => {

            if (this.isEmpty)
                return this.required ? 'Pole obowiązkowe' : null;

            if (this.config.type.simpleType === 'string') {
                //$FlowFixMe
                if (this.config.min && (this._value.length < this.config.min))
                    return "Zbyt krótka wartość (min: " + this.config.min + ")";
                //$FlowFixMe
                if (this.config.max && (this._value.length > this.config.max))
                    return "Zbyt długa wartość (max: " + this.config.max + ")";
                //$FlowFixMe
                if (this.config.regex && (!this.config.regex.test(this._value)))
                    return "Niepoprawna wartość";
            }

            if (this.config.type.simpleType === 'number') {
                //$FlowFixMe
                if ((this.config.min !== null) && (this._value < this.config.min))
                //$FlowFixMe
                    return "Zbyt mała wartość (min: " + this.config.min + ")";
                //$FlowFixMe
                if (this.config.max && (this._value > this.config.max))
                    return "Zbyt duża wartość (max: " + this.config.max + ")";
            }

            return null;
        };

        let err = check();

        if (Is.func(this.validator))
            try {
                //$FlowFixMe
                if (!this.validator(this._value, done)) {
                    this.error = "Nieprawidłowa wartość";
                    return false;
                }
            } catch (e) {
                this.error = e.message;
                return false;
            }

        this.error = err;

        return !err;
    }

    toString() {
        //$FlowFixMe
        return "" + this._value;
    }

    /*
        store(key: string, store: Store = Store.local): Field {
            this._store = new FieldStore(this, key, store);
            let val = this._store.load();

            if (val !== undefined)
                this.set(val);

            return this;
        }
    */
    /**
     *  Mapowanie wartości typu tablica lub elementy repozytorium na inną tablicę. Przydatne w komponentach reacta
     *  */
    map(func: (item: any, index: number) => void): Array {

        // nie można użyć (this._value instanceof Repository) bo występuje import krzyżowy
        if (Utils.className(this._value) === "Repository")
            return this._value.items.map(func);

        if (this._value instanceof Array)
            return this._value.map(func);

        return [];
    }

}

/**
 * Zwraca pierwszy z argumentów który jest różny od undefined
 * @param args
 * @returns {*}
 */
function first(...args) {
    for (let i = 0; i < args.length; i++)
        if (args[i] !== undefined)
            return args[i];
}

/**
 * Klasa przechowuje parametry pola przedefioniowane w api
 */
export class RedefinedProps {

    field: Field;
    type: DataType;
    error: string;
    warning;
    value: any;
    readOnly: boolean | string;
    required: boolean | string;
    unique: boolean;
    name: string;
    description: string;
    hint: string;
    visible: boolean;
    min: Number;
    max: Number;
    trimmed: boolean;
    regex: string;
    defaultUnit: string;
    enumerate: Map;

    constructor(field: Field) {
        this.field = field;
    }

    process(data: Object) {
        const field: Field = this.field;

        if (data.error) {
            this.error = data.error;
            field.error = data.error;
            Dev.warning(this, data.error);
        }

        if (data.warning) {
            this.warning = data.warning;
            field.warning = data.warning;
        }

        this.value = data.value;

        if (data.value !== undefined)
            field.value = data.value;

        Is.def(data.enumerate, e => {
            this.enumerate = new Map();
            Object.keys(data.enumerate).forEach(key => this.enumerate.set(key, data.enumerate[key]));
        });

        this.type = data.type ? Type.get(data.type) : undefined;
        this.readOnly = data.readOnly;
        this.required = data.required;
        this.unique = data.unique;
        this.name = data.name;
        this.description = data.description;
        this.hint = data.hint;
        this.visible = data.visible;
        this.min = data.min;
        this.max = data.max;
        this.trimmed = data.trimmed;
        this.regex = data.regex;
        this.defaultUnit = data.defaultUnit;
    }


}

class FieldStore {

    _field: Field;
    _value: ?any;
    /** Nazwa pola pod w którym zostanie zapisana wartość */
    key: string;

    /** Magazyn docelowy */
    store: Store = Store.session;

    /** Zapisuj tylko wartości, które przeszły walidację */
    validatedOnly: boolean = true;

    /** Zapisuj automatycznie wartość w momencie zmiany */
    autoSave: boolean = true;

    /** Czy zapisywać wartość w postaci zakodowanej (base64) (np na potrzeby zapisu hasła) */
    encode: boolean = false;

    _delayedSave: Trigger = new Trigger(() => this.save(), 100);

    constructor(field: Field, key: string, store: Store = Store.local) {
        this._field = field;
        this.key = key;
        this.store = store;
    }

    save(): FieldStore {
        if (!this.key || !this.store)
            return this;
        this.store.set(this.key, this._value, this.encode);
        return this;
    }

    load(): ?any {
        if (!this.key || !this.store)
            return undefined;
        this._value = this.store.get(this.key);
        return this._value;
    }

    onChange(value: ?any) {
        this._value = value;
        if (this.autoSave)
            this._delayedSave.run();
    }

}