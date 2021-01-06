import {
  GraphOptions,
  GraphData,
  NodeConfig,
  ModelConfig,
  Item,
  TreeGraphData,
  EdgeConfig,
} from "@antv/g6/lib/types";
import { INode } from "@antv/g6/lib/interface/item";
import { toJS } from "mobx";
import {
  NodeStatus,
  defaultNodeId,
  defaultTaskName,
} from "../+constant/tekton-constants";

export const pipelineNode: string = "pipeline-node";
export const spacingY = 60;
export const spacingX = 300;

export enum NodeRole {
  Primary,
  Second,
}

export interface PipelineGraphOptions extends GraphOptions {}

export interface PipelineGraphConfig extends ModelConfig {}

export interface PipelineNodeConfig extends NodeConfig {
  role?: NodeRole;
  status?: NodeStatus;
  taskName?: string;
  showtime?: boolean;
  addnode?: boolean;
  subnode?: boolean;
}

export interface PipelineEdgeConfig extends EdgeConfig {}

export interface PipelineGraphData extends GraphData {
  nodes?: PipelineNodeConfig[];
  edges?: PipelineEdgeConfig[];
}

export function getNodeTaskName(node: Item): string {
  const nodeCfg: PipelineNodeConfig = { id: node.getID() };
  Object.assign(nodeCfg, toJS(node));
  return nodeCfg.taskName || "none";
}

export function getGroupId(id: string): number {
  if (id.split("-").length === 2) {
    return Number(id.split("-")[0]);
  }
  return -1;
}

export function getIndexId(id: string): number {
  if (id.split("-").length === 2) {
    return Number(id.split("-")[1]);
  }
  return -1;
}

export function getPrimaryNodeId(id: string): string {
  return [getGroupId(id), "1"].join("-");
}

export function hasRightNeighborNode(node: INode): boolean {
  return node.getNeighbors().find((item: INode) => {
    if (getGroupId(item.getID()) === getGroupId(node.getID()) + 1) {
      return item;
    }
  }) !== undefined
    ? true
    : false;
}

export function hasSubNode(node: INode): boolean {
  return node
    .getNeighbors()
    ?.find((item: INode) => {
      if (getGroupId(node.getID()) === getGroupId(item.getID()) + 1) {
        return item;
      }
    })
    ?.getNeighbors()
    .find((groupItem: INode) => {
      if (
        getGroupId(node.getID()) === getGroupId(groupItem.getID()) &&
        node.getID() !== groupItem.getID()
      ) {
        return groupItem;
      }
    }) !== undefined
    ? true
    : false;
}

export function groupNodes(node: INode): INode[] {
  return (
    node
      .getNeighbors()
      ?.find((item: INode) => {
        if (
          getGroupId(node.getID()) == getGroupId(item.getID()) + 1 &&
          getIndexId(item.getID()) === 1
        ) {
          return item;
        }
      })
      ?.getNeighbors()
      ?.filter((groupItem: INode) => {
        return getGroupId(node.getID()) == getGroupId(groupItem.getID());
      })
      ?.sort((a: INode, b: INode): number => {
        if (getIndexId(a.getID()) > getIndexId(b.getID())) {
          return 1;
        }
        if (getIndexId(a.getID()) < getIndexId(b.getID())) {
          return -1;
        }
        return 0;
      }) || []
  );
}

export function subNodes(node: INode): INode[] {
  if (!hasSubNode(node)) {
    return [];
  }
  return (
    node
      .getNeighbors()
      ?.find((item: INode) => {
        if (getGroupId(node.getID()) == getGroupId(item.getID()) + 1) {
          return item;
        }
      })
      ?.getNeighbors()
      ?.filter((groupItem: INode) => {
        return (
          getGroupId(node.getID()) == getGroupId(groupItem.getID()) &&
          node.getID() != groupItem.getID()
        );
      })
      ?.sort((a: INode, b: INode): number => {
        if (a.getID() > b.getID()) {
          return 1;
        }
        if (a.getID() < b.getID()) {
          return -1;
        }
        return 0;
      }) || []
  );
}

export function buildNodeConfig(
  id: string,
  x: number,
  y: number
): PipelineNodeConfig {
  const node: PipelineNodeConfig = {
    id: id,
    x: x,
    y: y,
    role: NodeRole.Second,
    anchorPoints: [
      [0, 0.5],
      [1, 0.5],
    ],
  };
  if (id.endsWith("1", 1)) {
    node.role = NodeRole.Primary;
  }
  return node;
}

export const defaultInitGraphNode: PipelineNodeConfig = {
  id: defaultNodeId,
  x: 20,
  y: 20,
  role: NodeRole.Primary,
  taskName: defaultTaskName,
  anchorPoints: [
    [0, 0.5], // 左侧中间
    [1, 0.5], // 右侧中间
  ],
};

export const defaultInitData: PipelineGraphData = {
  nodes: [defaultInitGraphNode],
};

export function defaultInitConfig(
  width: number,
  height: number,
  graphId: string
): PipelineGraphOptions {
  const defaultCfg: PipelineGraphOptions = {
    container: graphId,
    width: width,
    height: height,
    renderer: "canvas",
    autoPaint: true,

    layout: {
      direction: "LR",
      preventOverlap: true, // 防止节点重叠
    },

    modes: {
      //   default: ["drag-canvas", "zoom-canvas", "drag-node"], // 允许拖拽画布、放缩画布、拖拽节点
    },

    defaultEdge: {
      type: "line",
      style: {
        stroke: "#959DA5",
        lineWidth: 2,
      },
    },

    defaultNode: {
      type: pipelineNode,
      linkPoints: {
        right: true,
        left: true,
      },
    },
  };
  return defaultCfg;
}
