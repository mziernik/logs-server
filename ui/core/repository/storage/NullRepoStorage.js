"use strict";

import {Utils, Field, Record, Store, Repository} from "../../core";
import RepositoryStorage from "./RepositoryStorage";

export default class LoopbackRepoStorage extends RepositoryStorage {

    static INSTANCE: LoopbackRepoStorage = new LoopbackRepoStorage();

    store: Store = Store.local;

    /** Wczytaj dane rekordów (na potrzeby danych typu onDemand) */
    read(records: Record[]): Promise {
        throw new Error("Unsupported operation");
    }

    /** Wczytaj zawartość repozytoriów */

    load(repos: Repository[]): Promise {
        debugger;
        return new Promise((resolve, reject) => {
            const dto = {};
            resolve(dto);
            return;
            Utils.forEach(repos, (repo: Repository) => {
                const data = this.store.get("repo-" + repo.key);
                if (!data || !data.columns || !data.rows)
                    return;
                dto[repo.key] = data;
            });
            resolve(dto);
        });
    }

    _build(repo: Repository): Object {

        const data = {};
        data.columns = [];
        data.rows = [];

        repo.items.forEach((rec: Record) => {
            if (!data.columns.length)
                rec.fields.forEach((f: Field) => data.columns.push({
                    key: f.key,
                    type: f.type.name,
                    raw: f.type.simpleType
                }));

            const row = [];
            rec.fields.forEach((f: Field) => {
                let val = f.value;

                if (val instanceof Repository)
                    val = null;

                if (val instanceof Record)
                    val = val.pk;

                row.push(val);
            });
            data.rows.push(row);
        });
        return data;
    }

    save(context: any, records: Record[]): Promise {

        debugger;
        return new Promise((resolve, reject) => {
            const repos = new Set();
            Utils.forEach(repos, (rec: Record) => repos.add(rec.repo));

            Utils.forEach(repos, (repo: Repository) => {
                this.store.set("repo-" + repo.key, this._build(repo));
            });


            resolve();
        });


    }
}