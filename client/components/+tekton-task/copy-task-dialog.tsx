import "./copy-task-dialog.scss";

import { observer } from "mobx-react";
import React from "react";
import {
  PipelineParamsDetails,
  MultiTaskStepDetails,
  PipelineParams,
  TaskStep,
  taskStep,
  ResourcesDetail,
  resources,
  TaskSpecWorkSpaces,
} from "../+tekton-common";
import { observable, toJS } from "mobx";
import { Dialog } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Trans } from "@lingui/macro";
import { ActionMeta } from "react-select/src/types";
import { SubTitle } from "../layout/sub-title";
import { Input } from "../input";
import { _i18n } from "../../i18n";
import { taskStore } from "./task.store";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { Select } from "../select";
import { TaskResources } from "../../api/endpoints";
import { Notifications } from "../notifications";
import { systemName } from "../input/input.validators";
import { configStore } from "../../config.store";
import { WorkspaceDeclaration as Workspace } from "../../api/endpoints/tekton-task.api";
import { Collapse } from "../collapse";
import { PipelineGraph } from "../+tekton-graph/graph";
import { INode } from "@antv/g6/lib/interface/item";
import { taskName } from "../+constant";
import { taskApi } from "../../api/endpoints";
import { apiManager } from "../../../client/api/api-manager";

interface Props<T = any> extends Partial<Props> {
  value?: T;

  onChange?(value: T, meta?: ActionMeta<any>): void;
  themeName?: "dark" | "light" | "outlined";
}

class Volume {
  name: string;
  emptyDir: any;
}

export interface TaskResult {
  taskName: string;
  namespace: string;
  pipelineParams: PipelineParams[];
  resources: TaskResources;
  taskSteps: TaskStep[];
  volumes?: Volume[];
  workspace?: Workspace[];
}

export const task: TaskResult = {
  taskName: "",
  namespace: "",
  pipelineParams: [],
  resources: resources,
  taskSteps: [taskStep],
  volumes: [],
  workspace: [],
};

@observer
export class CopyTaskDialog extends React.Component<Props> {

  @observable value: TaskResult = this.props.value || task;
  @observable static isOpen = false;
  @observable static graph: PipelineGraph;
  @observable static node: INode;
  @observable static data: any;
  @observable static namespace: string;
  @observable ifSwitch: boolean = false;
  @observable name: string;
  @observable change: boolean;

  static open(graph: PipelineGraph, node: INode, namespace: string) {
    CopyTaskDialog.isOpen = true;
    CopyTaskDialog.namespace = namespace;
    this.graph = graph;
    this.node = node;
  }

  loadData = async (name: string, namespace: string) => {
    try {
      const task = taskStore.getByName(name, namespace);
      if (task !== undefined) {
        this.value.resources = task.getResources();
        this.value.taskSteps = task.getSteps();
        this.value.workspace = task.getWorkspaces();
        this.value.volumes = task.getVolumes();
        this.value.pipelineParams = task.getParams();
        this.value.taskName = task.getName();
        this.value.namespace = task.getNs();
      } else {
        this.reset()
      }
    } catch (err) {
      return err;
    }
  };

  onOpen = async () => {
    try {
      const name = CopyTaskDialog.node.getModel()[taskName] || "";
      await this.loadData(String(name), CopyTaskDialog.namespace);
    } catch (err) {
      Notifications.error(err);
    }
  };

  static close() {
    CopyTaskDialog.isOpen = false;
  }

  reset = async () => {
    this.value = task;
    this.name = "";
  }


  close = async () => {
    CopyTaskDialog.close();
  };

  handle = async () => {
    await this.saveTask();
    const name = this.value.taskName;
    CopyTaskDialog.graph.setTaskName(CopyTaskDialog.node, name);
  };

  saveTask = async () => {
    const params = toJS(this.value.pipelineParams);
    const resources = toJS(this.value.resources);
    const steps = toJS(this.value.taskSteps);
    const workspaces = toJS(this.value.workspace);

    //TODO: meeds move volumes
    const volumes = [
      {
        name: "build-path",
        emptyDir: {},
      },
    ];

    try {
      const task = taskStore.getByName(
        this.value.taskName,
        CopyTaskDialog.namespace
      );
      if (task === undefined) {
        await taskApi.create(
          {
            name: this.value.taskName,
            namespace: configStore.getOpsNamespace(),
          },
          {
            spec: {
              params: params,
              resources: resources,
              steps: steps,
              volumes: volumes,
              workspaces: workspaces,
            },
          }
        );
      } else {
        if (!this.ifSwitch) {
          task.metadata.name = this.value.taskName;
          task.spec.params = params;
          task.spec.resources = resources;
          task.spec.workspaces = workspaces;
          task.spec.steps = steps;
          await apiManager.getApi(task.selfLink).update({ name: task.getName(), namespace: task.getNs() }, { ...task });
        }
      }
      Notifications.ok(<>Task {this.value.taskName} save succeeded</>);
      this.close();
    } catch (err) {
      Notifications.error(err);
    }
  };

  handleChange = async (event: any) => {
    this.ifSwitch = event.target.checked;
    if (!this.ifSwitch) {
      const name = this.value.taskName;
      await this.loadData(String(name), CopyTaskDialog.namespace);
    }
  };

  get taskOptions() {
    const options = taskStore
      .getAllByNs(CopyTaskDialog.namespace)
      .map((item) => item.getName());
    return [...options];
  }

  rUnSwitch() {
    return (
      <div hidden={!this.ifSwitch}>
        <Select
          value={this.value.taskName}
          options={this.taskOptions}
          themeName={"light"}
          onChange={(value) => {
            this.value.taskName = value.value;
          }}
        />
      </div>
    );
  }

  rSwitch() {
    return (
      <div hidden={this.ifSwitch}>
        <SubTitle title={<Trans>Task Name</Trans>} />
        <Input
          required={true}
          validators={systemName}
          placeholder={_i18n._("Task Name")}
          value={this.value.taskName}
          onChange={(value) => (this.value.taskName = value)}
        />
        <br />
        <Collapse panelName={<Trans>TaskStep</Trans>} key={"TaskStep"}>
          <MultiTaskStepDetails
            value={this.value.taskSteps}
            onChange={(value) => {
              this.value.taskSteps = value;
            }}
          />
        </Collapse>
      </div>
    );
  }

  render() {
    const header = (
      <h5>
        <Trans>Apply Task</Trans>
      </h5>
    );

    return (
      <Dialog
        isOpen={CopyTaskDialog.isOpen}
        className="CopyAddDeployDialog"
        onOpen={this.onOpen}
        close={this.close}
        pinned
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flex gaps column" next={this.handle}>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Switch
                    name="checkedA"
                    color="default"
                    checked={this.ifSwitch}
                    onChange={this.handleChange}
                  />
                }
                label={
                  this.ifSwitch ?
                    <SubTitle title={<Trans>Select module</Trans>} /> :
                    <SubTitle title={<Trans>Template configuration</Trans>} />
                }
              />
            </FormGroup>
            {this.rSwitch()}
            {this.rUnSwitch()}
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
