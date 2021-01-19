import {autobind} from "../../utils";
import {KubeObject} from "../kube-object";
import {KubeApi} from "../kube-api";
import {TaskSpec} from "./tekton-task.api";
import {apiTekton} from "../index";

export interface TaskRef {
  name: string;
  kind?: string;
  apiVersion?: string;
}

export interface ParamSpec {
  name: string;
  type?: string;
  description?: string;
  default?: string | Array<any>;
}

// PipelineTaskInputResource maps the name of a declared PipelineResource input
// dependency in a Task to the resource in the Pipeline's DeclaredPipelineResources
// that should be used. This input may come from a previous task.
export interface PipelineTaskInputResource {
  // Name is the name of the PipelineResource as declared by the Task.
  name: string;
  // Resource is the name of the DeclaredPipelineResource to use.
  resource: string;
  // From is the list of PipelineTask names that the resource has to come from.
  // (Implies an ordering in the execution graph.)
  // +optional
  from?: string[];
}

// PipelineTaskOutputResource maps the name of a declared PipelineResource output
// dependency in a Task to the resource in the Pipeline's DeclaredPipelineResources
// that should be used.
export interface PipelineTaskOutputResource {
  // Name is the name of the PipelineResource as declared by the Task.
  name: string;
  // Resource is the name of the DeclaredPipelineResource to use.
  resource: string;
}

// PipelineTaskResources allows a Pipeline to declare how its DeclaredPipelineResources
// should be provided to a Task as its inputs and outputs.
export interface PipelineTaskResources {
  inputs: PipelineTaskInputResource[];
  outputs: PipelineTaskOutputResource[];
}

// WorkspacePipelineTaskBinding describes how a workspace passed into the pipeline should be
// mapped to a task's declared workspace.
export interface WorkspacePipelineTaskBinding {
  // Name is the name of the workspace as declared by the task
  name: string;
  // Workspace is the name of the workspace declared by the pipeline
  workspace: string;
}

// PipelineTaskCondition allows a PipelineTask to declare a Condition to be evaluated before
// the Task is run.
export interface PipelineTaskCondition {
  conditionRef: string;
  params?: ParamSpec[];
  resources: PipelineTaskInputResource[];
}

export interface Param {
  name: string;
  value: string | Array<any>;
}

export interface PipelineTask {
  name: string;
  taskRef: TaskRef;
  runAfter: string[];
  taskSpec?: TaskSpec;
  retries: number;
  resources: PipelineTaskResources;
  params: Param[];
  timeout: string | number | any;
  workspaces?: WorkspacePipelineTaskBinding[];
  conditions?: PipelineTaskCondition;
}

// PipelineDeclaredResource is used by a Pipeline to declare the types of the
// PipelineResources that it will required to run and names which can be used to
// refer to these PipelineResources in PipelineTaskResourceBindings.
export interface PipelineDeclaredResource {
  name: string;
  type?: string;
  optional?: boolean;
}

// WorkspacePipelineDeclaration creates a named slot in a Pipeline that a PipelineRun
// is expected to populate with a workspace binding.
export interface WorkspacePipelineDeclaration {
  name: string;
  description?: string;
}

// PipelineSpec defines the desired state of Pipeline.
export interface PipelineSpec {
  // Description is a user-facing description of the pipeline that may be
  // used to populate a UI.
  // +optional
  description?: string;
  // Resources declares the names and types of the resources given to the
  // Pipeline's tasks as inputs and outputs.
  resources: PipelineDeclaredResource[];
  // Tasks declares the graph of Tasks that execute when this Pipeline is run.
  tasks: PipelineTask[];
  // Params declares a list of input parameters that must be supplied when
  // this Pipeline is run.
  params: ParamSpec[];
  // Workspaces declares a set of named workspaces that are expected to be
  // provided by a PipelineRun.
  // +optional
  workspaces?: WorkspacePipelineDeclaration[];
}

@autobind()
export class Pipeline extends KubeObject {
  static kind = "Pipeline";

  spec: PipelineSpec;
  status: {};

  constructor(data: any) {
    super(data);
  }

  getTasks(): PipelineTask[] {
    return this.spec.tasks || [];
  }

  getOwnerNamespace(): string {
    if (this.metadata.labels == undefined) {
      return "";
    }
    return this.metadata.labels.namespace != undefined
      ? this.metadata.labels.namespace
      : "";
  }

  getGraphName() {
    let annotations = this.metadata ? this.metadata.annotations : undefined;
    return annotations ? annotations["fuxi.nip.io/tektongraphs"] : "";
  }

  getTaskSet() {
    const taskList: PipelineTask[] = this.spec.tasks;
    if (!taskList) return [];
    const taskSet: string[] = [];
    taskList.map((task) => {
      taskSet.push(task.taskRef.name);
    });
    return taskSet;
  }
}

export const pipelineApi = new KubeApi({
  kind: Pipeline.kind,
  apiBase: "/apis/tekton.dev/v1alpha1/pipelines",
  isNamespaced: true,
  objectConstructor: Pipeline,
  request: apiTekton,
});
