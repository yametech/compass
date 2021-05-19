import {autobind} from "../../utils";
import {KubeObjectStore} from "../../kube-object.store";
import {TenantDepartment, tenantDepartmentApi} from "../../api/endpoints";
import {apiManager} from "../../api/api-manager";

@autobind()
export class TenantDepartmentStore extends KubeObjectStore<TenantDepartment> {
  api = tenantDepartmentApi
}

export const tenantDepartmentStore = new TenantDepartmentStore();
apiManager.registerStore(tenantDepartmentApi, tenantDepartmentStore);