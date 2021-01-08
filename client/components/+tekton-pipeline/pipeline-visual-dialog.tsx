import "./pipeline-visual-dialog.scss";
import styles from "../wizard/wizard.scss";

import React from "react";
import { observable } from "mobx";
import { Trans } from "@lingui/macro";
import { Dialog } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { observer } from "mobx-react";
import { Pipeline, PipelineTask, TektonGraph } from "../../api/endpoints";
import { PipelineGraph } from "../+tekton-graph/graph";
import { CopyTaskDialog } from "../+tekton-task/copy-task-dialog";
import { PipelineSaveDialog } from "./pipeline-save-dialog";
import { tektonGraphStore } from "../+tekton-graph/tekton-graph.store";
import { pipelineStore } from "./pipeline.store";
import { IKubeObjectMetadata } from "../../api/kube-object";
import { defaultInitConfig } from "../+tekton-graph/common";
import { graphAnnotationKey } from '../+constant/tekton-constants'
import { OwnerReferences } from '../../api/kube-object'

const wizardSpacing = parseInt(styles.wizardSpacing, 10) * 2;
const wizardContentMaxHeight = parseInt(styles.wizardContentMaxHeight);

const graphId = 'container';

interface Props extends Partial<Props> {
  G6Render: boolean,
  stopRender: () => void
}

@observer
export class PipelineVisualDialog extends React.Component<Props> {
  @observable static isOpen = false;
  @observable static Data: Pipeline = null;
  @observable graph: PipelineGraph = null;
  @observable width: number = 0;
  @observable height: number = 0;
  @observable nodeData: any = null;
  @observable currentNode: any = null;
  @observable initTimeout: any = null;

  componentDidMount() {
    window.addEventListener("resize", this.onOpen);
    window.addEventListener("changeNode", this.changeNode);
  }

  get pipeline() {
    return PipelineVisualDialog.Data;
  }

  static open(obj: Pipeline) {
    PipelineVisualDialog.isOpen = true;
    PipelineVisualDialog.Data = obj;
  }

