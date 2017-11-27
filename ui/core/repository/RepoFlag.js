import {CREATE, Crude, UPDATE} from "./CRUDE";
import * as Is from "../utils/Is";

export default class RepoFlag {

    repo: ?boolean = false;
    create: boolean = false;
    update: boolean = false;

    constructor(flags: string | boolean): RepoFlag {

        if (flags instanceof RepoFlag) {
            this.repo = flags.repo;
            this.create = flags.create;
            this.update = flags.update;
            return;
        }

        if (Is.boolean(flags)) {
            this.repo = flags;
            this.create = flags;
            this.update = flags;
            return;
        }

        if (!flags) return;

        if (!Is.string(flags)) debugger;

        flags = flags.toUpperCase();

        // bezwzględnie wszędzie (np disabled)
        if (flags.contains("A")) {
            this.repo = true;
            this.create = true;
            this.update = true;
            return this;
        }

        if (flags.contains("L")) this.repo = null;
        if (flags.contains("H")) this.repo = true;
        this.update = flags.contains("U");
        this.create = flags.contains("C");
    }

    ofCrude(crude: Crude, defaultState: boolean) {

        switch (crude) {
            case CREATE:
                return this.create;
            case UPDATE:
                return this.update;
        }
        return defaultState;
    }
}

/**
 List   - L - ukrycie na liście
 ListaH - H - wyłączenie na liście
 New    - C - ukrycie w formularzu dodawania
 Edit   - U - ukrycie w formularzu edycji
 All    - A - wyłączenie wszędzie

 hidden = "cu"
 hidden = "h"
 hidden = "l"
 */