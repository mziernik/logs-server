import Permission from "../../application/Permission";
import {Cell, Type, Dev, Record, Repository, RepoConfig, Column, Utils} from "../../core";
import BrowserRepoStorage from "../storage/BrowserRepoStorage";


/* pierwsze przymiarki do uprawnień nie skończone */
export default class PermissionsRepo extends Repository {

    static ID: Column = new Column((c: Column) => {
        c.type = Type.STRING;
        c.key = "id";
        c.name = "ID";
        c.unique = true;
        c.required = true;
        c.readOnly = true;
    });

    static NAME: Column = new Column((c: Column) => {
        c.type = Type.STRING;
        c.key = "name";
        c.name = "Nazwa";
    });

    static CREATE: Column = new Column((c: Column) => {
        c.type = Type.BOOLEAN;
        c.key = "create";
        c.name = "Tworzenie";
        c.required = true;
    });

    static READ: Column = new Column((c: Column) => {
        c.type = Type.BOOLEAN;
        c.key = "read";
        c.name = "Odczyt";
        c.required = true;
    });

    static UPDATE: Column = new Column((c: Column) => {
        c.type = Type.BOOLEAN;
        c.key = "update";
        c.name = "Aktualizacja";
        c.required = true;
    });

    static DELETE: Column = new Column((c: Column) => {
        c.type = Type.BOOLEAN;
        c.key = "delete";
        c.name = "Usuwanie";
        c.required = true;
    });

    static EXECUTE: Column = new Column((c: Column) => {
        c.type = Type.BOOLEAN;
        c.key = "execute";
        c.name = "Wykonanie";
        c.required = true;
    });


    constructor() {
        super((rc: RepoConfig) => {
            rc.key = "permissions";
            rc.name = "Uprawnienia";
            rc.primaryKeyColumn = PermissionsRepo.ID;
            rc.record = PermissionRecord;
        });
        this.storage = BrowserRepoStorage.INSTANCE;
    }

    refresh() {
        Repository.update(this, Utils.forEach(Permission.all, (p: Permission) => p.record ? undefined
            : new PermissionRecord(this, PermissionsRepo, p)), false);
        this.isReady = true;
    }
}

/* pierwsze przymiarki do uprawnień nie skończone */
export class PermissionRecord extends Record {

    permission: ?Permission = null;

    ID: Cell = new Cell(this, PermissionsRepo.ID);
    NAME: Cell = new Cell(this, PermissionsRepo.NAME);
    CREATE: Cell = new Cell(this, PermissionsRepo.CREATE);
    READ: Cell = new Cell(this, PermissionsRepo.READ);
    UPDATE: Cell = new Cell(this, PermissionsRepo.UPDATE);
    DELETE: Cell = new Cell(this, PermissionsRepo.DELETE);
    EXECUTE: Cell = new Cell(this, PermissionsRepo.EXECUTE);

    constructor(repo: PermissionsRepo, context: any, permission: ?Permission) {
        super(repo, context);

        this.permission = permission;
        if (permission) {
            this.ID.set(permission.id);
            this.NAME.set(permission.name);
            let crude = permission.crude;
            this.CREATE.value = crude.indexOf("C") !== -1;
            this.READ.value = crude.indexOf("R") !== -1;
            this.UPDATE.value = crude.indexOf("U") !== -1;
            this.DELETE.value = crude.indexOf("D") !== -1;
            this.EXECUTE.value = crude.indexOf("E") !== -1;

        }
        this.onFieldChange.listen(this, data => {
            if (!data.wasChanged) return;
            Repository.commit(this, [this]);
        });
    }

    _update(context: any, action: CRUDE, source: PermissionRecord): Record {
        super._update(context, action, source);
        if (!source.permission)
            return;
        source.permission.record = this;
        this.permission = source.permission;

        const crude = this.permission.crude;

        this.permission.create(this.CREATE.value);
        this.permission.read(this.READ.value);
        this.permission.update(this.UPDATE.value);
        this.permission.delete(this.DELETE.value);
        this.permission.execute(this.EXECUTE.value);

        if (crude !== this.permission.crude)
            Dev.log(this, `Aktualizacja uprawnień  ${this.permission.id}: ${crude} -> ${this.permission.crude}`);
    }


    // static create(id: string, crude: string): PermissionRecord {
    //     return PermissionsRepo.instance.add(new PermissionRecord(name, crude));
    // }

    hasRight(action: string): boolean {

        switch ((action || "").toLowerCase()) {

            case "create":
            case "c":
                return this._create;

            case "read":
            case "r":
                return this._read;

            case "update":
            case "u":
                return this._update;

            case "delete":
            case "d":
                return this._delete;

            case "execute":
            case "e":
                return this._execute;
        }

    }

}

export const PERMISSIONS: PermissionsRepo = Repository.register(new PermissionsRepo());