export const taskName = "taskName";
export const defaultTaskName = "node-1-1";
export const defaultNodeId = "1-1";

export enum NodeStatus {
  Pending = "Pending",
  Failed = "Failed",
  Running = "Running",
  Progress = "Progress",
  Succeeded = "Succeeded",
  Cancel = "TaskRunCancelled",
  Timeout = "TaskRunTimeout",
}

export enum NodeStatusColor {
  Pending = "#ffc12f",
  Failed = "red",
  Running = "#3296fa",
  Progress = "#3296fa",
  Succeeded = "#20d867",
  Cancel = "#3296fa",
  Timeout = "#f02b2b",
}

export enum PipelineStatus {
  Succeeded = "Succeeded",
  Completed = "Completed",
  Running = "Running",
  Started = "Started",
  PipelineRunCancelled = "PipelineRunCancelled",
}

export const tektonStoreNamespace = "tekton-store";

export const graphAnnotationKey = "yamecloud.io/tektongraphs";
export const runGraphAnnotationKey = "yamecloud.io/run-tektongraphs";
