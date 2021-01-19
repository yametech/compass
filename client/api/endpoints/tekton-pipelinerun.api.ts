import {advanceFormatDuration, autobind} from "../../utils";
import {KubeObject} from "../kube-object";
import {KubeApi} from "../kube-api";
import {Param, PipelineSpec} from "./tekton-pipeline.api";
import {Params} from "./tekton-task.api";
import {PersistentVolumeClaimVolumeSource} from "./persistent-volume-claims.api";
import moment from "moment";
import {apiTekton} from "../index";

export interface PipelineRef {
  name: string;
  apiVersion?: string;
}

// PipelineResourceRef can be used to refer to a specific instance of a Resource
export interface PipelineResourceRef {
  name: string;
  apiVersion?: string;
}

export interface SecretParam {
  fieldName?: string;
  secretKey?: string;
  secretName?: string;
}

// PipelineResourceSpec defines  an individual resources used in the pipeline.
export interface PipelineResourceSpec {
  description?: string;
  type: string;
  params: Params[];
  secretParams?: SecretParam[];
}

// PipelineResourceBinding connects a reference to an instance of a PipelineResource
// with a PipelineResource dependency that the Pipeline has declared
export interface PipelineResourceBinding {
  name: string;
  resourceRef?: PipelineRef;
  resourceSpec?: PipelineResourceBinding;
}

export interface PodTemplate {
  nodeSelector?: Map<string, string>;
  tolerations?: Array<any>;
  affinity?: any;
  securityContext?: any;
  volumes?: {
    name: string;
    volumeSource: any;
  }[];
  runtimeClassName: string;
}

// PipelineRunSpecServiceAccountName can be used to configure specific
// ServiceAccountName for a concrete Task
export interface PipelineRunSpecServiceAccountName {
  taskName: string;
  ServiceAccountName: string;
}

// PipelineRunSpec defines the desired state of PipelineRun
export interface PipelineRunSpec {
  pipelineRef?: PipelineRef;
  pipelineSpec?: PipelineSpec;
  resources: PipelineResourceBinding[];
  params?: Param[];
  serviceAccountName?: string;
  serviceAccountNames?: PipelineRunSpecServiceAccountName[];
  status?: string;
  timeout?: string | number;
  podTemplate?: PodTemplate;
  workspaces?: WorkspaceBinding[];
}

export interface WorkspaceBinding {
  // Name is the name of the workspace populated by the volume.
  name: string;
  // SubPath is optionally a directory on the volume which should be used
  // for this binding (i.e. the volume will be mounted at this sub directory).
  // +optional
  subPath?: string;

  persistentVolumeClaim?: PersistentVolumeClaimVolumeSource;

  //not support it
  emptyDir?: any;
  configMap?: any;
  secret?: any;
}

export enum PipelineRunStatusReason {
  Completed = "Completed",
  Succeeded = "Succeeded",
  Pending = "Pending",
  Failed = "Failed",
  Running = "Running",
  PipelineRunCancelled = "PipelineRunCancelled",
  Timeout = "Timeout",
}

export interface TaskRunsReport {
  status: {
    conditions: { status: string; reason: string; message: string }[];
  };
}

@autobind()
export class PipelineRun extends KubeObject {
  static kind = "PipelineRun";

  params: {};

  spec: PipelineRunSpec;
  status: {
    observedGeneration: number;
    conditions?: any;
    startTime: number | string;
    completionTime: number | string;
    taskRuns: any;
  };

  getStartTime(): any {
    if (this.status?.startTime == undefined) {
      return "";
    }
    return this.status?.startTime || "";
  }

  getCompletionTime(): any {
    if (this.status?.completionTime == undefined) {
      return "";
    }
    return this.status?.completionTime || "";
  }

  getOwnerNamespace(): string {
    if (this.metadata.labels == undefined) {
      return "";
    }
    return this.metadata.labels.namespace != undefined
      ? this.metadata.labels.namespace
      : "";
  }

  getErrorReason(): string {
    if (this.status?.conditions == undefined || this.status?.conditions == {}) {
      return "";
    }
    return (
      this.status?.conditions.map(
        (item: { status: string; reason: string }) => {
          if (item.status == "False") {
            return item.reason;
          }
        }
      ) || ""
    );
  }

  hasIssues(): boolean {
    return this.getErrorReason() != "";
  }

  getTaskRuns(): any {
    if (this.status.taskRuns === undefined) return [];
    return this.status.taskRuns;
  }

  getTaskRunName(): string[] {
    return (
      Object.keys(this.getTaskRuns())
        .map((item: any) => {
          return item;
        })
        .slice() || []
    );
  }

  getAge(humanize = true, compact = true, fromNow = false) {
    if (fromNow) {
      return moment(this.metadata.creationTimestamp).fromNow();
    }
    const diff =
      new Date().getTime() -
      new Date(this.metadata.creationTimestamp).getTime();
    if (humanize) {
      return advanceFormatDuration(diff, compact);
    }
    return diff;
  }

  getStatus(): string {
    const conditions = this?.status?.conditions;
    if (conditions === undefined) return "";
    if (conditions[0].reason == undefined) return "";
    return conditions[0].reason;
  }

  getDuration(humanize = true, compact = true) {
    const defaultResult = "0 seconds";
    if (this.hasIssues()) return defaultResult;
    if (this?.status?.completionTime !== undefined) {
      const diff =
        new Date(this.status.completionTime).getTime() -
        new Date(this.metadata.creationTimestamp).getTime();
      if (humanize) {
        const result = advanceFormatDuration(diff, compact);
        return result;
      }
    }

    return defaultResult;
  }
}

export const pipelineRunApi = new KubeApi({
  kind: PipelineRun.kind,
  apiBase: "/apis/tekton.dev/v1alpha1/pipelineruns",
  isNamespaced: true,
  objectConstructor: PipelineRun,
  request: apiTekton,
});
