import {KubeObject} from "../kube-object";
import {KubeApi} from "../kube-api";
import {autobind} from "../../utils";


export interface LooseObject {
    [key: string]: any
}

@autobind()
export class Field extends KubeObject {
    static kind = "Field";

    spec: {
        field_type: string;
        form_data_config: string;
        props_schema?: string;
    }
}

export const fieldApi = new KubeApi({
    kind: Field.kind,
    apiBase: "/apis/yamecloud.io/v1/fields",
    isNamespaced: true,
    objectConstructor: Field,
});
