import {autobind} from "../../utils";
import {KubeObjectStore} from "../../kube-object.store";
import {apiManager} from "../../api/api-manager";
import {SubNet, subNetApi} from "../../api/endpoints/subnet.api";

@autobind()
export class SubNetStore extends KubeObjectStore<SubNet> {
    api = subNetApi
}

export const subNetStore = new SubNetStore();
apiManager.registerStore(subNetApi, subNetStore);