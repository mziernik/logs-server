/**
 * Klasa stanowi funkcję listy obserwowanej.
 * Dodatkowo istnieje możliwość grupowania elementów według kontekstu - przydatne w momencie gdy dodajemy listennery do
 * obiektów, które sa niszczone. W momencie ich niszczenia można usunąć wszystkich obserwatorów (na podstawie kontekstu będącego usuwanym elementem)
 * Jeśli kontekstem jest klasa Component to w momencie jej zniszczenia (odmontowania) wszystkie obserwatory z nim powiązane zostaną usunięte.
 */

import "./DOMPrototype";
import {Utils, Check, Trigger} from "../$utils.js";
import * as ContextObject from "../application/ContextObject";
import Dev from "../Dev";

export default class Dispatcher {

    observers: Observer[] = [];
    context: any;

    beforeDispatch: Dispatcher;


    /** ilość wysłanych zdarzeń */
    sent: number = 0;

    /** ilość odebranych zdarzeń */
    received: number = 0;

    /** Nazwy klas nadawców */
    senders: string[] = [];

    _onDispatch: (sender: any, data: Object) => boolean;
    _onListen: (context: any, func: (data: Object) => ?any) => boolean;

    constructor(parent: any) {
        this.context = parent;
        this.beforeDispatch = parent instanceof Dispatcher ? null : new Dispatcher(this);
    }

    /**
     * Zadeklaruj handler obsługujący zdarzenie (obserwatora)
     * @param context
     * @param func
     * @return {Dispatcher}
     */
    listen(context: any, func: (data: Object) => ?any): Observer {
        Check.isDefined(context, "Brak definicji kontekstu");

        if (this._onListen && !this._onListen(context, func) === false) return;

        const o = new Observer(this, context, func);
        this.observers.push(o);
        ContextObject.add(context, o, () => this.observers.remove(o));
        return o;
    }

    listenDelayed(context: any, delay: number, func: (data: Object) => ?any): Observer {
        const delayed = new Trigger();
        this.listen(context, data => delayed.call(func, delay, data));
    }

    removeListenerByContext(context: any) {
        debugger;

        const result = this.observers.reduce((o: Observer) => o.context === context);

    }

    /**
     * Wywołaj funkcje wszystkich obserwatorów
     * @param args
     * @return {Dispatcher}
     */
    dispatch(sender: any, data: Object): Dispatcher {

        if (this._onDispatch && this._onDispatch(sender, data) === false) return;

        const name = Utils.className(sender);
        if (this.senders.indexOf(name) === -1)
            this.senders.push(name);

        ++this.sent;
        this.observers.forEach((o: Observer) => o.dispatch(sender, data));
        return this;
    }


    /**
     * Usuń obserwator na podstawie funkcji zwrotnej
     * @param func
     * @return {number} ilość usuniętych obserwatorów
     */
    removeByFunc(func: (...args: any) => ?any): number {
        let cnt = 0;
        this.observers.forEach(o => {
            if (o.func === func) {
                this.observers.remove(o);
                ++cnt;
            }
        });
        return cnt;
    }

    /**
     * Usuń wszystkie obserwatory danego kontekstu
     * @param context
     * @return {number} ilość usuniętych obserwatorów
     */
    removeByContext(context: any): Dispatcher {
        let cnt = 0;
        this.observers.forEach(o => {
            if (o.context === context) {
                o.remove();
                ++cnt;
            }
        });
        return cnt;
    }

    /** Zwróć nazwy klas odbiorców */
    getListeners(): string[] {
        return this.observers.map((o: Observer) => Utils.className(o.context));
    }

}

export class Observer {

    static all: Observer[] = [];
    context: any;
    func: (...args: any) => ?any;
    dispatcher: Dispatcher;
    /** Czy zdarzenie może być obsłużone */
    canHandle: boolean | () => boolean = true;

    constructor(dispatcher: Dispatcher, context: any, func: (...args: any) => ?any) {
        this.dispatcher = Check.instanceOf(dispatcher, [Dispatcher]);
        this.context = context;
        this.func = Check.instanceOf(func, ["function"]);
        Observer.all.push(this);
    }

    remove() {
        Observer.all.remove(this);
        this.dispatcher.observers.remove(this);
    }


    /**
     * Wywołaj funkcję obserwatora
     * @param args
     * @return {Dispatcher}
     */
    dispatch(sender: any, data: any): Observer {

        if (typeof this.canHandle === "boolean" && !this.canHandle)
            return;

        if (typeof this.canHandle === "function") {
            let result = this.canHandle();
            if (typeof result !== "boolean")
                throw new Error("Rezultat [event.canHandle] musi być typu boolean");
            if (!result)
                return;
        }
        if (this.dispatcher.beforeDispatch)
            this.dispatcher.beforeDispatch.dispatch(this, data);

        ++this.dispatcher.received;

        const obj = {
            _context: this.context, // odbiorca
            _sender: sender, // nadawca
            _dispatcher: this.dispatcher,
            _observer: this
        };

        Utils.clone(data, obj);

        Dev.duration([this, this.context, sender], "Dispatch", () => this.func(obj));

        return this;
    }

}