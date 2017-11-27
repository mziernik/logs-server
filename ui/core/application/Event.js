// @flow
'use strict';

import * as Check from "../utils/Check";
import * as If from "../utils/Is";
import Dispatcher, {Observer} from "../utils/Dispatcher";
import Trigger from "../utils/Trigger";


/**
 * Definicja typu zdarzenia
 */
export class EventType {

    static all: EventType[] = [];

    /** @type {Dispatcher} */
    dispatcher: Dispatcher = new Dispatcher(this);

    /** @type {string} Nazwa (opisowa) zdarzenia */
    name: string;


    /**
     * @param {string} name
     */
    constructor(name: string) {
        this.name = name;
        EventType.all.push(this);

        Object.preventExtensions(this);
    }

    send(context: any, data: Object) {
        new AppEvent(context, this, data);
    }

    /**
     * Deklaracja chęci obsługi zdarzeń danego typu
     * @param {EventType} type
     * @param {function} callback
     * @return {Component}
     */
    listen(context: any, callback: (value: any, event: AppEvent) => any) {
        Check.isFunction(callback);
        this.dispatcher.listen(context, data => callback(data));
        return this;
    }

}

const queue: AppEvent[] = [];
const delayedDispatch = new Trigger(null, 0);

/**
 * Klasa umożliwiająca asynchroniczne przesyłanie zdarzeń
 */
export default class AppEvent {

    /** @type {EventType}  */
    static APPLICATION__LOCATION_CHANGE: EventType = new EventType("Zmiana adresu URL");

    /** @type {EventType}  */
    static APPLICATION__HASH_CHANGE: EventType = new EventType("Zmiana sekcji hash adresu URL");

    /** @type {EventType}  */
    static REPOSITORY_REGISTERED: EventType = new EventType("Zarejestrowano repozytorium");

    /** @type {EventType}  */
    static REPOSITORY_UPDATED: EventType = new EventType("Aktualizacja danych repozytorium");

    /** @type {EventType}  */
    static NAVIGATE: EventType = new EventType("Nawigacja do strony");

    /** @type {EventType}  */
    static RESIZE: EventType = new EventType("Zmiana rozmiaru okna lub komponentu");


    /** @type {EventType}  */
    static REPO_CONFIG_UPDATE: EventType = new EventType("Aktualizacja konfiguracji repozytorium");

    /** @type {EventType}  */
    static WEB_API_ACTION: EventType = new EventType("Żądanie lub odpowiedź WebApi");

    /** @type {any} Źródło zdarzenia, najczęściej klasa Component */
    sender: any;
    /** @type {EventType} Typ zdarzenia */
    type: EventType;
    data: Object;
    sent = false;
    /** @type {Observer[]} handlery, które obsłużyły zdarzenie */
    handlers: Observer[] = [];

    /** @type {function} Zdarzenie generowane w momencie przetworzenia zdarzenia przez wszystkie handlery */
    onSent: (AppEvent) => ?any;

    /**
     *
     * @param sender
     * @param {EventType} type
     * @param data
     */
    constructor(sender: any, type: EventType, data: Object) {
        this.sender = sender;
        this.type = Check.instanceOf(type, [EventType]);
        this.data = data;

        queue.push(this);

        delayedDispatch.call(() => {
            while (queue.length) {
                const event: AppEvent = queue.splice(0, 1)[0];
                queue.remove(event);
                event.type.dispatcher.dispatch(sender, {event: event, ...event.data});
                event.sent = true;
                If.func(event.onSent, onSent => onSent(event));
            }
        });
    }
}


window.addEventListener("resize", (e: Event) => AppEvent.RESIZE.send(window, {event: e}));




