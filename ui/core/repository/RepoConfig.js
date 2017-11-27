import Column from "./Column";
import RepoAction from "./RepoAction";
import Repository, {RepoError} from "./Repository";
import {Utils, Is} from "../$utils";
import AppEvent from "../application/Event";


export default class RepoConfig {

    static defaultCrudeRights = "CRUD"; //"CRUDE"

    record: Object = null;
    key: ?string = null;
    name: ?string = null;
    group: ?string = null;
    primaryKeyColumn: Column = null;
    displayNameColumn: ?Column = null;
    displayMask: ?string = null;
    actions: ?Object | RepoAction[] = null;
    onDemand: boolean = false;
    broadcast: boolean = false;
    references: ?Object = null;

    /** Kolumna definiująca rodzica - dla struktury drzewiastej */
    parentColumn: ?Column = null;
    /** Kolumna definiująca wartość kolejności wyświetlania wierszy - dla repozytoriów w których można sortować wiersze*/
    orderColumn: ?Column = null;
    description: ?string = null;

    info: ?Object = null;

    limit: ?number = null;
    offset: ?number = null;

    crude: string = RepoConfig.defaultCrudeRights;
    local: ?boolean = null;
    icon: ?string = null;
    _columns: Column[] = [];
    /** Repozytorium utworzone dynamicznie (rezultat metody [list] z webapi)*/
    dynamic: boolean = false;

    _repo: Repository;

    callbacks: ?string = ""; // create, edit, validate

    constructor(repo: Repository) {
        this._repo = repo;
        Object.preventExtensions(this);
    }


    _processColumns(data: Object) {
        const getColumn = (col) => {
            if (col instanceof Column)
                col = (col: Column).key;

            const result = this._columns.find(c => c.key === col);

            if (col && !result)
                throw new RepoError(this._repo, "Nie znaleziono kolumny " + Utils.toString(col));

            return result;
        };

        let display = data.displayNameColumn;
        if (Is.string(display)) {
            for (let i = 0; i < display.length; i++)
                if (!".-0123456789_abcdefghijklmnopqrstuwvxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".contains(display[i])) {
                    data.displayNameColumn = null;
                    data.displayMask = display;
                    break;
                }
        }

        this.primaryKeyColumn = getColumn(data.primaryKeyColumn);
        this.displayNameColumn = getColumn(data.displayNameColumn);
        this.orderColumn = getColumn(data.orderColumn);
        this.parentColumn = getColumn(data.parentColumn);
        this.displayMask = data.displayMask;
    }

    /**
     * Wczytanie konfiguracji repozytorium z zewnątrz (rezultat metody list z webapi)
     * @param data
     */
    load(data: Object) {


        const colsArr: string[] = [];

        // dodanie kolumn / aktualizacja istniejących
        Utils.forEach(data.columns, cdata => {
                colsArr.push(cdata.key);
                Is.defined(this._columns.find(c => c.key === cdata.key),
                    (c: Column) => c._load(cdata),
                    () => this._columns.push(new Column((c: Column) => c._load(cdata)))
                )
            }
        );

        this._processColumns(data);

        // usuwanie nadmiarowych kolumn
        Utils.forEachSafe(this._columns, (c: Column) => Is.condition(!colsArr.contains(c.key), () => this._columns.remove(c)));


        this.name = data.name;
        this.group = data.group;
        this.description = data.description;
        this.info = data.info || {};
        this.actions = data.actions || [];
        this.limit = data.limit;
        this.icon = data.icon;
        this.broadcast = data.broadcast;
        this.onDemand = data.onDemand;
        this.callbacks = data.callbacks;

        this.crude = data.crude;
        this.local = data.local;
        this.references = data.references;
    }

    /**
     * Weryfikacja i stosowanie ustawień (przepisywanie z konfiguracji do repozytorium)
     */
    update() {
        const repo: Repository = this._repo;

        Utils.forEach(this.actions, (obj, key) => RepoAction.create(obj, repo, key).register());

        this._columns.forEach(col => {
            if (!repo.columns.contains(col))
                repo.columns.push(col);
        });

        // usuwanie nadmiarowych kolumn
        Utils.forEachSafe(repo.columns, (c: Column) => Is.condition(!this._columns.contains(c), () => repo.columns.remove(c)));

        if (!this.primaryKeyColumn)
            throw new RepoError(this, "Brak definicji klucza głównego");

        if (!repo.columns.contains(this.primaryKeyColumn))
            throw new RepoError(this, "Kolumna " + Utils.escape(this.primaryKeyColumn) + " nie należy do repozytorium");

        // repo.permission = Permission.all["repo-" + this.key];
        // if (!repo.permission)
        //     repo.permission = new Permission(repo, "repo-" + this.key, `Repozytorium "${this.name}"`, Repository.defaultCrudeRights);
        //
        // repo.permission.crude = this.crude;
        AppEvent.REPO_CONFIG_UPDATE.send(this, {repo: repo, config: this})
    }

}

