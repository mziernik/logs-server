import Repository, {RepoError} from "./Repository";
import Column from "./Column";

export default class RepoTree {

    repo: Repository;
    root: RepoTree;
    parent: RepoTree;
    children: RepoTree[] = [];
    row: [];
    primaryKey: any;
    parentKey: any;

    constructor(repo: Repository) {
        this.repo = repo;
    }

    static create(repo: Repository, parentColumn: Column): RepoTree {

        const map: Map = new Map();

        const idx = repo.getColumnIndex(parentColumn);
        const pkIdx: number = repo.columns.indexOf(repo.primaryKeyColumn);

        const root = new RepoTree(repo);
        root.root = root;

        repo.rows.forEach((row: []) => {
            const r: RepoTree = new RepoTree(repo);
            r.primaryKey = row[pkIdx];
            r.parentKey = row[idx];
            r.row = row;
            map.set(r.primaryKey, r);
        });


        map.forEach((rt: RepoTree) => {
            if (rt.parentKey === null || rt.parentKey === undefined) {
                root.add(rt);
                return;
            }

            const parent: RepoTree = map.get(rt.parentKey);
            if (!parent) throw new RepoError(this, "Nie znaleziono rodzica dla " + rt.parentKey);

            parent.add(rt);
        });

        return root;
    }

    add(child: RepoTree) {
        if (child.parent)
            child.parent.children.remove(child);
        child.parent = this;
        this.children.push(child);
    }

    get(column: Column): any {
        return this.row[this.repo.getColumnIndex(column)];
    }
}
