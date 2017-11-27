/**
 * Definicja strony na potrzeby routingu
 */
import {
    AppEvent,
    Utils,
    Dispatcher,
    Check,
    Record,
    Repository
} from "../core.js";
import Icon from "../component/glyph/Icon";

export const ENDPOINT_TARGET_TAB = "tab";
export const ENDPOINT_TARGET_POPUP = "popup";
export const ENDPOINT_TARGET_EXTERNAL = "external";

export default class Endpoint {

    static ALL: Map<String, Endpoint> = new Map();
    static onChange: Dispatcher = new Dispatcher();

    /** Aktualnie wyrenderowany endpoint (strona) */
    static current: Endpoint;

    /** domyślna strona 404 */
    static NOT_FOUND: ?Endpoint;

    key: string;
    _icon: ?Icon = null;
    _name: ?string = null;
    _path: ?string = null;
    _exact: boolean = true;
    _component: ?React.Component = null;
    /** @type {boolean} Strona nie wyświetli się na liście stron  (np strona błędu) */
    _hidden: boolean = false;

    /** Link zewnętrzny, wyświetlony będzie w nowej karcie*/
    _external: boolean = false;

    _defaultParams: Object = {};

    /** Właściwości danej strony przekazywane do obiektu */
    _props: Object = {};

    onNavigate: Dispatcher = new Dispatcher();

    static homePage: Endpoint;

    _parent: ?Endpoint = null;
    _children: Endpoint[] = [];


    constructor(key: string, name: string, path: ?string, component: ?ReactComponent) {
        this.key = Check.id(key, ".");
        this._name = Check.nonEmptyString(name);
        if (path && !path.startsWith("/") && path !== "*" && !path.contains("://"))
            throw new Error(`Ścieżka (${Utils.escape(key)}) musi zaczynać się od "/", aktualnie ${Utils.escape(path)}`);
        this._path = path;
        this._component = component;
        Endpoint.ALL.set(key, this);

        if (Endpoint.NOT_FOUND) {
            // nawigacja do 404 musi być zawsze na końcu listy
            if (!Endpoint.ALL.delete(Endpoint.NOT_FOUND.key, Endpoint.NOT_FOUND))
                throw new Error();
            Endpoint.ALL.set(Endpoint.NOT_FOUND.key, Endpoint.NOT_FOUND);
        }

        if (!Endpoint.homePage && name === "/")
            Endpoint.homePage = this;

        Endpoint.onChange.dispatch(this, {endpoint: this});
    }


    static get devRouter(): Endpoint { //DevRouter
        // nie można użyć importu
        return Endpoint.getInstance(require("../page/dev/DevRouter").default);
    }

    static getInstance(endpointClass: any) {
        return Utils.find(Endpoint.ALL, (page: Endpoint) => page instanceof endpointClass);
    }

    static pageOf(component: React.Component): ?Endpoint {
        return Endpoint.ALL.find((page: Endpoint) => page._component === component);
    }

    static navigate(link: string, target: string | MouseEvent = null, key: ?string = null, name: ?string = null) {
/*
        if (target instanceof SyntheticMouseEvent) {
            const event: SyntheticMouseEvent = target;
            event.preventDefault();
            target = event.ctrlKey ? "tab" : event.shiftKey ? "popup" : null;
        }

        if (!target) target = null;
        else target = target.toLowerCase().trim();

        Check.oneOf(target, [null, ENDPOINT_TARGET_TAB, ENDPOINT_TARGET_POPUP, ENDPOINT_TARGET_EXTERNAL]);

        if (target === ENDPOINT_TARGET_EXTERNAL) {
            window.open(link);
            return;
        }

        // nie można użyć importu
        const Application = require("./Application.js").default;
        const PageTab = require("../page/PageContainer").PageTab;

        // url nie zmienił się
        if (!target && Application.router.history.location.pathname === link)
            return;

        if (target === ENDPOINT_TARGET_TAB)
            new PageTab(key, name, false).setCurrent();

        if (target === ENDPOINT_TARGET_POPUP)
            new PageTab(key, name, true).setCurrent();

        Application.router.history.push(link, {target: target});*/
    };


    navigate(params: ?Object = null, target: string | MouseEvent = null) {
        if (this.canNavigate)
            Endpoint.navigate(this.getLink(params), this._external ? ENDPOINT_TARGET_EXTERNAL : target, this.key, this._name);
    }

    get canNavigate() {
        return this._path && (this._component || this._external);
    }

    child(key: string, name: string, path: string, component: React.Component): Endpoint {
        const page = new Endpoint(this.key + "." + Check.id(key), name, path, component);
        this._children.push(page);
        page._parent = this;
        return page;
    }

    repository(repo: Repository): Endpoint {
        Check.instanceOf(repo, [Repository]).repoPage = this._component;
        return this;
    }

    record(repo: Repository): Endpoint {
        Check.instanceOf(repo, [Repository]).recordPage = this._component;
        return this;
    }

    exact(value: boolean): Endpoint {
        this._exact = value;
        return this;
    }

    props(value: Object): Endpoint {
        this._props = value;
        return this;
    }

    defaultParams(value: Object): Endpoint {
        this._defaultParams = value;
        return this;
    }

    /** Zwraca link do strony, podstawia parametry do URL-a*/
    getLink(params: ?{} = null) {

        let result: String = this._path;

        Utils.forEach(params || this._defaultParams,
            (value: string, name: string) => result = result.split(":" + name).join(encodeURIComponent(value)));

        return result;
    }

    icon(icon: Icon): Endpoint {
        this._icon = icon;
        return this;
    }

    external(value: boolean): Endpoint {
        this._external = value === undefined ? true : value;
        return this;
    }

    hidden(value: boolean): Endpoint {
        this._hidden = value === undefined ? true : value;
        return this;
    }

    static routeMap(): Map {
        return Utils.forEach(Endpoint.ALL, (page: Endpoint) => page.route());
    }

    sortChildren() {
        this._children.sort((a: Endpoint, b: Endpoint) => a._name && b._name && a._name.localeCompare(b._name));
    }
/*
    createComponent(route: Object | ReactComponent): ReactComponent {
        const props = {};
        props.key = Utils.randomId(); // dodanie losowego klucza zmusza reacta do ponownego utworzenia komponentu dziedziczącego po page

        this.onNavigate.dispatch(this, {endpoint: this, route: route});

        if (this._props)
            for (let name in this._props)
                props[name] = this._props[name];

        if (route.match && route.match.params)
            for (let name in route.match.params)
                props[name] = route.match.params[name];

        route.endpoint = this;
        props.route = route;

        AppEvent.NAVIGATE.send(this, {endpoint: this, props: props});
        const el = React.createElement(this._component, props, null);
        return el;
    }
*/

}