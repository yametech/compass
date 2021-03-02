import {IClusterInfo} from "../common/cluster";

export interface IConfig extends Partial<IClusterInfo> {
  lensVersion?: string;
  lensTheme?: string;
  userName?: string;
  token?: string;
  allowedNamespaces?: string[];
  isClusterAdmin?: boolean;
  isTenantOwner?: boolean;
  chartsEnabled: boolean;
  kubectlAccess?: boolean;  // User accessed via kubectl-lens plugin
  defaultNamespace?: string;
}
