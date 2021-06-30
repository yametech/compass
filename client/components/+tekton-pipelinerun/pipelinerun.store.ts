import { autobind } from "../../utils";
import { KubeObjectStore } from "../../kube-object.store";
import {
  pipelineRunApi,
  PipelineRun,
  PipelineRunStatusReason,
} from "../../api/endpoints";
import { apiManager } from "../../api/api-manager";
import { tektonGraphStore } from "../+tekton-graph/tekton-graph.store";
import { initData } from "../+tekton-graph/common";
import { taskRunStore } from "../+tekton-taskrun";
import { graphAnnotationKey, runGraphAnnotationKey } from "../+constant/tekton-constants";

@autobind()
export class PipelineRunStore extends KubeObjectStore<PipelineRun> {
  api = pipelineRunApi;

  getTaskRunName(pipelineRun: PipelineRun): string[] {
    if (pipelineRun?.status == undefined) {
      return [];
    }
    if (pipelineRun?.status?.taskRuns == undefined) {
      return [];
    }
    return (
      Object.keys(pipelineRun?.status?.taskRuns)
        .map((item: any) => {
          return item;
        })
        .slice() || []
    );
  }

  getTaskRun(names: string[]): any {
    let taskMap: any = new Map<string, any>();
    names.map((name: string) => {
      const currentTask = taskRunStore.getByName(name);
      if (currentTask?.spec !== undefined) {
        taskMap[currentTask.spec.taskRef.name] = currentTask;
      }
    });

    return taskMap;
  }

  getNodeData(pipelineRun: PipelineRun) {
    let graphName: string = pipelineRun.getAnnotation(runGraphAnnotationKey);

    if (graphName) {
      try {
        return JSON.parse(tektonGraphStore.getByName(graphName).spec.data);
      } catch (e) {
        return initData;
      }
    }
    return initData;
  }

  getNodeSize(pipelineRun: PipelineRun) {
    let graphName: string = pipelineRun.getAnnotation(runGraphAnnotationKey);
    if (graphName) {
      try {
        const tektonGraph = tektonGraphStore.getByName(graphName);
        return {
          width: tektonGraph.spec?.width,
          height: tektonGraph.spec?.height,
        };
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  getStatuses(pipelineRuns: PipelineRun[]) {
    const status = {
      failed: 0,
      pending: 0,
      running: 0,
      succeeded: 0,
      cancel: 0,
      timeout: 0,
    };
    pipelineRuns.forEach((pipelineRun) => {
      const currentStatus = pipelineRun.getStatus();
      if (currentStatus === PipelineRunStatusReason.Failed) {
        status.failed++;
        return;
      }
      if (currentStatus === PipelineRunStatusReason.Pending) {
        status.pending++;
        return;
      }
      if (currentStatus === PipelineRunStatusReason.Running) {
        status.running++;
        return;
      }
      if (currentStatus === PipelineRunStatusReason.Succeeded) {
        status.succeeded++;
        return;
      }
      if (currentStatus === PipelineRunStatusReason.Timeout) {
        status.timeout++;
        return;
      }
      if (currentStatus === PipelineRunStatusReason.PipelineRunCancelled) {
        status.cancel++;
      } else {
        status.failed++;
      }
    });
    return status;
  }
}

export const pipelineRunStore = new PipelineRunStore();
apiManager.registerStore(pipelineRunApi, pipelineRunStore);
