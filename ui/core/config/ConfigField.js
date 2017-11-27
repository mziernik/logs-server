import {Column, Record} from "../core";
import ConfigNode from "./ConfigNode";
import {Utils, Check, Dispatcher} from "../$utils";
import Field from "../repository/Field";
import * as Bootstrap from "../Bootstrap";


export class ConfigFieldData extends Column {

    local: boolean = true;
    user: boolean = false;
    group: ?string = null;

}

export default class ConfigField {

    static ALL: Map<string, ConfigNode> = new Map();

    key: string;
    field: Field;
    node: ConfigNode;
    _isCustomValue: boolean = false;
    _defaultValue: any;
    _customValue: any;

    constructor(node: ConfigNode, config: (c: Column) => void) {
        this.node = Check.instanceOf(node, [ConfigNode]);
        node.fields.push(this);
        this.field = new Field(new ConfigFieldData(config));
        this.field.config.key = (node ? node.fullId + "." : "") + this.field.key;
        this.key = this.field.key;
        this._defaultValue = this.field.config.value;
        ConfigField.ALL.set(this.field.key, this);
        Bootstrap.onLoad(() => require("./ConfigRepositories").R_CONFIG_FIELD.create(this));
    }


    get isCustomValue(): boolean {
        return this._isCustomValue;
    }

    get value(): any {
        return this.isCustomValue ? this._customValue : this._defaultValue;
    }

    set defaultValue(value: any) {
        this.setValue(false, value);
    }

    set customValue(value: any) {
        this.setValue(true, value);
    }

    get onChange(): Dispatcher {
        return this.field.onChange;
    }

    setValue(custom: boolean, value: any) {
        if (custom)
            this._isCustomValue = true;
        custom ? this._customValue = value : this._defaultValue = value;
        if (custom === this._isCustomValue)
            this.field.value = value;
    }


    toString() {
        return Utils.toString(this.value);
    }

}





