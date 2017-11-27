/**
 * Klasa definiuje metody zewnętrznego API
 */

import WebApi from "../webapi/WebApi";
import {EError, Repository, Check, Field, Record, Is, CRUDE, Dev} from "../core";
import WebApiResponse from "../webapi/Response";
import Alert from "../component/alert/Alert";
import WebApiRequest from "../webapi/Request";
import {BinaryData, UploadData} from "../repository/Type";

type OnSuccess = (data: ?any, response: WebApiResponse) => void;
type OnError = (error: Object, response: WebApiResponse) => void;

let api;
let wApi: WebApi;
let methods;


export default class API {

    static get instance(): Object {
        return api;
    }

    static get wepApi(): WebApi {
        return wApi;
    }

    static doUploadFile(field: Field, data: UploadData, onSuccess: OnSuccess, onError: OnError) {

        data.uploaded = false;
        field.error = null;

        return new Promise((resolve: () => void, reject: () => void) => {

            fetch(data.href, {
                method: 'POST',
                //      mode: "no-cors",
                headers: {
                    "Content-Type": data.file.type,
                    "X-Requested-With": "XMLHttpRequest",
                    "X-Request-Id": data.id
                },
                body: data.file
            }).then((response: Response) => {
                    if (!response.ok)
                        throw new Error(response.statusText || "Błąd wysyłania pliku");

                    data.uploaded = true;
                    resolve(response);
                    if (onSuccess)
                        onSuccess(data);
                }
            ).catch(error => {
                    field.error = error;
                    Dev.error(this, error);
                    reject(error);
                    if (onError)
                        onError(error);
                }
            )

        });
    }

    static uploadFile(field: Field, input: HTMLInputElement, onSuccess: OnSuccess, onError: OnError): WebApiRequest {
        if (!methods || !field || !input || !input.files[0]) return;
        const bdata: BinaryData = field.value;
        const rec: Record = Check.instanceOf(field.record, [Record], new Error("Pole nie posiada przypisanego rekordu"));

        const file: File = input.files[0];

        return methods.uploadFile({
            repo: rec.repo.key,
            pk: rec.action !== CRUDE.CREATE ? rec.pk : null,
            column: field.key,
            name: file.name,
            size: file.size
        }, (obj, resp) => {

            const upload: UploadData = field.value = new UploadData(file, obj);

            if (upload.now) {
                API.doUploadFile(field, upload, onSuccess, onError);
                return;
            }

            if (onSuccess)
                onSuccess(upload, resp);

        }, onError);
    }

    static downloadFile(field: Field, onSuccess: OnSuccess, onError: OnError): WebApiRequest {
        if (!methods || !field) return;

        const bdata: BinaryData = field.value;


        const rec: Record = Check.instanceOf(field.record, [Record], new Error("Pole nie posiada przypisanego rekordu"));
        return methods.downloadFile({
            repo: rec.repo.key,
            pk: rec.action !== CRUDE.CREATE ? rec.pk : null,
            column: field.key,
            id: bdata ? bdata.id : null
        }, (obj, resp) => {

            const data: BinaryData = new BinaryData(obj);

            if (onSuccess) {
                onSuccess(data, resp);
                return;
            }

            if (data.preview || (bdata && bdata.preview)) {
                window.open(data.href).focus();
                return;
            }

            const link = document.createElement("a");
            link.download = data.name || (bdata && bdata.name) || field.name;
            link.href = data.href;
            link.click();
        }, onError);


    }


    static repoList(onSuccess: OnSuccess, onError: OnError): WebApiRequest {
        return methods ? methods.list(onSuccess, onError) : null;
    }

    static repoGet(data: Object, onSuccess: OnSuccess, onError: OnError): WebApiRequest {
        return methods ? methods.get(data, onSuccess, onError) : null;
    }

    static repoAction(data: Object, onSuccess: OnSuccess, onError: OnError): WebApiRequest {
        return methods ? methods.action(data, onSuccess, onError) : null;
    }

    static repoEdit(data: Object, onSuccess: OnSuccess, onError: OnError): WebApiRequest {
        return methods ? methods.edit(data, onSuccess, onError) : null;
    }

    static authorizeUser(login: string, password: string, onSuccess: OnSuccess, onError: OnError): WebApiRequest {
        if (!api) return;
        return api.login(login || "", password || "", onSuccess, onError);
    }

    static recordCallback(data: Object, onSuccess: OnSuccess, onError: OnError): WebApiRequest {
        return methods ? methods.recordCallback(data, onSuccess, onError) : null;
    }

    static set(_api, repoMethodsObject: Object) {
        api = _api;
        if (!api) return;
        wApi = Check.instanceOf(api.api, [WebApi]);

        methods = repoMethodsObject || _api;

        wApi.onError = (error: EError, response: WebApiResponse, handled: boolean) => {
            if (!handled)
                Alert.error(this, error.message);
        };

        wApi.onResponse.listen("API", obj => {
            switch (obj.type) {
                case "RepositoryUpdate":
                    Repository.update(obj.response, obj.data);
                    return;
            }
        });

    }

}