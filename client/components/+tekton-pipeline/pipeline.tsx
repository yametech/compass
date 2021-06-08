import "./pipeline.scss";

import React from "react";
import { observer } from "mobx-react";
import { observable } from "mobx";
import { RouteComponentProps } from "react-router";
import { Trans } from "@lingui/macro";
import {
  Pipeline,
  pipelineApi,
  PipelineTask,
  Task,
} from "../../api/endpoints";
import { pipelineStore } from "./pipeline.store";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object";
import { KubeObjectListLayout } from "../kube-object";
import { apiManager } from "../../api/api-manager";
import { PipelineResult, pipelineResult } from "../+tekton-graph/graph";
import {
  CopyTaskDialog,
  task,
  TaskResult,
} from "../+tekton-task/copy-task-dialog";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { AddPipelineDialog } from "./add-pipeline-dialog";
import { taskStore } from "../+tekton-task/task.store";
import { PipelineSaveDialog } from "./pipeline-save-dialog";
import { pipelineResourceStore } from "../+tekton-pipelineresource/pipelineresource.store";
import { PipelineRunDialog } from "../+tekton-pipelinerun/pipeline-run-dialog";
import { PipelineVisualDialog } from "./pipeline-visual-dialog";
import { tektonGraphStore } from "../+tekton-graph/tekton-graph.store";
import { Link } from "react-router-dom";
import Tooltip from "@material-ui/core/Tooltip";
import { stopPropagation } from "../../utils";
import { AddTektonStoreDialog, PipelineEntity } from "../+tekton-store";
import { TektonGraph } from "../../api/endpoints/tekton-graph.api";
import { pipelineRunStore } from "../+tekton-pipelinerun/pipelinerun.store";

enum sortBy {
  name = "name",
  namespace = "namespace",
  ownernamespace = "ownernamespace",
  tasks = "tasks",
  tasknames = "tasknames",
  age = "age",
}

interface Props extends RouteComponentProps { }

@observer
export class Pipelines extends React.Component<Props> {
  @observable pipeline: Pipeline;
  @observable task: TaskResult = task;
  @observable pipelineResources: [];
  @observable pipeResult: PipelineResult = pipelineResult;
  @observable G6Render: boolean = false; //是否能实例化G6

  renderPipelineName(pipeline: Pipeline) {
    const name = pipeline.getName();
    return (
      <a
        onClick={(event) => {
          stopPropagation(event);
          this.G6Render = true;
          PipelineVisualDialog.open(pipeline);
        }}
      >
        <Tooltip title={name} placement="top-start">
          <span>{name}</span>
        </Tooltip>
      </a>
    );
  }

  render() {
    return (
      <>
        <KubeObjectListLayout
          className="Pipelines"
          store={pipelineStore}
          dependentStores={[taskStore, pipelineRunStore, pipelineResourceStore, tektonGraphStore]} // other
          sortingCallbacks={{
            [sortBy.name]: (pipeline: Pipeline) => pipeline.getName(),
            [sortBy.namespace]: (pipeline: Pipeline) => pipeline.getNs(),
            [sortBy.age]: (pipeline: Pipeline) => pipeline.getAge(false),
            [sortBy.tasks]: (pipeline: Pipeline) => pipeline.getTasks().length,
          }}
          searchFilters={[(pipeline: Pipeline) => pipeline.getSearchFields()]}
          renderHeaderTitle={<Trans>Tekton Pipeline</Trans>}
          renderTableHeader={[
            {
              title: <Trans>Name</Trans>,
              className: "name",
              sortBy: sortBy.name,
            },
            {
              title: <Trans>Namespace</Trans>,
              className: "namespace",
              sortBy: sortBy.namespace,
            },
            {
              title: <Trans>Tasks</Trans>,
              className: "tasks",
              sortBy: sortBy.tasks,
            },

            { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          ]}
          renderTableContents={(pipeline: Pipeline) => [
            this.renderPipelineName(pipeline),
            pipeline.getNs(),
            pipeline.getTasks().length,
            pipeline.getAge(),
          ]}
          renderItemMenu={(item: Pipeline) => {
            return <PipelineMenu object={item} />;
          }}
          addRemoveButtons={{
            addTooltip: <Trans>Pipeline</Trans>,
            onAdd: () => {
              AddPipelineDialog.open();
            },
          }}
        />
        <PipelineVisualDialog
          G6Render={this.G6Render}
          stopRender={() => {
            this.G6Render = false;
          }}
        />
        <CopyTaskDialog />
        <AddPipelineDialog />
        <PipelineSaveDialog />
        <PipelineRunDialog />
        <AddTektonStoreDialog />
      </>
    );
  }
}

export function PipelineMenu(props: KubeObjectMenuProps<Pipeline>) {
  const { object, toolbar } = props;

  return (
    <KubeObjectMenu {...props}>
      <MenuItem
        onClick={() => {
          PipelineRunDialog.open(object);
        }}
      >
        <Icon
          material="play_circle_outline"
          title={"Pipeline"}
          interactive={toolbar}
        />
        <span className="title">
          <Trans>Run</Trans>
        </span>
      </MenuItem>

      <MenuItem
        onClick={() => {
          const pipeline = object as Pipeline;
          let tasks: Task[] = [];
          const graphName = pipeline.getGraphName();
          let graph: TektonGraph = tektonGraphStore.getByName(graphName);

          pipeline.getTasks().map((task: PipelineTask) => {
            const t: Task = taskStore.getByName(task.name);
            tasks.push(t);
          });

          const pipelineEntity: PipelineEntity = {
            pipelineData: JSON.stringify(pipeline),
            taskData: JSON.stringify(tasks),
            graphData: JSON.stringify(graph),
          };

          const resourcePipeline = "pipeline";
          AddTektonStoreDialog.open(
            JSON.stringify(pipelineEntity),
            resourcePipeline
          );
        }}
      >
        <Icon material="cloud_upload" title={"Upload"} interactive={toolbar} />
        <span className="title">
          <Trans>UploadStore</Trans>
        </span>
      </MenuItem>
    </KubeObjectMenu>
  );
}

apiManager.registerViews(pipelineApi, { Menu: PipelineMenu });
