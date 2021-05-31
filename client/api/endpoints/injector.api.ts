import get from "lodash/get";
import { IPodContainer } from "./pods.api";
import { WorkloadKubeObject } from "../workload-kube-object";
import { autobind } from "../../utils";
import { KubeApi } from "../kube-api";
import { apiWorkloadPlus } from "../index";

@autobind()
export class Injector extends WorkloadKubeObject {
  static kind = "Injector"

  spec: {
    namespace: string;
    name: string;

    preContainers: {
      args: string[];
      image: string;
      name: string;
      resources: {};
      volumeMounts: {
        mountPath: string;
        name: string;
      }[];
    }[];

    postContainers: {
      args: string[];
      image: string;
      name: string;
      resources: {};
      volumeMounts: {
        mountPath: string;
        name: string;
      }[];
    }[];

    volumes: {
      emptyDir: string;
      name: string;
    }[];

    selector: {
      matchLabels: {
        app: string;
      };
    };
  };

  status: {};

  getPreContainer() {
    const containers: IPodContainer[] = get(this, "spec.preContainers", [])
    return [...containers].map(container => container.image)
  }

  getPostContainer() {
    const containers: IPodContainer[] = get(this, "spec.postContainers", [])
    return [...containers].map(container => container.image)
  }
}

export const injectorApi = new KubeApi({
  kind: Injector.kind,
  apiBase: "/apis/nuwa.nip.io/v1/injectors",
  isNamespaced: true,
  objectConstructor: Injector,
  request: apiWorkloadPlus,
});
