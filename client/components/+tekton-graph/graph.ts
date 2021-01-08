import "./register-shape";
import { Graph } from "@antv/g6";
import { Item, IAlgorithmCallbacks } from "@antv/g6/lib/types";
import { INode, IEdge } from "@antv/g6/lib/interface/item";
import {
  PipelineGraphOptions,
  PipelineGraphData,
  PipelineNodeConfig,
  NodeRole,
  getGroupId,
  getIndexId,
  getPrimaryNodeId,
  spacingY,
  spacingX,
  hasSubNode,
  groupNodes,
  hasRightNeighborNode
} from "./common";
import { Algorithm } from "@antv/g6";
import { IGraph } from "@antv/g6/lib/interface/graph";
import { PipelineParams, PipelineResources } from "../+tekton-common";
import { maxBy } from "lodash";

const { depthFirstSearch } = Algorithm;

export interface PipelineResult {
  pipelineResources: PipelineResources[];
  pipelineParams: PipelineParams[];
}

export const pipelineResult: PipelineResult = {
  pipelineResources: [],
  pipelineParams: [],
};

declare type SearchAlgorithm0 = (graph: IGraph) => void;
declare type SearchAlgorithm1 = (
  graph: IGraph,
  startNodeId: string,
  originalCallbacks?: IAlgorithmCallbacks
) => void;

export class PipelineGraph extends Graph {
  public width: number = 0;
  public height: number = 0;

  constructor(cfg: PipelineGraphOptions) {
    super(cfg);
    this.width = cfg.width;
    this.height = cfg.height;
  }

  private searchChildMove(
    id: string,
    search: SearchAlgorithm0 | SearchAlgorithm1
  ) {
    search(this, id, {
      enter: ({ current, previous }) => {
        // console.log("current==>", current, "previous=>", previous);
      },
      leave: ({ current, previous }) => {
        // 遍历完节点的回调
      },
    });
  }

  getMaxXNodePoint(): number {
    return (
      this.getNodes()
        ?.sort((a: INode, b: INode): number => {
          if (getGroupId(a.getID()) < getGroupId(b.getID())) {
            return 1;
          }
          if (getGroupId(a.getID()) > getGroupId(b.getID())) {
            return -1;
          }
          return 0;
        })[0]
        .getModel().x +
        spacingX * 1.01 || 0
    );
  }

  getMaxYNodePoint(): number {
    return (
      this.getNodes()
        ?.sort((a: INode, b: INode): number => {
          if (getIndexId(a.getID()) < getIndexId(b.getID())) {
            return 1;
          }
          if (getIndexId(a.getID()) > getIndexId(b.getID())) {
            return -1;
          }
          return 0;
        })[0]
        .getModel().y +
        spacingY * 1.4 || 0
    );
  }

  bindClickOnNode(cb: (node: Item) => void): void {
    this.on("node:click", (evt: any) => {
      const { item } = evt;
      const shape = evt.target.cfg.name;
      const node = item as INode;
      const sourceId = node.getID();
      const model = (item as Item).getModel();
      const { x, y } = model;
      const point = this.getCanvasByPoint(x, y);

      if (shape === "right-plus") {
        const [group, index] = sourceId.split("-");
        const nextGroup = String(Number(group) + 1);
        let targetId = [nextGroup, index].join("-");
        let nodeLayoutIndex: number = 0;

        if (this.findById(targetId) !== undefined) {
          const groupNodeSortList = groupNodes(
            this.findById(targetId) as INode
          );

          targetId = [
            nextGroup,
            String(
              getIndexId(
                groupNodeSortList[groupNodeSortList.length - 1].getID()
              ) + 1
            ),
          ].join("-");
          nodeLayoutIndex = groupNodeSortList.length;
        }

        this.addNode(
          sourceId,
          targetId,
          Number(point.x),
          Number(point.y),
          nodeLayoutIndex
        );

        window.dispatchEvent(new Event("changeNode"));
        return;
      }

      if (shape === "left-plus") {
        const source = item as INode;
        this.moveNode(node);
        this.removeNode(source);

        window.dispatchEvent(new Event("changeNode"));
        return;
      }

      if (cb) {
        cb(item);
      }
    });
  }

  private removeNode(node: INode) {
    if (hasRightNeighborNode(node) && getIndexId(node.getID()) === 1) {
      alert("Illegal operation");
      return;
    }
    this.removeItem(node.getID());
    window.dispatchEvent(new Event("changeNode"));
  }

