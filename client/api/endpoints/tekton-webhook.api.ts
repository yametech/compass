import {autobind} from "../../utils";
import {KubeObject} from "../kube-object";
import {KubeApi} from "../kube-api";
import {Params} from "../../components/+tekton-common";
import {apiTekton} from "../index";

export interface Job {
  branch: string;
  pipeline_run: string;
  params: Params[];
}

export const job: Job = {
  branch: "",
  pipeline_run: "",
  params: [],
}

@autobind()
export class TektonWebHook extends KubeObject {
  static kind = "TektonWebHook";

  spec: {
    secret: string;
    git: string;
    jobs: Job[];
  };

}

export const tektonWebHookApi = new KubeApi({
  kind: TektonWebHook.kind,
  apiBase: "/apis/fuxi.nip.io/v1/tektonwebhooks",
  isNamespaced: true,
  objectConstructor: TektonWebHook,
  request: apiTekton,
});