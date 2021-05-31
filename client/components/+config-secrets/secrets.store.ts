import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { Secret, tektonConfigApi, secretsApi } from "../../api/endpoints";
import { apiManager } from "../../api/api-manager";

@autobind()
export class SecretsStore extends KubeObjectStore<Secret> {
  api = secretsApi
}

export const secretsStore = new SecretsStore();
apiManager.registerStore(secretsApi, secretsStore);



@autobind()
export class TektonConfigStore extends KubeObjectStore<Secret> {
  api = tektonConfigApi
}

export const tektonConfigStore = new TektonConfigStore();
apiManager.registerStore(tektonConfigApi, tektonConfigStore);