  private addNode(
    sourceId: string,
    targetId: string,
    x: number,
    y: number,
    nodeLayoutIndex: number
  ) {
    const nodeIndexId = getIndexId(targetId);
    const pipelineNodeConfig: PipelineNodeConfig = {
      id: targetId,
      taskName: ["node", targetId].join("-"),
      role: nodeIndexId > 1 ? NodeRole.Second : NodeRole.Primary,
      x: Number(x) + spacingX,
      y: Number(y) + nodeLayoutIndex * spacingY,
      linkPoints: {
        right: true,
        left: true,
      },
      anchorPoints: [
        [0, 0.5],
        [1, 0.5],
      ],
    };

    if (this.addItem("node", pipelineNodeConfig) === undefined) {
      return;
    }

    if (nodeIndexId > 1) {
      this.getNodes()
        ?.find((node: INode) => {
          return node.getID() === getPrimaryNodeId(targetId);
        })
        ?.getNeighbors()
        ?.map((pnode: INode) => {
          if (getIndexId(pnode.getID()) === 1) {
            this.addItem("edge", {
              source: targetId,
              target: pnode.getID(),
              type: "cubic-horizontal",
              style: {
                stroke: "#959DA5",
                lineWidth: 2,
              },
            });
          }
        });
    } else {
      this.getNodes()?.map((node: INode) => {
        if (getGroupId(node.getID()) === getGroupId(targetId) - 1) {
          this.addItem("edge", {
            source: node.getID(),
            target: targetId,
            type: "cubic-horizontal",
            // curvePosition: 1,
            curveOffset: 20,
            style: {
              stroke: "#959DA5",
              lineWidth: 2,
            },
          });
        }
      });
    }
  }

  private moveNode(node: INode) {
    // 如果有子节点,那么需要将子节点上移, 有点问题,需要全部shape一起移.... ?
    if (!hasSubNode(node)) {
      return;
    }

    this.getNodes()?.map((needUpdateNode: INode) => {
      if (
        getGroupId(needUpdateNode.getID()) === getGroupId(node.getID()) &&
        getIndexId(needUpdateNode.getID()) > getIndexId(node.getID())
      ) {
        needUpdateNode.updatePosition({
          x: needUpdateNode.getModel().x,
          y: needUpdateNode.getModel().y - spacingY,
        });

        const needUpdateEdgeCfg = needUpdateNode
          .getEdges()
          ?.map((edge: IEdge) => {
            return {
              id: edge.getID(),
              source: edge.getModel().source,
              target: edge.getModel().target,
            };
          });

        if (needUpdateEdgeCfg === undefined || needUpdateEdgeCfg.length === 0) {
          return;
        }
        needUpdateEdgeCfg.map(
          // eslint-disable-next-line array-callback-return
          (cfg: { id: string; source: string; target: string }) => {
            this.remove(cfg.id);
            this.addItem("edge", {
              source: cfg.source,
              target: cfg.target,
              type: "cubic-horizontal",
              style: {
                stroke: "#959DA5",
                lineWidth: 2,
              },
            });
          }
        );
      }
    });
  }

  setTaskName(node: Item, taskName: string): void {
    const cfg: Partial<PipelineNodeConfig> = { taskName: taskName };
    this.updateItem(node, cfg);
  }

  setNodeRole(node: Item, role: NodeRole): void {
    const cfg: Partial<PipelineNodeConfig> = { role: role };
    this.updateItem(node, cfg);
  }

  bindMouseenter(): void {
    this.on("node:mouseenter", (evt: { item: Item }) => {
      this.searchChildMove((<INode>evt.item).getID(), depthFirstSearch);
      this.setItemState(evt.item, "hover", true);
    });
  }

  bindMouseleave(): void {
    this.on("node:mouseleave", (evt: { item: Item }) => {
      this.setItemState(evt.item, "hover", false);
    });
  }

  enableShowtime(data: PipelineGraphData): void {
    data.nodes.map((node) => (node.showtime = true));
  }

  enableAddNode(data: PipelineGraphData): void {
    data.nodes.map((node) => (node.addnode = true));
  }

  enableSubNode(data: PipelineGraphData): void {
    data.nodes.map((node) => (node.subnode = true));
  }

  pipelineSave(): PipelineGraphData {
    const pipelineGraphData: PipelineGraphData = {};
    return Object.assign(pipelineGraphData, this.save());
  }

  renderPipelineGraph(nodeData: PipelineGraphData) {
    this.enableAddNode(nodeData);
    this.enableSubNode(nodeData);
    this.bindMouseenter();
    this.bindMouseleave();
    this.data(nodeData);
    this.setMode("addEdge");
    this.render();
  }
}
