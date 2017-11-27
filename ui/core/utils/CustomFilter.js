/** klasa budująca filtr */
import * as Is from "./Is";
import * as Utils from "./Utils";

export default class CustomFilter {
    static OPERATORS = {
        AND: 'oraz',
        OR: 'lub'
    };

    static CONDITIONS = {
        EQUAL: 'równe',
        NOT_EQUAL: 'różne od',
        GREATER: 'większe od',
        LESS: 'mniejsze od',
        CONTAINS: 'zawiera',
        NOT_CONTAINS: 'nie zawiera'
    };

    operator: string = CustomFilter.OPERATORS.AND;
    condition: string = CustomFilter.CONDITIONS.EQUAL;
    value: ?any; //wartość filtru
    negation: boolean = false; //negacja wyniku
    conditions: [] = []; //warunki [CustomFilter]
    accessor: ?string = null; //nazwa/indeks pola w danych
    compareFn: (a, b) => number = null; //funkcja porównująca
    filterFn: (filter, val) => boolean = null; //funkcja szukająca

    /** konstruktor
     * @param value wartość do której ma być porównanie
     * @param condition typ porównania CustomFilter.CONDITIONS
     * @param operator typ operacji (łączenia warunków) CustomFilter.OPERATORS
     * @param accessor nazwa/id pola w danych
     * @param negation czy negacja warunku
     */
    constructor(value, condition = null, operator = null, accessor = null, negation = false) {
        this.value = Utils.getPropValue('value', value, value);
        this.condition = condition || CustomFilter.CONDITIONS.EQUAL;
        this.operator = operator || CustomFilter.OPERATORS.AND;
        this.accessor = accessor;
        this.negation = negation;
    }

    static getConditions(type: ?string = null): {} {
        if (type === null) return CustomFilter.CONDITIONS;
        switch (type) {
            case 'string':
                return {
                    EQUAL: CustomFilter.CONDITIONS.EQUAL,
                    NOT_EQUAL: CustomFilter.CONDITIONS.NOT_EQUAL,
                    CONTAINS: CustomFilter.CONDITIONS.CONTAINS,
                    NOT_CONTAINS: CustomFilter.CONDITIONS.NOT_CONTAINS
                };
            case 'number':
                return {
                    EQUAL: CustomFilter.CONDITIONS.EQUAL,
                    NOT_EQUAL: CustomFilter.CONDITIONS.NOT_EQUAL,
                    GREATER: CustomFilter.CONDITIONS.GREATER,
                    LESS: CustomFilter.CONDITIONS.LESS
                };
            default:
                return {
                    EQUAL: CustomFilter.CONDITIONS.EQUAL,
                    NOT_EQUAL: CustomFilter.CONDITIONS.NOT_EQUAL
                }
        }
    }

    /** Tworzy warunek && (x > value).
     * @param value wartość do której ma być porównanie
     * @param accessor nazwa/id pola w danych
     * @param negation czy negacja warunku
     * @returns {CustomFilter} nowy obiekt CustomFilter
     */
    static andBigger(value, accessor = null, negation = false): CustomFilter {
        return new CustomFilter(value, CustomFilter.CONDITIONS.GREATER, CustomFilter.OPERATORS.AND, accessor, negation);
    }

    /** Tworzy warunek || (x > value).
     * @param value wartość do której ma być porównanie
     * @param accessor nazwa/id pola w danych
     * @param negation czy negacja warunku
     * @returns {CustomFilter} nowy obiekt CustomFilter
     */
    static orBigger(value, accessor = null, negation = false): CustomFilter {
        return new CustomFilter(value, CustomFilter.CONDITIONS.GREATER, CustomFilter.OPERATORS.OR, accessor, negation);
    }

    /** Tworzy warunek && (x < value).
     * @param value wartość do której ma być porównanie
     * @param accessor nazwa/id pola w danych
     * @param negation czy negacja warunku
     * @returns {CustomFilter} nowy obiekt CustomFilter
     */
    static andSmaller(value, accessor = null, negation = false): CustomFilter {
        return new CustomFilter(value, CustomFilter.CONDITIONS.LESS, CustomFilter.OPERATORS.AND, accessor, negation);
    }

