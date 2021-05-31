import {KubeObject} from "../kube-object";
import {KubeApi} from "../kube-api";
import {autobind} from "../../utils";
import {apiTenant} from "../index";

@autobind()
export class TenantUser extends KubeObject {
    static kind = "BaseUser";

    spec: {
        name: string,
        tenant_id: string
        department_id?: string,
        display?: string,
        email?: string,
        password: string
        roles?: string[]
        is_tenant_owner?: boolean
    }
}

export const tenantUserApi = new KubeApi({
    kind: TenantUser.kind,
    apiBase: "/apis/yamecloud.io/v1/baseusers",
    isNamespaced: false,
    objectConstructor: TenantUser,
    request: apiTenant
});