  changeNode = async () => {
    this.nodeData = this.graph.save();
    this.setSize();
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

  onOpen = async () => {
    clearTimeout(this.initTimeout);
    this.initTimeout = null;
    this.initTimeout = setTimeout(() => {
      const anchor = document.getElementsByClassName("Wizard")[0];
      if (!anchor) return;
      this.width = anchor.clientWidth - wizardSpacing;
      this.height = wizardContentMaxHeight - wizardSpacing;

      if (this.graph == null && this.props.G6Render) {
        const pipelineGraphConfig = defaultInitConfig(this.width, this.height, graphId);
        this.graph = new PipelineGraph(pipelineGraphConfig);
        this.props.stopRender();
        this.graph.bindClickOnNode((currentNode: any) => {
          this.currentNode = currentNode;
          CopyTaskDialog.open(
            this.graph,
            this.currentNode,
            PipelineVisualDialog.Data.getNs()
          );
        });
      }

      if (this.nodeData == null) {
        this.nodeData = pipelineStore.getNodeData(this.pipeline);
      }
      this.graph.renderPipelineGraph(this.nodeData);
      this.setSize();

    }, 100);
  };

  //存取node{id,...} => <id,node>
  nodeToMap(): Map<string, any> {
    let items: Map<string, any> = new Map<string, any>();
    this.nodeData.nodes.map((item: any) => {
      const ids = item.id.split("-");
      if (items.get(ids[0]) === undefined) {
        items.set(ids[0], new Array<any>());
      }
      items.get(ids[0]).push(item);
    });
    return items;
  }

  //通过map的关系，形成要提交的任务，组装数据。
  getPipelineTasks(): PipelineTask[] {
    const dataMap = this.nodeToMap();
    let keys = Array.from(dataMap.keys());

    let tasks: PipelineTask[] = [];

    let index = 1;

    keys.map((i: any) => {
      let array = dataMap.get(String(index));

      if (index === 1) {
        array.map((item: any) => {
          let task: any = {};
          task.runAfter = [];
          task.name = item.taskName;
          task.taskRef = { name: item.taskName };
          task.params = [];
          task.resources = [];
          tasks.push(task);
        });
      } else {
        let result = index - 1;
        array.map((item: any) => {
          let task: any = {};
          task.runAfter = [];
          task.name = item.taskName;
          task.taskRef = { name: item.taskName };
          //set task runAfter
          dataMap.get(result.toString()).map((item: any) => {
            task.runAfter.push(item.taskName);
          });
          task.params = [];
          task.resources = [];
          tasks.push(task);
        });
      }

      index++;
    });

    return tasks;
  }

  updateTektonGraph = async (data: string) => {
    const graphName =
      this.pipeline.getName() + "-" + new Date().getTime().toString();

    const tektonGraph: Partial<TektonGraph> = {
      metadata: {
        name: graphName,
        namespace: this.pipeline.getNs(),
        labels: Object.fromEntries(
          new Map<string, string>().set(
            "namespace",
            this.pipeline.getNs().split("-")[0]
          )
        ),
      } as IKubeObjectMetadata,
      spec: {
        data: data,
        width: this.graph.width,
        height: this.graph.height,
      },
    };

    const newTektonGraph = await tektonGraphStore.create(
      { namespace: this.pipeline.getNs(), name: graphName },
      { ...tektonGraph }
    );

    const ownerReferences: OwnerReferences = {
      apiVersion: this.pipeline.getResourceVersion(),
      kind: this.pipeline.kind,
      name: this.pipeline.getName(),
      uid: this.pipeline.getId(),
      controller: false,
      blockOwnerDeletion: false,
    }
    newTektonGraph.addOwnerReferences([ownerReferences]);
    await tektonGraphStore.update(newTektonGraph, { ...newTektonGraph })



    this.pipeline.addAnnotation(
      graphAnnotationKey,
      newTektonGraph.getName()
    );

    await pipelineStore.update(this.pipeline, { ...this.pipeline });
  };

  save = async () => {
    this.nodeData = this.graph.save();

    const data = JSON.stringify(this.nodeData);
    let annotations = this.pipeline.metadata
      ? this.pipeline.metadata.annotations
      : undefined;
    const graphName = annotations
      ? annotations[graphAnnotationKey]
      : "";

    if (graphName != "") {
      try {
        let tektonGraph = tektonGraphStore.getByName(
          graphName,
          this.pipeline.getNs()
        );
        if (tektonGraph.spec.data !== data) {
          await this.updateTektonGraph(data);
        }
      } catch (e) {
        await this.updateTektonGraph(data);
      }
    } else {
      await this.updateTektonGraph(data);
    }


    const pipelineTasks = this.pipeline.spec.tasks
    //sort the tasks in pipeline
    if (pipelineTasks === undefined) {
      this.pipeline.spec.tasks = [];
      const pipelineTasks = this.getPipelineTasks()
      this.pipeline.spec.tasks.push(...pipelineTasks);
    } else {
      if (pipelineTasks.length == this.getPipelineTasks().length) {
        this.pipeline.spec.tasks = [];
        const pipelineTasks = this.getPipelineTasks()
        this.pipeline.spec.tasks.push(...pipelineTasks);
      } else {
        this.getPipelineTasks().map((task) => {
          const t = pipelineTasks.find((x) => x.name == task.name);
          if (t === undefined) {
            this.pipeline.spec.tasks.push(task);
          }
        });
      }
    }

    PipelineSaveDialog.open(this.pipeline);
  };

  static close() {
    PipelineVisualDialog.isOpen = false;
  }

  close = () => {
    this.reset();
    PipelineVisualDialog.close();
  };

  reset = () => {
    if (this.graph) {
      this.graph.clear();
      this.graph = null;
    }
    clearTimeout(this.initTimeout);
    this.initTimeout = null;
    this.nodeData = null;
    this.currentNode = null;
    this.width = 0;
    this.height = 0;
  };

  render() {
    const header = (
      <h5>
        <Trans>Pipeline Visualization</Trans>
      </h5>
    );

    return (
      <Dialog
        isOpen={PipelineVisualDialog.isOpen}
        className="PipelineVisualDialog"
        onOpen={this.onOpen}
        close={this.close}
        pinned
      >
        <Wizard header={header} done={this.close}>
          <WizardStep
            contentClass="flex gaps column"
            nextLabel={<Trans>Save</Trans>}
            next={this.save}
          >
            <div className={graphId} id={graphId} />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
