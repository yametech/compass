import { autobind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { ParamSpec } from "./tekton-pipeline.api";
import { Inputs, Outputs, TaskSpec } from "./tekton-task.api";
import { TaskRef } from "./tekton-pipeline.api";
import {
  PipelineRef,
  PipelineResourceBinding,
  PodTemplate,
} from "./tekton-pipelinerun.api";
import {apiTekton} from "../index";

export interface Conditions {
  type: string;
  status: string;
  severity?: string;
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

export interface Status {
  observedGeneration?: number;
  conditions?: Conditions[];
}

export interface ContainerState {
  waiting?: {
    reason?: string;
    message?: string;
  };
  running?: {
    startedAt?: number;
  };
  terminated?: {
    exitCode?: number;
    signal?: number;
    reason?: number;
    message?: number;
    startedAt?: number;
    finishedAt?: number;
    containerID?: string;
  };
}

export interface StepState extends ContainerState {
  name: string;
  container: string;
  imageID: string;
}

export interface CloudEventDeliveryState {
  condition: string;
  sentAt?: number;
  message: string;
  retryCount: number;
}

export interface CloudEventDelivery {
  target: string;
  status: CloudEventDeliveryState;
}

export interface TaskRunStatus extends TaskRunStatusFields, Status {
  // observedGeneration?: number
  // conditions?: Conditions
}

export interface TaskRunResult {
  name: string;
  value: string;
}

export interface PipelineResourceResult {
  key: string;
  value: string;
  resourceRef: PipelineRef;
  type: string;
}

export interface SidecarState extends ContainerState {
  name: string;
  container: string;
  imageID: string;
}

export interface TaskRunStatusFields {
  podName: string;
  startTime?: string;
  completionTime?: string;
  steps?: StepState[];
  cloudEvents?: CloudEventDelivery[];
  retriesStatus?: TaskRunStatus[];
  resourcesResult?: PipelineResourceResult[];
  taskResults?: TaskRunResult[];
  sidecars?: SidecarState;
}

export interface TaskResourceBinding {
  PipelineResourceBinding: PipelineResourceBinding;
  paths: string[];
}

export interface TaskRunResources {
  inputs?: TaskResourceBinding[];
  outputs?: TaskResourceBinding[];
}

export interface TaskRunSpec {
  params?: ParamSpec[];
  resources?: TaskRunResources;
  serviceAccountName: string;
  taskRef?: TaskRef;
  taskSpec?: TaskSpec;
  status: string;
  podTemplate: PodTemplate;
  workspaces?: any[];
  timeout?: number;
  inputs?: Inputs;
  outputs?: Outputs;
}

export enum TaskRunStatusReason {
  Pending = "Pending",
  Failed = "Failed",
  Running = "Running",
  Succeeded = "Succeeded",
  Cancel = "Cancel",
  Timeout = "Timeout",
}

@autobind()
export class TaskRun extends KubeObject {
  static kind = "TaskRun";

  spec: TaskRunSpec;
  status: TaskRunStatus;

  getServiceAccountName(): string {
    return this.spec.serviceAccountName || "";
  }

  getInputsResource() {
    return this.spec.inputs.resources || [];
  }

  getOutputsResource() {
    return this.spec.outputs.resources || [];
  }

  getOwnerNamespace(): string {
    if (this.metadata.labels == undefined) {
      return "";
    }
    return this.metadata.labels.namespace != undefined
      ? this.metadata.labels.namespace
      : "";
  }

  getStatus(): string {
    const conditions = this?.status?.conditions;
    if (conditions === undefined) return "";
    if (conditions[0].reason == undefined) return "";
    return conditions[0].reason;
  }

  getSteps() {
    if (this.status == undefined) {
      return [];
    }
    return this.status.steps != undefined ? this.status.steps : [];
  }

  getContainerName() {
    if (this?.status == undefined) {
      return [];
    }
    if (this?.status?.steps !== undefined) {
      let containerNames: string[] = [];
      this?.status?.steps?.map((item) => {
        containerNames.push(item.container);
      });
      return containerNames;
    } else {
      return [];
    }
  }

  getPodName() {
    if (this.status == undefined) {
      return "";
    }

    if (this.status.podName == undefined) {
      return "";
    }
    return this.status.podName;
  }
}

export const taskRunApi = new KubeApi({
  kind: TaskRun.kind,
  apiBase: "/apis/tekton.dev/v1alpha1/taskruns",
  isNamespaced: true,
  objectConstructor: TaskRun,
  request: apiTekton,
});
