import {autobind} from "../../utils";
import {KubeObject} from "../kube-object";
import {KubeApi} from "../kube-api";
import {apiTekton} from "../index";

export interface GraphNode {
  id: string; // 1-1 => group index
  x: number;
  y: number;
  taskName: string;
  type: string;
  size: number[];

  linkPoints?: {
    left?: boolean;
    right?: boolean;
    top?: boolean;
    bottom?: boolean;
    size: number;
  };

  style: {
    hover: {
      fillOpacity: number;
      lineWidth: number;
    };
  };
  depth: number;
}

export interface GraphEdge {
  id: string; // 1-1 => group index
  source: string;
  target: string;
  type: string;
  style: {
    stroke: string;
    lineWidth: number;
  };
  startPoint: {
    x: number;
    y: number;
    index: number;
    anchorIndex: number;
  };
  endPoint: {
    x: number;
    y: number;
    index: number;
    anchorIndex: number;
  };
  depth: number;
}

export interface GraphData {
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  combos?: [];
  groups?: [];
}

@autobind()
export class TektonGraph extends KubeObject {
  static kind = "TektonGraph";

  spec: {
    data: string;
    width: number;
    height: number;
  };

  get graph() {
    let graphData: GraphData;
    return Object.assign(this.spec.data, graphData);
  }

  setpSave(graphData: GraphData) {
    this.spec.data = JSON.stringify(graphData);
  }

  getGraphNodes(): GraphNode[] {
    if (this.graph != undefined) {
      return this.graph.nodes;
    }
    return [];
  }

  getGraphEdges(): GraphEdge[] {
    if (this.graph != undefined) {
      return this.graph.edges;
    }
    return [];
  }

  addNodesBeforeClearNodes(nodes: GraphNode[]) {
    this.graph.nodes = nodes;
  }

  addNode(node: GraphNode): void {
    this.graph.nodes.push(node);
    this.setpSave(this.graph);
  }

  removeNode(id: string): void {
    this.graph.nodes.splice(
      this.graph.nodes.findIndex((node) => (node.id = id)),
      1
    );
    this.setpSave(this.graph);
  }

  addEdge(edge: GraphEdge): void {
    this.graph.edges.push(edge);
    this.setpSave(this.graph);
  }

  removeEdge(id: string): void {
    this.graph.edges.splice(
      this.graph.nodes.findIndex((node) => (node.id = id)),
      1
    );
    this.setpSave(this.graph);
  }
}

export const tektonGraphApi = new KubeApi({
  kind: TektonGraph.kind,
  apiBase: "/apis/fuxi.nip.io/v1/tektongraphs",
  isNamespaced: true,
  objectConstructor: TektonGraph,
  request: apiTekton,
});

export function secondsToHms(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor((seconds % 3600) % 60);

  let hDisplay = h > 0 ? h + (h == 1 ? "h " : "h") : "";
  let mDisplay = m > 0 ? m + (m == 1 ? "m " : "m") : "";
  let sDisplay = s > 0 ? s + (s == 1 ? "s " : "s") : "";
  return hDisplay + mDisplay + sDisplay;
}

export function advanceSecondsToHms(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor((seconds % 3600) % 60);
  let hDisplay = h > 0 ? h + (h == 1 ? " hours " : " hours") : "";
  let mDisplay = m > 0 ? m + (m == 1 ? " minutes " : " minutes") : "";
  let sDisplay = s > 0 ? s + (s == 1 ? " seconds " : " seconds") : "";
  return hDisplay + mDisplay + sDisplay;
}
