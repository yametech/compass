import {KubeObject} from "../kube-object";
import {KubeApi} from "../kube-api";
import {autobind} from "../../utils";
import {apiTenant} from "../index";

@autobind()
export class TenantRoleUser extends KubeObject {
    static kind = "BaseRoleUsers";
}

export const tenantRoleUserApi = new KubeApi({
    kind: TenantRoleUser.kind,
    apiBase: "/apis/yamecloud.io/v1/baseroleusers",
    isNamespaced: true,
    objectConstructor: TenantRoleUser,
    request: apiTenant
});