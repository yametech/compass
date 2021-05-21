import get from "lodash/get";
import { IPodContainer } from "./pods.api";
import { IAffinity, WorkloadKubeObject } from "../workload-kube-object";
import { autobind } from "../../utils";
import { KubeApi } from "../kube-api";
import { apiWorkloadPlus } from "../index";

@autobind()
export class EnhanceStatefulSet extends WorkloadKubeObject {
  getStatus() {
    return get(this, "spec.status.replicas")
  }

  static kind = "StatefulSet"
  spec: {
    serviceName: string;
    replicas: number;
    selector: {
      matchLabels: {
        [key: string]: string;
      };
    };
    template: {
      metadata: {
        labels: {
          app: string;
          annotations: {
            [key: string]: string;
          };
        };
      };
      spec: {
        containers: {
          name: string;
          image: string;
          ports: {
            containerPort: number;
            name: string;
          }[];
          volumeMounts: {
            name: string;
            mountPath: string;
          }[];
        }[];
        affinity?: IAffinity;
        nodeSelector?: {
          [selector: string]: string;
        };
        tolerations?: {
          key: string;
          operator: string;
          effect: string;
          tolerationSeconds: number;
        }[];
      };
    };
    volumeClaimTemplates: {
      metadata: {
        name: string;
        annotations: {
          [key: string]: string;
        };
      };
      spec: {
        accessModes: string[];
        resources: {
          requests: {
            storage: string;
          };
        };
      };
    }[];
  }
  podManagementPolicy: string;
  updateStrategy: {
    type: string;
    rollingUpdate: {
      podUpdatePolicy: string;
      maxUnavailable: number;
      partition: number;
    };
  }
  status: {
    observedGeneration: number;
    replicas: number;
    currentReplicas: number;
    currentRevision: string;
    updateRevision: string;
    collisionCount: number;
  }

  getImages() {
    const containers: IPodContainer[] = get(this, "spec.template.spec.containers", [])
    return [...containers].map(container => container.image)
  }

  getReplicaUpdate() {
    return get(this, "spec.status.updateRevision")
  }

}

export const enhanceStatefulSetApi = new KubeApi({
  kind: EnhanceStatefulSet.kind,
  apiBase: "/apis/nuwa.nip.io/v1/statefulsets",
  isNamespaced: true,
  objectConstructor: EnhanceStatefulSet,
  request: apiWorkloadPlus,
});
