import "./pipelinerun-visual-dialog.scss";
import styles from "../wizard/wizard.scss";

import React from "react";
import { observable } from "mobx";
import { Trans } from "@lingui/macro";
import { Dialog } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { observer } from "mobx-react";
import { PipelineRun } from "../../api/endpoints";
import { PipelineGraph } from "../+tekton-graph/graph";
import { secondsToHms } from "../../api/endpoints";
import { pipelineRunStore } from "./pipelinerun.store";
import { TaskRunLogsDialog } from "../+tekton-taskrun/task-run-logs-dialog";
import { defaultInitData, defaultInitConfig } from "../+tekton-graph/common";
import { taskName, NodeStatus } from "../+constant/tekton-constants";

const wizardSpacing = parseInt(styles.wizardSpacing, 10) * 6;
const wizardContentMaxHeight = parseInt(styles.wizardContentMaxHeight);
const graphId = 'runContainer';

interface Props extends Partial<Props> {
  G6Render: boolean,
  stopRender: () => void
}

@observer
export class PipelineRunVisualDialog extends React.Component<Props> {
  @observable static isOpen = false;
  @observable static Data: PipelineRun = null;
  @observable graph: PipelineGraph = null;
  @observable pipelineGraphConfig: any = null;
  @observable width: number = 0;
  @observable height: number = 0;
  @observable nodeData: any = null;
  @observable currentNode: any = null;
  @observable initTimeout: any = null;
  @observable pendingTimeInterval: any = null;
  @observable updateTimeInterval: any = null;

  componentDidMount() {
    window.addEventListener("resize", this.onOpen);
  }

  get pipelineRun() {
    return PipelineRunVisualDialog.Data;
  }

  static open(pipelineRun: PipelineRun) {
    PipelineRunVisualDialog.isOpen = true;
    PipelineRunVisualDialog.Data = pipelineRun;
  }

  showLogs(taskRunName: string, namespace: string) {
    TaskRunLogsDialog.open(taskRunName, namespace);
  }

  setSize() {
    const maxXNodePoint = this.graph.getMaxXNodePoint();
    const maxYNodePoint = this.graph.getMaxYNodePoint();

    if (this.width < maxXNodePoint) {
      this.width = maxXNodePoint;
    }
    if (wizardContentMaxHeight < maxYNodePoint) {
      this.height = maxYNodePoint;
    }

    this.graph.changeSize(this.width, this.height);
  }

  initGraph = async () => {
    this.initTimeout = setTimeout(() => {
      const anchor = document.getElementsByClassName("Wizard")[0];
      if (!anchor) return;
      this.width = anchor.clientWidth - wizardSpacing;
      this.height = wizardContentMaxHeight - wizardSpacing;

      if (this.nodeData === undefined || this.nodeData === "") {
        this.nodeData = defaultInitData;
      }

      this.nodeData.nodes.map((item: any, index: number) => {
        this.nodeData.nodes[index].status = NodeStatus.Pending;
        this.nodeData.nodes[index].showtime = true;
      })

      if (this.graph == null && this.props.G6Render) {
        
        this.pipelineGraphConfig = defaultInitConfig(this.width, this.height, graphId);
        this.graph = new PipelineGraph(this.pipelineGraphConfig);
        this.props.stopRender();
        this.graph.data(this.nodeData);
        this.graph.bindClickOnNode((currentNode: any) => {
          const name = currentNode.getModel()[taskName] || "";
          const names = pipelineRunStore.getTaskRunName(this.pipelineRun);
          const currentTaskRunMap = pipelineRunStore.getTaskRun(names);
          const currentTaskRun = currentTaskRunMap[name];
          this.showLogs(currentTaskRun.getName(), currentTaskRun.getNs());
        });
      } else {
        this.graph.clear();
        this.graph.changeData(this.nodeData);
      }

      this.graph.render();
      this.setSize();
    }, 100);
  }

