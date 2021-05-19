import { autobind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { apiSDN } from "../index";

export interface IPAM {
  type?: string,
  gateway?: string,
  subnet?: string,
  rangeStart?: string,
  rangeEnd?: string,
  routes?: {
    dst?: string
  }[],
  etcdConfig?: EtcdConfig,
}

export interface EtcdConfig {
  etcdURL?: string,
  etcdCertFile?: string,
  etcdKeyFile?: string,
  etcdTrustedCAFileFile?: string,
}

export interface Delroute {
  dst: string
}

export interface Addroute {
  dst?: string
  gw?: string
}

export interface Plugin {
  type?: string,
  master?: string,
  mode?: string,
  ipam?: IPAM,
  flushroutes?: boolean,
  delroutes?: Delroute[],
  addroutes?: Addroute[]
}

export interface NetworkAttachmentDefinitionConfig {
  cniVersion: string,
  name: string,
  plugins: Plugin[],
}

export const networkAttachmentDefinitionConfig: NetworkAttachmentDefinitionConfig = {
  cniVersion: "0.3.0",
  name: "",
  plugins: []
}

export const ipam: IPAM = {
  type: "host-local"
}

@autobind()
export class NetworkAttachmentDefinition extends KubeObject {
  static kind = "NetworkAttachmentDefinition";

  spec: {
    config: string
  }

  setConfig(n: NetworkAttachmentDefinitionConfig) {
    this.spec.config = JSON.stringify(n)
  }

  getConfig(): NetworkAttachmentDefinitionConfig {
    try {
      return JSON.parse(this.spec.config)
    } catch {
      return networkAttachmentDefinitionConfig
    }
  }
}

export const networkAttachmentDefinitionApi = new KubeApi({
  kind: NetworkAttachmentDefinition.kind,
  apiBase: "/apis/k8s.cni.cncf.io/v1/network-attachment-definitions",
  isNamespaced: true,
  objectConstructor: NetworkAttachmentDefinition,
  request: apiSDN,
});