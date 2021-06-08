import { autobind } from "../../utils";
import { KubeObjectStore } from "../../kube-object.store";
import { pipelineApi, Pipeline } from "../../api/endpoints";
import { apiManager } from "../../api/api-manager";
import { tektonGraphStore } from "../+tekton-graph/tekton-graph.store";
import { defaultInitData } from "../+tekton-graph/common";

@autobind()
export class PipelineStore extends KubeObjectStore<Pipeline> {
  api = pipelineApi;

  getNodeData(pipeline: Pipeline) {
    //TODO hard code needs fix
    const graphName = pipeline.getValueFromAnnotations(
      "yamecloud.io/tektongraphs"
    );
    if (graphName != "") {
      return JSON.parse(tektonGraphStore.getDataByName(graphName));
    }
    return defaultInitData;
  }

  getNodeSize(pipeline: Pipeline) {
    const graphName = pipeline.getValueFromAnnotations(
      "yamecloud.io/tektongraphs"
    );
    if (graphName != "") {
      const tektonGraph = tektonGraphStore.getByName(graphName);
      return { width: tektonGraph.spec.width, height: tektonGraph.spec.height };
    }
    return null;
  }

  getStatuses(pipeline: Pipeline[]) {
    const status = {
      sum: pipeline.length,
    };
    return status;
  }
}

export const pipelineStore = new PipelineStore();
apiManager.registerStore(pipelineApi, pipelineStore);
