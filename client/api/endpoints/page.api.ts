import {KubeObject} from "../kube-object";
import {KubeApi} from "../kube-api";


export class Page extends KubeObject {
    static kind = "Page";

    spec: {
        tree: string
    }
}

export const pageApi = new KubeApi({
    kind: Page.kind,
    apiBase: "/apis/yamecloud.io/v1/pages",
    isNamespaced: true,
    objectConstructor: Page,
});