    /** Tworzy warunek || (x < value).
     * @param value wartość do której ma być porównanie
     * @param accessor nazwa/id pola w danych
     * @param negation czy negacja warunku
     * @returns {CustomFilter} nowy obiekt CustomFilter
     */
    static orSmaller(value, accessor = null, negation = false): CustomFilter {
        return new CustomFilter(value, CustomFilter.CONDITIONS.LESS, CustomFilter.OPERATORS.OR, accessor, negation);
    }

    /** Tworzy warunek && (x === value).
     * @param value wartość do której ma być porównanie
     * @param accessor nazwa/id pola w danych
     * @param negation czy negacja warunku
     * @returns {CustomFilter} nowy obiekt CustomFilter
     */
    static andEqual(value, accessor = null, negation = false): CustomFilter {
        return new CustomFilter(value, CustomFilter.CONDITIONS.EQUAL, CustomFilter.OPERATORS.AND, accessor, negation);
    }

    /** Tworzy warunek || (x === value).
     * @param value wartość do której ma być porównanie
     * @param accessor nazwa/id pola w danych
     * @param negation czy negacja warunku
     * @returns {CustomFilter} nowy obiekt CustomFilter
     */
    static orEqual(value, accessor = null, negation = false): CustomFilter {
        return new CustomFilter(value, CustomFilter.CONDITIONS.EQUAL, CustomFilter.OPERATORS.OR, accessor, negation);
    }

    /** Tworzy warunek && (x !== value).
     * @param value wartość do której ma być porównanie
     * @param accessor nazwa/id pola w danych
     * @param negation czy negacja wyniku
     * @returns {CustomFilter} nowy obiekt CustomFilter
     */
    static andNotEqual(value, accessor = null, negation = false): CustomFilter {
        return new CustomFilter(value, CustomFilter.CONDITIONS.NOT_EQUAL, CustomFilter.OPERATORS.AND, accessor, negation);
    }

    /** Tworzy warunek || (x !== value).
     * @param value wartość do której ma być porównanie
     * @param accessor nazwa/id pola w danych
     * @param negation czy negacja wyniku
     * @returns {CustomFilter} nowy obiekt CustomFilter
     */
    static orNotEqual(value, accessor = null, negation = false): CustomFilter {
        return new CustomFilter(value, CustomFilter.CONDITIONS.NOT_EQUAL, CustomFilter.OPERATORS.ORaccessor, accessor, negation);
    }

    /** zwraca podstawową funkcję porównania dla danego typu prostego
     * @param type typ prosty string|number|boolean
     * @returns {*}
     */
    static defaultCompareFn(type: string): ?(a, b) => number {
        switch (type) {
            case 'number':
                return (a, b) => a - b;
            case 'boolean':
                return (a, b) => {
                    if (a === b) return 0;
                    if (a === null || a === undefined) return 1;
                    if (b === null || b === undefined) return -1;
                    return a ? -1 : 1;
                };
            case 'string':
                return (a, b) => {
                    a = a ? a.toLowerCase() : a;
                    b = b ? b.toLowerCase() : b;
                    if (a === b) return 0;
                    if (a === null || a === undefined) return 1;
                    if (b === null || b === undefined) return -1;
                    return a.localeCompare(b, 'pl', {sensitivity: 'accent', numeric: true});
                };
            default:
                return (a, b) => {
                    a = Utils.toString(a);
                    b = Utils.toString(b);
                    a = a ? a.toLowerCase() : a;
                    b = b ? b.toLowerCase() : b;
                    if (a === b) return 0;
                    if (a === null || a === undefined) return 1;
                    if (b === null || b === undefined) return -1;
                    return a.localeCompare(b, 'pl', {sensitivity: 'accent', numeric: true});
                };
        }
    }

    /** domyślna funkcja filrująca (contains)
     * @param filter wartość szukana
     * @param value wartość sprawdzana
     * @returns {boolean}
     */
    static defaultFilterFn(filter, value): boolean {
        return Utils.toString(value).contains(Utils.toString(filter));
    }

