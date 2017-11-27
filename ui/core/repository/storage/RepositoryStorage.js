import {Utils, Record, Field, Repository, CRUDE, Dev, AppStatus} from "../../core";
import Alert from "../../component/alert/Alert";


export default class RepositoryStorage {


    /** Wczytaj zawartość repozytoriów */
    load(repos: Repository[]): Promise {
        throw new Error("Unsupported operation");
    }

    /** zapis danych - submit */
    save(context: any, records: Record[]): Promise {
        throw new Error("Unsupported operation");
    }

    /** Wczytaj dane rekordów (na potrzeby danych typu onDemand) */
    read(records: Record[]): Promise {
        throw new Error("Unsupported operation");
    }

    action(repo: Repository, name: string, pk: any, params: object): Promise {
        throw new Error("Unsupported operation");
    }

    /** Wczytaj wszystkie repozytoria */
    static loadData() {
        const map: Map = Utils.agregate(Repository.all, (repo: Repository) => repo.storage);
        map.forEach((repos: Repository[], storage: RepositoryStorage) => {
                const p: Promise = storage.load(repos);
                p && p.then(data => {
                    try {
                        Repository.update(storage, data);
                    } catch (e) {
                        Dev.error(this, e);
                        AppStatus.error(this, e);
                    }
                }).catch(e => {
                    Alert.error(RepositoryStorage, e)
                })

            }
        );
    }

}