// @flow

//FixMe Poprawić
//ToDo Możliwość dodania spinnera do konrolek (np do przycisku)
/*
    klepsydra pokazująca że coś sie robi, blokuje ekran - nic nie można zrobić

 */

import "./spinner.css";

let layer = null;
const list: Spinner[] = [];
let showTimeout;
let style: HTMLStyleElement;


export class SpinnerConfig {
    dark: boolean = true;
    modal: boolean = false; // warstwa wyszarzająca
    parent: HTMLElement = document.body;
    style: Object;
    text: string;
}

export default class Spinner {

    config: SpinnerConfig = new SpinnerConfig();

    static create(text: string): Spinner {
        return new Spinner((sc: SpinnerConfig) => {
            sc.modal = true;
            sc.text = text;
        });
    }

    constructor(config: (cfg: SpinnerConfig) => void) {

        if (config)
            config(this.config);

        if (this.config.modal && !layer) {
            layer = document.createElement("div");
            layer.setAttribute("class", "spinner-layer");
            document.body.appendChild(layer);
        }

        const preSpinner = document.createElement("div");
        preSpinner.setAttribute("class", "pre-spinner");
        if (this.config.modal) layer.appendChild(preSpinner); else this.config.parent.appendChild(preSpinner);

        const spinner = document.createElement("div");
        preSpinner.appendChild(spinner);
        spinner.setAttribute("class", "spinner");
        spinner.setAttribute("dark", this.config.dark);
        spinner.css(this.config.style);
        for (let i = 0; i < 12; i++)
            spinner.appendChild(document.createElement("div"));

        showTimeout = setTimeout(() => {
            if (this.config.modal) layer.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
            preSpinner.style.opacity = "1";
        }, 100);


        if (this.config.text) {
            const txt = document.createElement("div");
            txt.setAttribute("class", "spinner-text");
            preSpinner.appendChild(txt);
            txt.innerText = this.config.text;


        }


        list.push(this);
    };


    hide() {
        if (list.length === 0)
            return;

        let idx = list.indexOf(this);
        if (idx >= 0)
            list.splice(idx, 1);

        if (list.length === 0 && layer.parentNode === document.body) {
            document.body.removeChild(layer);
            clearTimeout(showTimeout);
            layer = null;
        }
    };


}

