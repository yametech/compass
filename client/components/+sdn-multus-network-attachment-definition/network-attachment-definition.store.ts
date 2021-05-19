import { autobind } from "../../utils";
import { KubeObjectStore } from "../../kube-object.store";
import { apiManager } from "../../api/api-manager";
import {
  NetworkAttachmentDefinition,
  networkAttachmentDefinitionApi
} from "../../api/endpoints";

@autobind()
export class NetworkAttachmentDefinitionStore extends KubeObjectStore<NetworkAttachmentDefinition> {
  api = networkAttachmentDefinitionApi
}

export const networkAttachmentDefinitionStore = new NetworkAttachmentDefinitionStore();
apiManager.registerStore(networkAttachmentDefinitionApi, networkAttachmentDefinitionStore);