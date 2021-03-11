import {KubeObject} from "../kube-object";
import {KubeApi} from "../kube-api";
import {autobind} from "../../utils";
import {apiTenant} from "../index";

@autobind()
export class Tenant extends KubeObject {
    static kind = "BaseTenant";

    spec: {
        name: string
        owner: string
        namespaces?: string[]
    }
}

export const tenantApi = new KubeApi({
    kind: Tenant.kind,
    apiBase: "/apis/yamecloud.io/v1/basetenants",
    isNamespaced: true,
    objectConstructor: Tenant,
    request: apiTenant
});