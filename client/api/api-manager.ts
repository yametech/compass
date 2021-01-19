import React from "react";
import {observable} from "mobx";
import {autobind} from "../utils/autobind";
import {KubeApi} from "./kube-api";
import {KubeObjectStore} from "../kube-object.store";
import {KubeObjectDetailsProps, KubeObjectListLayoutProps, KubeObjectMenuProps} from "../components/kube-object";

export interface ApiComponents {
    List?: React.ComponentType<KubeObjectListLayoutProps>;
    Menu?: React.ComponentType<KubeObjectMenuProps>;
    Details?: React.ComponentType<KubeObjectDetailsProps>;
}

@autobind()
export class ApiManager {
    private apis = observable.map<string, KubeApi>();
    private stores = observable.map<KubeApi, KubeObjectStore>();
    private views = observable.map<KubeApi, ApiComponents>();

    getApi(pathOrCallback: string | ((api: KubeApi) => boolean)) {
        const apis = this.apis;
        if (typeof pathOrCallback === "string") {
            let api = apis.get(pathOrCallback);
            if (!api) {
                const {apiBase} = KubeApi.parseApi(pathOrCallback);
                api = apis.get(apiBase);
            }
            return api;
        } else {
            return Array.from(apis.values()).find(pathOrCallback);
        }
    }

    registerApi(apiBase: string, api: KubeApi) {
        if (this.apis.has(apiBase)) return;
        this.apis.set(apiBase, api);
    }

    protected resolveApi(api: string | KubeApi): KubeApi {
        if (typeof api === "string") return this.getApi(api)
        return api;
    }

    unregisterApi(api: string | KubeApi) {
        if (typeof api === "string") this.apis.delete(api);
        else {
            const apis = Array.from(this.apis.entries());
            const entry = apis.find(entry => entry[1] === api);
            if (entry) this.unregisterApi(entry[0]);
        }
    }

    registerStore(api: KubeApi, store: KubeObjectStore) {
        this.stores.set(api, store);
    }

    getStore(api: string | KubeApi): KubeObjectStore {
        return this.stores.get(this.resolveApi(api));
    }

    registerViews(api: KubeApi | KubeApi[], views: ApiComponents) {
        if (Array.isArray(api)) {
            api.forEach(api => this.registerViews(api, views));
            return;
        }
        const currentViews = this.views.get(api) || {};
        this.views.set(api, {
            ...currentViews,
            ...views,
        });
    }

    getViews(api: string | KubeApi): ApiComponents {
        return this.views.get(this.resolveApi(api)) || {}
    }
}

export const apiManager = new ApiManager();
