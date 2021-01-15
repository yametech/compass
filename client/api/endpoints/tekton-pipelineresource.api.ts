import {autobind} from "../../utils";
import {KubeObject} from "../kube-object";
import {KubeApi} from "../kube-api";
import {PipelineResourceSpec} from "./tekton-pipelinerun.api";
import {apiTekton} from "../index";

@autobind()
export class PipelineResource extends KubeObject {
  static kind = "PipelineResource";
  spec: PipelineResourceSpec;

  getOwnerNamespace(): string {
    if (this.metadata.labels == undefined) { return "" }
    return this.metadata.labels.namespace != undefined ? this.metadata.labels.namespace : "";
  }
}

export const pipelineResourceApi = new KubeApi({
  kind: PipelineResource.kind,
  apiBase: "/apis/tekton.dev/v1alpha1/pipelineresources",
  isNamespaced: true,
  objectConstructor: PipelineResource,
  request: apiTekton,
});
