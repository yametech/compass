import {autobind} from "../../utils";
import {KubeObjectStore} from "../../kube-object.store";
import {TenantRole, tenantRoleApi} from "../../api/endpoints";
import {apiManager} from "../../api/api-manager";

@autobind()
export class TenantRoleStore extends KubeObjectStore<TenantRole> {
  api = tenantRoleApi
}

export const tenantRoleStore = new TenantRoleStore();
apiManager.registerStore(tenantRoleApi, tenantRoleStore);
