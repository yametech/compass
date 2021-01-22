import {autobind} from "../../utils";
import {KubeObject} from "../kube-object";
import {KubeApi} from "../kube-api";
import {ParamSpec} from "./tekton-pipeline.api";
import {apiTekton} from "../index";

// ResourceDeclaration defines an input or output PipelineResource declared as a requirement
// by another type such as a Task or Condition. The Name field will be used to refer to these
// PipelineResources within the type's definition, and when provided as an Input, the Name will be the
// path to the volume mounted containing this PipelineResource as an input (e.g.
// an input Resource named `workspace` will be mounted at `/workspace`).
export interface ResourceDeclaration {
  // Name declares the name by which a resource is referenced in the
  // definition. Resources may be referenced by name in the definition of a
  // Task's steps.
  name: string;
  // Type is the type of this resource;
  type: string;
  // Description is a user-facing description of the declared resource that may be
  // used to populate a UI.
  // +optional
  description?: string;
  // TargetPath is the path in workspace directory where the resource
  // will be copied.
  // +optional
  targetPath?: string;
  // Optional declares the resource as optional.
  // By default optional is set to false which makes a resource required.
  // optional: true - the resource is considered optional
  // optional: false - the resource is considered required (equivalent of not specifying it)
  optional?: boolean;
}

// TaskResource defines an input or output Resource declared as a requirement
// by a Task. The Name field will be used to refer to these Resources within
// the Task definition, and when provided as an Input, the Name will be the
// path to the volume mounted containing this Resource as an input (e.g.
// an input Resource named `workspace` will be mounted at `/workspace`).
export interface TaskResource extends ResourceDeclaration {}

export interface Inputs {
  // Resources is a list of the input resources required to run the task.
  // Resources are represented in TaskRuns as bindings to instances of
  // PipelineResources.
  resources?: TaskResource[];
  // Params is a list of input parameters required to run the task. Params
  // must be supplied as inputs in TaskRuns unless they declare a default
  // value.
  params?: ParamSpec[];
}

export interface Outputs {
  results?: {
    // Name declares the name by which a result is referenced in the Task's
    // definition. Results may be referenced by name in the definition of a
    // Task's steps.
    name: string;
    // TODO: maybe this is an enum with types like "go test", "junit", etc.
    format?: string;
    path?: string;
  }[];
  resources?: TaskResource[];
}

export interface PipelineParams {
  name: string;
  type?: string;
  description?: string;
  default?: string;
}

export interface EnvVar {
  name: string;
  value?: string;
  //todo:so complex and optional,and then will support it.
  valaueFrom?: any;
}

// TaskResources allows a Pipeline to declare how its DeclaredPipelineResources
// should be provided to a Task as its inputs and outputs.
export interface TaskResources {
  // Inputs holds the mapping from the PipelineResources declared in
  // DeclaredPipelineResources to the input PipelineResources required by the Task.
  inputs: TaskResource[];
  // Outputs holds the mapping from the PipelineResources declared in
  // DeclaredPipelineResources to the input PipelineResources required by the Task.
  outputs: TaskResource[];
}

export interface TaskStep {
  name: string;
  image: string;
  args: string[];
  command: string[];
  env: EnvVar[];
  // workspaces?: WorkspaceDeclaration[];
  workingDir: string;
  // results: Result[];
  script: string;
}

// WorkspaceDeclaration is a declaration of a volume that a Task requires.
export interface WorkspaceDeclaration {
  name: string;
  description?: string;
  mountPath?: string;
  readOnly?: boolean;
}

export interface VolumeMount {
  name: string;
  mountPath: string;
}

export interface Result {
  name: string;
  description: string;
}

export interface Params {
  name: string;
  value: string;
}

export interface Volume {
  name: string;
  emptyDir: any;
}

export interface TaskSpec {
  params?: PipelineParams[];
  resources?: TaskResources;
  description?: string;
  inputs?: Inputs;
  outputs?: Outputs;
  steps: TaskStep[];
  volumes?: Volume[];
  workspaces?: WorkspaceDeclaration[];
  //----The following types are not supported now
  stepTemplate?: any;
  sidecars?: any;
  results?: any;
  //----The following types are not supported now
}

const taskInput: TaskResource[] = [];

const taskResource: TaskResources = {
  inputs: taskInput,
  outputs: taskInput,
};

const inputs: Inputs = {
  resources: [],
  params: [],
};

const outputs: Outputs = {
  resources: [],
  results: [],
};

@autobind()
export class Task extends KubeObject {
  static kind = "Task";
  spec: TaskSpec;

  getOwnerNamespace(): string {
    if (this.metadata.labels == undefined) {
      return "";
    }
    return this.metadata.labels.namespace != undefined
      ? this.metadata.labels.namespace
      : "";
  }

  getResources(): TaskResources {
    if (this.spec.resources === undefined) {
      return taskResource;
    }

    if (this.spec.resources.inputs === undefined) {
      this.spec.resources.inputs = [];
    }
    if (this.spec.resources.outputs === undefined) {
      this.spec.resources.outputs = [];
    }

    return this.spec.resources;
  }

  getParams(): PipelineParams[] {
    return this.spec.params || [];
  }

  getInputs(): Inputs {
    return this.spec.inputs || inputs;
  }

  getOutputs(): Outputs {
    return this.spec.outputs || outputs;
  }

  getSteps(): TaskStep[] {
    if (this.spec.steps === undefined) {
      return [];
    }
    this.spec.steps.map((item, index) => {
      if (item.args === undefined) {
        this.spec.steps[index].args = [];
      }
      if (item.command === undefined) {
        this.spec.steps[index].command = [];
      }
      if (item.env === undefined) {
        this.spec.steps[index].env = [];
      }
      if (item.image == undefined) {
        this.spec.steps[index].image = "";
      }
      if (item.name == undefined) {
        this.spec.steps[index].name = "";
      }
      if (item.script == undefined) {
        this.spec.steps[index].script = "";
      }
      if (item.workingDir === undefined) {
        this.spec.steps[index].workingDir = "";
      }
    });
    return this.spec.steps;
  }

  getVolumes(): Volume[] {
    return this.spec.volumes || [];
  }

  getWorkspaces(): WorkspaceDeclaration[] {
    return this.spec.workspaces || [];
  }
}

export const taskApi = new KubeApi({
  kind: Task.kind,
  apiBase: "/apis/tekton.dev/v1alpha1/tasks",
  isNamespaced: true,
  objectConstructor: Task,
  request: apiTekton,
});
