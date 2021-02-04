import {KubeObject} from "../kube-object";
import {KubeApi} from "../kube-api";
import {autobind} from "../../utils";
import {apiTenant} from "../index"
import {Namespace} from "./namespaces.api";

export interface Stack {
  address: string
  verification?: string
  token?: string
  user?: string
  password?: string
}

export interface TenantDepartmentSpec {
  tenant_id: string
  owner?: string
  namespaces: Namespace[];
  // defaultNamespace: string;
  gits?: Stack[];
  registers?: Stack[];
}

@autobind()
export class TenantDepartment extends KubeObject {
  static kind = "BaseDepartment";

  spec: TenantDepartmentSpec
}

export const tenantDepartmentApi = new KubeApi({
  kind: TenantDepartment.kind,
  apiBase: "/apis/yamecloud.io/v1/basedepartments",
  isNamespaced: true,
  objectConstructor: TenantDepartment,
  request: apiTenant
});
