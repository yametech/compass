import {KubeObject} from "../kube-object";
import {KubeApi} from "../kube-api";
import {autobind} from "../../utils";
import {apiTenant} from "../index";

@autobind()
export class TenantRole extends KubeObject {
    static kind = "BaseRole";

    // constructor(data: KubeJsonApiData) {
    //     super(data);
    //     apiPermission.get("/permission_transfer/" + this.spec.value).then((data: string[]) => this.permissions = data)
    // }

    spec: {
        tenant_id?: string
        department_id?: string
        namespaces?: string[]
        privilege?: object
        comment?: string
    }
    permissions?: string[]
}

export const tenantRoleApi = new KubeApi({
    kind: TenantRole.kind,
    apiBase: "/apis/yamecloud.io/v1/baseroles",
    isNamespaced: true,
    objectConstructor: TenantRole,
    request: apiTenant
});

