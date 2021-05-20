import { KubeObject } from "../kube-object";
import { KubeJsonApiData } from "../kube-json-api";
import { autobind } from "../../utils";
import { KubeApi } from "../kube-api";
import { apiBase, apiWorkloads, apiTekton } from "..";

export enum SecretType {
  Opaque = "Opaque",
  ServiceAccountToken = "kubernetes.io/service-account-token",
  Dockercfg = "kubernetes.io/dockercfg",
  DockerConfigJson = "kubernetes.io/dockerconfigjson",
  BasicAuth = "kubernetes.io/basic-auth",
  SSHAuth = "kubernetes.io/ssh-auth",
  TLS = "kubernetes.io/tls",
  BootstrapToken = "bootstrap.kubernetes.io/token",
  CephProvisioner = "kubernetes.io/rbd"
}

export interface ISecretRef {
  key?: string;
  name: string;
}

@autobind()
export class Secret extends KubeObject {
  static kind = "Secret"

  type: SecretType;
  data: {
    [prop: string]: string;
    token?: string;
  }

  constructor(data: KubeJsonApiData) {
    super(data);
    this.data = this.data || {};
  }

  setData(data: { [prop: string]: string; token?: string; }) {
    this.data = data;
  }

  getKeys(): string[] {
    return Object.keys(this.data);
  }

  getToken() {
    return this.data.token;
  }

  getHide() {
    return this.getLabels().map(label => { if (label.split("=")[0] == "hide") return true }) || false
  }
}

export const secretsApi = new KubeApi({
  kind: Secret.kind,
  apiBase: "/api/v1/secrets",
  isNamespaced: true,
  objectConstructor: Secret,
  request: apiWorkloads,
});


export const tektonConfigApi = new KubeApi({
  kind: Secret.kind,
  apiBase: "/api/v1/tektonconfig",
  isNamespaced: true,
  objectConstructor: Secret,
  request: apiTekton,
});
