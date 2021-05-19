import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { apiSDN } from "../index";


export class SubNet extends KubeObject {
    static kind = "Subnet";

    spec: {
        protocol: string,
        cidrBlock: string,
        gateway: string,
        namespaces: any[],
        excludeIps: string[],
        private?: boolean,
        allowSubnets?: string[],
        natOutgoing?: boolean,
        gatewayType?: string,
    }

    getNamespacesSliceString(): string {
        return Array.isArray(this.spec.namespaces) ? this.spec.namespaces.join() : this.spec.namespaces
    }
    getAllowSubnetsSliceString(): string {
        return Array.isArray(this.spec.allowSubnets) ? this.spec.allowSubnets.join() : this.spec.allowSubnets
    }
    getExcludeIPsSliceString(): string {
        return Array.isArray(this.spec.excludeIps) ? this.spec.excludeIps.join() : this.spec.excludeIps
    }
}

export const subNetApi = new KubeApi({
    kind: SubNet.kind,
    apiBase: "/apis/kubeovn.io/v1/subnets",
    isNamespaced: false,
    objectConstructor: SubNet,
    request: apiSDN,
});