  renderGraphData = async () => {
    this.pendingTimeInterval = setInterval(() => {
      if (!this.pipelineRun) return;
      const names = this.pipelineRun.getTaskRunName();
      if (names.length > 0) {
        const currentTaskRunMap = pipelineRunStore.getTaskRun(names);
        this.nodeData.nodes.map((item: any, index: number) => {
          const currentTaskRun = currentTaskRunMap[item.taskName];
          if (currentTaskRun !== undefined) {
            //should check when the pipeline-run status
            this.nodeData.nodes[index].status =
              currentTaskRun.status.conditions[0].reason;
          } else {
            this.nodeData.nodes[index].status = NodeStatus.Pending;
          }
          this.nodeData.nodes[index].showtime = true;
        });

        if (this.graph) {
          this.graph.clear();
          this.graph.changeData(this.nodeData);
        }
      }
    }, 500);
  };

  renderTimeInterval = async () => {
    //Interval 1s update status and time in graph
    this.updateTimeInterval = setInterval(() => {
      if (!this.pipelineRun || !this.graph) return;
      const names = pipelineRunStore
        .getByName(this.pipelineRun.getName())
        .getTaskRunName();
      clearInterval(this.pendingTimeInterval);
      if (names.length > 0) {
        const currentTaskRunMap = pipelineRunStore.getTaskRun(names);
        this.nodeData.nodes.map((item: any, index: number) => {
          //set current node status,just like:Failed Succeed... and so on.

          const currentTaskRun = currentTaskRunMap[item.taskName];
          if (currentTaskRun !== undefined) {
            //should get current node itme and update the time.
            let currentItem = this.graph.findById(
              this.nodeData.nodes[index].id
            );
            //dynimic set the state: missing notreay

            // if (currentTaskRun?.status?.conditions[0]?.reason == undefined) {
            //   return;
            // }

            this.graph.setItemState(
              currentItem,
              currentTaskRun?.status?.conditions[0]?.reason,
              ""
            );

            //when show pipeline will use current date time  less start time and then self-increment。
            let completionTime = currentTaskRun.status?.completionTime;
            let totalTime: string;
            const currentStartTime = currentTaskRun.metadata.creationTimestamp;
            const st = new Date(currentStartTime).getTime();
            if (completionTime !== undefined) {
              const ct = new Date(completionTime).getTime();
              let result = Math.floor((ct - st) / 1000);
              totalTime = secondsToHms(result);
            } else {
              const ct = new Date().getTime();
              let result = Math.floor((ct - st) / 1000);
              totalTime = secondsToHms(result);
            }

            //set the time
            this.graph.setItemState(currentItem, "time", totalTime);
          }
        });
      }
    }, 500);
  }

  onOpen = async () => {
    clearTimeout(this.initTimeout);
    this.initTimeout = null;
    clearInterval(this.pendingTimeInterval);
    this.pendingTimeInterval = null;
    clearInterval(this.updateTimeInterval);
    this.updateTimeInterval = null;
    this.nodeData = pipelineRunStore.getNodeData(this.pipelineRun);
    await this.initGraph();
    await this.renderGraphData();
    await this.renderTimeInterval();
  };

  static close() {
    PipelineRunVisualDialog.isOpen = false;
  }

  close = async () => {
    await this.reset();
    PipelineRunVisualDialog.close();
  };

  reset = async () => {
    if (this.graph) {
      this.graph.clear();
      this.graph = null;
    }
    clearTimeout(this.initTimeout);
    this.initTimeout = null;
    clearInterval(this.pendingTimeInterval);
    this.pendingTimeInterval = null;
    clearInterval(this.updateTimeInterval);
    this.updateTimeInterval = null;
    this.width = 0;
    this.height = 0;
  };

  render() {
    const header = (
      <h5>
        <Trans>PipelineRun Visualization</Trans>
      </h5>
    );

    return (
      <Dialog
        isOpen={PipelineRunVisualDialog.isOpen}
        className="PipelineRunVisualDialog"
        onOpen={this.onOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep
            contentClass="flex gaps column"
            hideNextBtn={true}
            prevLabel={<Trans>Close</Trans>}
          >
            <div className="container" id={graphId} />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
