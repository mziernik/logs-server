"use strict";

import {Utils, Field, Record, Store, Repository, Column} from "../../core";
import RepositoryStorage from "./RepositoryStorage";
import RepoCursor from "../RepoCursor";
import {UserData} from "../../application/UserData";
import * as Is from "../../utils/Is";

export default class BrowserRepoStorage extends RepositoryStorage {

    static INSTANCE: BrowserRepoStorage = new BrowserRepoStorage();

    /** Wczytaj dane rekordów (na potrzeby danych typu onDemand) */
    read(records: Record[]): Promise {
        throw new Error("Unsupported operation");
    }

    /** Wczytaj zawartość repozytoriów */

    load(repos: Repository[]): Promise {

        return new Promise((resolve, reject) => {
            const result = {};


            Utils.forEach(repos, (repo: Repository) => {
                const data = Store.LOCAL.get("$repo[" + repo.key + "]");
                if (!Is.array(data) || data.length < 3) return;


                const meta = data[0];

                const date = new Date(meta[0]);
                const user = meta[1];
                const version = meta[2];

                const dto = {};
                dto.columns = data[1];
                data.splice(0, 2);
                dto.rows = data;
                result[repo.key] = dto;
            });
            resolve(result);
        });
    }

    save(context: any, records: Record[]): Promise {

        const buildRow = (repo: Repository, row: []): [] => {
            const arr = [];
            for (let i = 0; i < repo.columns.length; i++) {
                const col: Column = repo.columns[i];
                if (!col.writable) continue;
                let val = row[i];
                if (val === undefined) val = null;
                arr.push(col.type.serialize(val));
            }
            return arr;
        };

        return new Promise((resolve, reject) => {
                const repos: Set = new Set();
                // eliminacja powtarzających się repozytoriów
                Utils.forEach(records, (rec: Record) => repos.add(rec.repo));

                Utils.forEach(repos, (repo: Repository) => {
                    const items: Map = new Map();
                    repo.forEach((cursor: RepoCursor) => items.set(cursor.primaryKey, buildRow(repo, cursor.row)));
                    Utils.forEach(records, (rec: Record) => {
                        if (rec.repo !== repo) return;
                        items.set(rec.pk, Utils.forEach(rec.fields, (field: Field) => field.config.writable ? field.serializedValue : undefined));
                    });

                    const result = [];
                    result.push([
                        new Date().getTime(),
                        UserData.current && UserData.current.id ? UserData.current.id : null,
                        repo.version
                    ]);
                    result.push(Utils.forEach(repo.columns, (col: Column) => col.writable ? col.key : undefined));
                    Utils.forEach(items, arr => result.push(arr));
                    Store.LOCAL.set("$repo[" + repo.key + "]", result);
                });
                resolve();
            }
        );
    }
}