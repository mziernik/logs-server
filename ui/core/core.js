/**
 * Plik eksportuje listę modułów core-oweych.
 * Użycie: import { AppStatus, Page, PageTitle} from "./core/exports";
 */

import "./utils/DOMPrototype";

import * as Check from "./utils/Check";

export {Check};
import * as Utils from "./utils/Utils";

export {Utils};
export {default as CustomFilter} from "./utils/CustomFilter";

import * as Is from "./utils/Is";

export {Is};

import {default as Var} from "./Var";

export {Var};


export {LOCAL as LocalStorage} from "./Store";
export {SESSION as SessionStorage} from "./Store";

export {default as EError} from "./utils/EError";

import * as Ready from "./utils/Ready";

export {Ready};

export {default as Exception} from "./utils/Exception";

export {default as Dev, DEV_MODE, TEST_MODE, PROD_MODE, DEBUG_MODE} from "./Dev";


export {default as Trigger} from "./utils/Trigger";
export {default as Dispatcher} from "./utils/Dispatcher";


// -------------------- Aplikacja ---------------------------------
import * as Type from "./repository/Type";

export {Type};

import * as CRUDE from "./repository/CRUDE";

export {CRUDE};


export {EventType} from "./application/Event";
export {default as AppEvent} from "./application/Event";
export {default as AppStatus} from "./application/Status";
export {default as Endpoint} from "./application/Endpoint";

// --------------------- moduły ------------------------------
export {default as Column} from "./repository/Column";
export {default as Repository} from "./repository/Repository";
export {default as Record} from "./repository/Record";
export {default as Field} from "./repository/Field";
export {default as Cell} from "./repository/Cell";

export {default as RepoConfig} from "./repository/RepoConfig";

import * as ContextObject from "./application/ContextObject";

export {ContextObject};

import * as Store from "./Store";

export {Store};

export {default as API} from "./application/API";
