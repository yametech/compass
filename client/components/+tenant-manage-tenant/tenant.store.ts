import {autobind} from "../../utils";
import {KubeObjectStore} from "../../kube-object.store";
import {apiManager} from "../../api/api-manager";
import {Tenant, tenantApi} from "../../api/endpoints/tenant-tenant";

@autobind()
export class TenantStore extends KubeObjectStore<Tenant> {
  api = tenantApi
}

export const tenantStore = new TenantStore();
apiManager.registerStore(tenantApi, tenantStore);
