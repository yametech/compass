import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { apiWorkloads } from "../index";

export class PodMetrics extends KubeObject {
  timestamp: string
  window: string
  containers: {
    name: string;
    usage: {
      cpu: string;
      memory: string;
    };
  }[]
}

export const podMetricsApi = new KubeApi({
  kind: PodMetrics.kind,
  apiBase: "/apis/metrics.k8s.io/v1beta1/pods",
  isNamespaced: true,
  objectConstructor: PodMetrics,
  request: apiWorkloads,
});
