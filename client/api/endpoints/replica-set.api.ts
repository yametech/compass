import get from "lodash/get";
import { autobind } from "../../utils";
import { IAffinity, WorkloadKubeObject } from "../workload-kube-object";
import { IPodContainer } from "./pods.api";
import { KubeApi } from "../kube-api";
import { apiWorkloads } from "../index";

@autobind()
export class ReplicaSet extends WorkloadKubeObject {
  static kind = "ReplicaSet"

  spec: {
    replicas?: number;
    selector?: {
      matchLabels: {
        [key: string]: string;
      };
    };
    containers?: IPodContainer[];
    template?: {
      spec?: {
        affinity?: IAffinity;
        nodeSelector?: {
          [selector: string]: string;
        };
        tolerations: {
          key: string;
          operator: string;
          effect: string;
          tolerationSeconds: number;
        }[];
        containers: IPodContainer[];
      };
    };
    restartPolicy?: string;
    terminationGracePeriodSeconds?: number;
    dnsPolicy?: string;
    schedulerName?: string;
  }
  status: {
    replicas: number;
    fullyLabeledReplicas: number;
    readyReplicas: number;
    availableReplicas: number;
    observedGeneration: number;
  }

  getImages() {
    const containers: IPodContainer[] = get(this, "spec.template.spec.containers", [])
    return [...containers].map(container => container.image)
  }
}

export const replicaSetApi = new KubeApi({
  kind: ReplicaSet.kind,
  apiBase: "/apis/apps/v1/replicasets",
  isNamespaced: true,
  objectConstructor: ReplicaSet,
  request: apiWorkloads,
});
