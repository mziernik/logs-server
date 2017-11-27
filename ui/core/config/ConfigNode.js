import {DataType} from "../repository/Type";
import {Column, Record} from "../core";
import * as Bootstrap from "../Bootstrap";
import ConfigField from "./ConfigField";
import {Utils, Check} from "../$utils";



export default class ConfigNode {

    static ALL: Map<string, ConfigNode> = new Map();

    parent: ConfigNode;
    children: ConfigNode[] = [];
    name: string;
    key: string;
    fullId: string;
    fields: ConfigField[] = [];

    constructor(parent: ConfigNode, key: string, name: string) {
        this.parent = parent;
        this.name = Check.nonEmptyString(name);
        this.key = Check.id(key);

        if (parent)
            parent.children.push(this);

        const arr = [];
        let node = this;
        while (node) {
            arr.unshift(node.key);
            node = node.parent;
        }

        this.fullId = arr.join(".");

        if (ConfigNode.ALL.has(this.fullId))
            throw new Error("Gałąź " + Utils.escape(this.fullId) + " już istnieje");

        ConfigNode.ALL.set(this.fullId, this);

        Bootstrap.onLoad(() => require("./ConfigRepositories").R_CONFIG_NODE.create(this));
    }


    field(type: DataType, key: string, name: string, value: any): ConfigField {
        return new ConfigField(this, (c: Column) => {
            c.type = type;
            c.key = key;
            c.name = name;
            c.value = value;
        });
    }

    node(key: string, name: string): ConfigNode {
        return new ConfigNode(this, key, name);
    }


}





