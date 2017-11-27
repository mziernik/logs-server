import Repository, {RepoError} from "./Repository";
import Column from "./Column";
import Record from "./Record";
import {Utils, Is, Check} from "../$utils";
import Field from "./Field";
import RepoCursor from "./RepoCursor";
import Watcher from "../utils/Watcher";


export class ForeignConstraintItem {

    column: Column; // kolumna lokalna, której dotyczy klucz
    foreign: Column; // kolumna docelowa klucza obcego
    isSelf: boolean;
    values: any[];

    constructor(foreign: Foreign, value: string | Array) {

        if (Is.array(value)) {
            this.values = value;
            return;
        }

        const items: string[] = Check.isString(value).split(".");
        this.column = items[0] === "this" ? foreign.self : foreign.self.repository.getColumn(items[0], true, true);
        this.isSelf = this.column === foreign.self;


        if (items[1]) {
            const foreignRepo: Repository = this.column === foreign.self ? foreign.repo : this.column.foreign.repo;
            if (!foreignRepo)
                throw new RepoError("Kolumna " + Utils.escape(this.column.key) + " nie posiada klucza obcego");
            this.foreign = foreignRepo.getColumn(items[1]);
        }
    }

    getValues(field: Field, cursor: RepoCursor): any[] {
        if (this.values)
            return this.values;

        const rec: Record = field.record;

        if (!this.isSelf) {

            const v = rec.getValue(this.column);
            if (!this.foreign)
                return v;

            if (v === null)
                return;
            return this.foreign.repository.getValue(v, this.foreign);
        }

        if (!this.foreign)
            return cursor.primaryKey;

        return cursor.getValue(this.foreign);
    }

}

export class ForeignConstraint {
    foreign: Foreign;
    left: ForeignConstraintItem | string;
    right: ForeignConstraintItem | string;

    constructor(foreign: Foreign, left: string, right: string) {
        this.foreign = foreign;
        this.left = new ForeignConstraintItem(foreign, left);
        this.right = new ForeignConstraintItem(foreign, right);

        if (!this.left.isSelf && !this.right.isSelf)
            throw new RepoError(foreign.repo, "Żadna z kolumn (" + Utils.escape(left) + ", " + Utils.escape(right)
                + ") nie wskazuje na siebie samą (this lub " + foreign.column.key + ")");

        //dopasowanie typów wartości

        if (this.left.values)
            this.left.values = Utils.forEach(this.left.values, value => (this.right.foreign || this.right.column).parse(value));

        if (this.right.values)
            this.right.values = Utils.forEach(this.right.values, value => (this.left.foreign || this.left.column).parse(value));

    }

}

export default class Foreign {

    repo: Repository; // zewnętrzne repozytorium
    self: Column;
    column: Column;
    constraints: ForeignConstraint[] = [];


    constructor(col: Column, value: string | Object) {
        this.self = col;
        this.repo = null;
        this.column = null;

        new Watcher(this)
            .watch((fieldName: string, fieldValue: any) => !fieldValue) // obserwuj tylko pola które nie mają wartości
            .onFirstGet((fieldName: string, fieldValue: any) => {

                if (Is.func(value)) {
                    this.repo = Check.instanceOf(value(), [Repository]);
                    this.column = this.repo.primaryKeyColumn;
                    return this;
                }

                if (Is.string(value)) {
                    const items = (value: string).split(".");
                    this.repo = Repository.get(items[0], true);
                    this.column = items[1] ? this.repo.getColumn(items[1]) : this.repo.primaryKeyColumn;
                    return this;
                }

                this.repo = Repository.get(value.repository, true);
                this.column = value.column ? Is.string(value.column, c => this.repo.getColumn(c, true), c => Check.instanceOf(c, [Column]))
                    : this.repo.primaryKeyColumn;

                Utils.forEach(value.constraints, obj => Check.isArray(obj) && this.constraints.push(new ForeignConstraint(this, obj[0], obj[1])));

            });


        return this;
    }

    getEnumerate(field: Field): Map {
        if (!this.constraints.length)
            return this.repo.displayMap; // brak ograniczeń, zwracam całą mapę

        const result: Map = new Map();

        let rightCount = 0;

        Utils.forEach(this.constraints, (fc: ForeignConstraint) => {
            this.repo.forEach((cursor: RepoCursor) => {
                const left: [] = Utils.asUniqueArray(fc.left.getValues(field, cursor));
                const right: [] = Utils.asUniqueArray(fc.right.getValues(field, cursor));
                rightCount += right.length;

                if (right.containsAny(left))
                    result.set(cursor.primaryKey, this.repo.getDisplayValue(cursor.getRecord(null)));
            });

        });

        if (!rightCount)
            return this.repo.displayMap;
        Repository.sortMap(result);
        return result;
    }
}