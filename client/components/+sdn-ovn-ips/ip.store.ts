import { autobind } from "../../utils";
import { KubeObjectStore } from "../../kube-object.store";
import { apiManager } from "../../api/api-manager";
import { IP, ipApi } from "../../api/endpoints/ip.api";

@autobind()
export class IPStore extends KubeObjectStore<IP> {
    api = ipApi
}

export const ipStore = new IPStore();
apiManager.registerStore(ipApi, ipStore);