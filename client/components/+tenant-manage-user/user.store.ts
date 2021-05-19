import {autobind} from "../../utils";
import {KubeObjectStore} from "../../kube-object.store";
import {TenantUser, tenantUserApi} from "../../api/endpoints";
import {apiManager} from "../../api/api-manager";

@autobind()
export class TenantUserStore extends KubeObjectStore<TenantUser> {
  api = tenantUserApi
}

export const tenantUserStore = new TenantUserStore();
apiManager.registerStore(tenantUserApi, tenantUserStore);
