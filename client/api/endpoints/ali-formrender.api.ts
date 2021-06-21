import {KubeApi} from "../kube-api";
import {KubeObject} from "../kube-object";

export class FormRenderApi extends KubeApi<FormRender> {
    getFormRenderSpec(params: {namespace: string, name: string}) {
        return this.request.get(this.getUrl(params))
    }
}

export class FormRender extends KubeObject {
    static kind: "FormRender"
}

export const formRenderApi = new FormRenderApi({
    kind: FormRender.kind,
    apiBase: "apis/yamecloud.io/v1/formrenders",
    isNamespaced: true,
    objectConstructor: FormRender
})