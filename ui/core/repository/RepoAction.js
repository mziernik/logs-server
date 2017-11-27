import Repository from "./Repository";
import API from "../application/API";
import Record from "./Record";
import {Utils, Is} from "../$utils";
import RepoFlag from "./RepoFlag";
import * as Check from "../utils/Check";

export default class RepoAction {

    repo: Repository;
    key: string;
    name: string;
    action: ?() => void;
    hint: string;
    type: string = "info";
    icon: string;
    confirm: string;
    params: Object;
    paramsTitle: string;
    paramsButtonLabel: string;
    /** Ograniczenia widoczności w powiązaniu z rekordem */
    constraints: Object;
    children: RepoAction[] = [];
    visibility: RepoFlag;

    constructor(repo: Repository, key: string, name: string, visibility: string | boolean, action: () => void, confirm: string) {
        this.repo = repo;
        this.key = key;
        this.name = name;
        this.action = action;
        this.confirm = confirm;
        this.visibility = new RepoFlag(visibility);
    }

    static create(obj: Object, repo: Repository, key: string): RepoAction {
        const act = new RepoAction(repo, obj.key || key, obj.name, obj.visibility);
        act.type = obj.type;
        act.icon = obj.icon;
        act.paramsTitle = obj.paramsTitle;
        act.paramsButtonLabel = obj.paramsButtonLabel;
        act.confirm = obj.confirm;
        act.params = obj.params;
        act.constraints = obj.constraints && Check.isPlainObject(obj.constraints);
        Utils.forEach(obj.children, (v, k) => act.children.push(RepoAction.create(v, repo, k)));
        return act;
    }


    // zarejestruj akcję
    register() {
        this.repo.actions.set(this.key, this);
    }

    isVisible(record: Record) {
        if (!Is.defined(this.visibility))
            return true;
        if (!!this.visibility.repo !== !record) return false;
        if (!record) return true;
        if (!this.visibility.ofCrude(record.action)) return false;

        let pass = true;
        Utils.forEach(this.constraints, (v, k, stop) => {
            const field = record.get(k);
            const value = field.value;
            if (Utils.find(Utils.asArray(v), v => field.type.equals(field.type.parse(v), value)) === undefined) {
                pass = false;
                stop();
            }
        });

        return pass;
    }

    execute(record: Record, params: {}): Promise {
        return new Promise((resolve, reject) => {
            if (this.action) {
                const result = this.action(record, params);
                resolve(result);
            }
            else
                API.repoAction({
                        action: this.key,
                        repo: this.repo.key,
                        pk: record ? record.pk : null,
                        params: params
                    },
                    data => resolve(data),
                    e => reject(e));
        });
    }

}
