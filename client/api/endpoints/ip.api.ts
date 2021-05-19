import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { apiSDN } from "../index"; 


export class IP extends KubeObject {
    static kind = "Ip";
    spec: {
        namespace: string,
        ipAddress: string
        macAddress: string
        nodeName: string
    }
}

export const ipApi = new KubeApi({
    kind: IP.kind,
    apiBase: "/apis/kubeovn.io/v1/ips",
    isNamespaced: false,
    objectConstructor: IP,
    request: apiSDN,
});