    /** dodaje n warunków
     * @param CustomFilter warunki
     * @returns {CustomFilter} this
     */
    addCondition([...CustomFilter]): CustomFilter {
        Utils.forEach(arguments, (arg) => this.conditions.push(arg));
        return this;
    }

    /** sprawdza czy filtr korzysta z różnych pól (accessor)
     * @param filter filtr do sprawdzenia
     * @returns {boolean}
     * @private
     */
    _useAccessor(filter: CustomFilter): boolean {
        let res = false;
        const accessor = filter.accessor;
        for (let i = 0; i < filter.conditions.length; ++i) {
            res = filter.conditions[i].accessor !== accessor;
            if (res)
                break;
            res = this._useAccessor(filter.conditions[i]);
        }
        return res;
    }

    /** wykonuje filtr
     * @param val wartość, która ma być sprawdzona
     * @param useAccessor czy ma pobrać wartość z określonego pola
     * @returns {boolean}
     */
    filter(val: ?any, useAccessor: ?boolean = null): boolean {
        if (useAccessor === null)
            useAccessor = this._useAccessor(this);

        let tmpVal = val;
        if (Is.defined(this.accessor) && useAccessor && Is.defined(val))
            tmpVal = val[this.accessor];
        tmpVal = Utils.getPropValue('value', tmpVal, tmpVal);

        const compareFn = Is.func(this.compareFn) ? this.compareFn : CustomFilter.defaultCompareFn(typeof(tmpVal));
        if (!Is.func(compareFn)) throw new Error("Brak poprawnej funkcji 'compareFn'");
        const filterFn = Is.func(this.filterFn) ? this.filterFn : CustomFilter.defaultFilterFn;

        let res = false;
        switch (this.condition) {
            case CustomFilter.CONDITIONS.EQUAL:
                res = compareFn(tmpVal, this.value) === 0;
                break;
            case CustomFilter.CONDITIONS.NOT_EQUAL:
                res = compareFn(tmpVal, this.value) !== 0;
                break;
            case CustomFilter.CONDITIONS.LESS:
                res = compareFn(tmpVal, this.value) < 0;
                break;
            case CustomFilter.CONDITIONS.GREATER:
                res = compareFn(tmpVal, this.value) > 0;
                break;
            case CustomFilter.CONDITIONS.CONTAINS:
                res = filterFn(this.value, tmpVal);
                break;
            case CustomFilter.CONDITIONS.NOT_CONTAINS:
                res = !filterFn(this.value, tmpVal);
                break;
            default:
                res = filterFn(this.value, tmpVal);
                break;
        }

        Utils.forEach(this.conditions, (condition: CustomFilter) => {
            switch (condition.operator) {
                case CustomFilter.OPERATORS.AND:
                    res = res && condition.filter(val, useAccessor);
                    break;
                case CustomFilter.OPERATORS.OR:
                    res = res || condition.filter(val, useAccessor);
                    break;
                default:
                    break;
            }
        });
        return this.negation ? !res : res;
    }

    /** tekstowa reprezentacja zbudowanego warunku
     * @param x sprawdzana wartość. Tylko dla reprezentacji
     * @param cut czy obciąć dodatkowe warunki
     * @returns {string}
     */
    toString(x: string = '$x', cut: boolean = false): string {
        let res = (this.accessor || x) + ' ' + this.condition + ' ' + this.value;
        if (!cut) {
            Utils.forEach(this.conditions, (condition: CustomFilter) => {
                const brackets = condition.conditions.length > 0;
                res = res + ' ' + condition.operator + (brackets ? ' (' : ' ') + condition.toString(x) + (brackets ? ')' : '')
            });
        }
        if (this.negation)
            res = '!(' + res + ')';
        return res;
    }

    /** Tworzy kopię obiektu
     * @returns {CustomFilter} nowa instancja
     */
    clone(): CustomFilter {
        const res = new CustomFilter();
        Utils.forEach(this, (value, name) => {
            if (name === 'conditions') {
                const conds = Utils.forEach(value, (con) => con.clone());
                if (conds.length > 0)
                    res.addCondition(...conds);
            }
            else
                res[name] = value;
        });
        return res;
    }
}
