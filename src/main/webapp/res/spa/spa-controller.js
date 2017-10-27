/* global spa */

function SPAController(spa, ctrlFunct, helper) {
    "use strict";

    var ctrl = this;

    this.id = null;
    this.name = null;
    this.urls = null;
    this.htmlTemplate = null;
    this.clearOnUnload = false;
    this.visible = false;
    this.instance = null;
    this.language = null; // obiekt zawierający tłumaczenia
    this.htmlDoc = null; // zmienna wskazująca na strukturę tagów szablonu
    this.spa = spa;


    /**
     * Zgłoś cheć odbierania zdarzeń WebApi. Serwer rozsyła dane zdarzenie do
     * klientów, którzy zadeklarowali chięć odbioru (na podstawie nazwy)
     * @param {string} source Nazwa (identyfikator) zdarzenia
     * @param {function} callback Funkcja zwrotna wywoływana po odebraniu zdarzenia
     * @returns {void}
     */
    this.registerEvent = (source, callback) => {
        spa.webApi.registerEvent(ctrl, source, this.urls, callback);
    };

    /**
     * Inicjalizacja - pierwsze wywołanie konstruktora, lub wywołanie po wczytaniu pustego htmla do kontenera
     * @param {type} e
     * @returns {void}
     */
    this.onNewInstance = null;

    /**
     * Zdarzenie wyświetlenia (wczytania) kontrolera
     * @param {type} e
     * @returns {undefined}
     */
    this.onLoad = null;

    /**
     * Zdarzenie ukrycia (wyładowania) kontrolera
     * @param {type} e
     * @returns {undefined}
     */
    this.onUnload = null;


    /**
     * Wczytaj wartość zapamiętaną w LocalStorage. Rezultatem jest wartość, obiekt lub tablica
     * @param {type} name
     * @returns {undefined|Array|Object}
     */
    this.loadValue = (name) => {
        var result = window.localStorage.getItem(this.id + "." + name);
        return result ? JSON.parse(result) : undefined;
    };

    /**
     * Zapamiętaj wartość w local storage powiązaną z danym kontrolerem - wartością jest dowolny obiekt
     * @param {type} name
     * @param {type} value
     * @returns {undefined}
     */
    this.saveValue = (name, value) => {
        window.localStorage.setItem(this.id + "." + name, JSON.stringify(value));
    };


    Object.preventExtensions(this);
    // musi być na końcu
    this.instance = new ctrlFunct(this, spa.webApi.impl);

    if (!this.name)
        throw new Error("Brak nazwy kontrolera");

    if (!(this.urls instanceof Array))
        throw new Error("Brak zdefiniowanych adresów URL kontrolera");

    if (this.htmlTemplate === undefined)
        throw new Error("Brak zdefiniowanego szablonu HTML kontrolera");
}
