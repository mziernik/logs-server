// @flow
'use strict';

import {Check, Is, Type, Record, Repository, Trigger, Utils, Dispatcher, Store, DEV_MODE} from "../core";
import {DataType, TEXT_CASING} from "./Type";
import Column from "./Column";
import Field from "./Field";
import {Constraint} from "./Repository";

export default class Cell extends Field {


    constructor(record: ?Record, cfg: Column | (cfg: Column) => void) {
        super(cfg);
        this.record = record;

        // może się zdarzyć, że kolumna została usunięta - informacja przyszła w metodzie list
        if (record.repo.columns.contains(cfg))
            record.fields.set(this.config, this);

        this.onChange.listen(this, (data) => record.onFieldChange.dispatch(this, {field: this, source: data}));
    }

    get value(): any {
        return super.value;
    }

    set value(value: any) {
        return super.value = value;
    }


    get foreign(): Record | Record[]  {
        return this.record._getForeign(this, this);
    }

}