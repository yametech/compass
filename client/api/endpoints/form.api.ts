import {KubeObject} from "../kube-object";
import {KubeApi} from "../kube-api";
import {autobind} from "../../utils";

export interface DataNode {
    title: string
    key: string
    node_type: string
    children: DataNode[]
}


@autobind()
export class Form extends KubeObject {
    static kind = "Form";

    spec: {
        tree: DataNode[],
        props_schema: string
    }
}

export const formApi = new KubeApi({
    kind: Form.kind,
    apiBase: "/apis/yamecloud.io/v1/forms",
    isNamespaced: true,
    objectConstructor: Form,
});
