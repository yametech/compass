import "./pipeline-save-dialog.scss";

import { observer } from "mobx-react";
import React from "react";
import { computed, observable } from "mobx";
import { ActionMeta } from "react-select/src/types";
import { Trans } from "@lingui/macro";
import { Dialog } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Pipeline } from "../../api/endpoints";
import { Notifications } from "../notifications";
import { PipelineSaveDetails, PipelineResult, pipeline } from "./pipeline-save-details";
import { pipelineTaskResource } from "./pipeline-task";
import { taskStore } from "../+tekton-task/task.store";
import { PipelineVisualDialog } from "./pipeline-visual-dialog";
import { apiManager } from "../../../client/api/api-manager";

interface Props<T = any> extends Partial<Props> {
  value?: T;
  themeName?: "dark" | "light" | "outlined";

  onChange?(value: T, meta?: ActionMeta<any>): void;
}

@observer
export class PipelineSaveDialog extends React.Component<Props> {
  @observable static isOpen = false;
  @observable static Data: Pipeline;

  @observable value: PipelineResult = this.props.value || pipeline;

  static open(pipeline: Pipeline) {
    PipelineSaveDialog.isOpen = true;
    PipelineSaveDialog.Data = pipeline;
  }

  get currentPipeline(): Pipeline {
    return PipelineSaveDialog.Data;
  }

  static close() {
    PipelineSaveDialog.isOpen = false;
  }

  close = () => {
    PipelineSaveDialog.close();
  };

  reset = () => {
    this.value.pipelineName = "";
  };

  onOpen = () => {
    this.value.tasks = [];

    this.currentPipeline.spec.tasks.map((item, index) => {
      let task = taskStore.getByName(item.name);

      this.value.tasks.push(this.currentPipeline.spec.tasks[index]);
      this.value.tasks[index].resources = null;
      this.value.tasks[index].resources = pipelineTaskResource;


      task.spec.workspaces?.map((res, resIndex) => {
        let data: any = { name: "", workspace: "" };
        data.name = res.name;
        data.workspace = "";
        this.value.tasks[index].workspaces[resIndex] = data;
      });


      task.spec.resources?.inputs?.map((task: { name: any }) => {
        this.value.tasks[index].resources.inputs.push({
          name: task.name,
          resource: "",
        });
      });


      task.spec.resources?.outputs?.map((task: { name: any }) => {
        this.value.tasks[index].resources.outputs.push({
          name: task.name,
          resource: "",
        });
      });


      task.spec.params?.map((param: any) => {
        this.value.tasks[index].params.push({ name: param.name, value: "" });
      });


    });

    this.value.tasks.map((item: any, index: number) => {
      if (item.resources === undefined) {
        this.value.tasks[index].resources = pipelineTaskResource;
      }

      if (item.params === undefined) {
        this.value.tasks[index].params = [];
      }
    });

    this.value.pipelineName = this.currentPipeline.metadata.name;
    const resources = this.currentPipeline.spec.resources;
    if (this.currentPipeline.spec.params !== undefined) {
      this.value.params = this.currentPipeline.spec.params;
    }

    if (resources !== undefined) {
      this.value.resources = resources;
    }

    if (this.currentPipeline.spec.workspaces !== undefined) {
      this.value.workspaces = this.currentPipeline.spec.workspaces;
    }
  };

  submit = async () => {
    this.currentPipeline.metadata.name = this.value.pipelineName;
    this.currentPipeline.spec.resources = this.value.resources;
    this.currentPipeline.spec.tasks = this.value.tasks;
    this.currentPipeline.spec.params = this.value.params;
    this.currentPipeline.spec.workspaces = this.value.workspaces;
    try {
      await apiManager.getApi(this.currentPipeline.selfLink).create(
        { namespace: this.currentPipeline.getNs(), name: this.value.pipelineName },
        { ...this.currentPipeline },
      );
      Notifications.ok(<>Pipeline {this.value.pipelineName} save succeeded</>);
    } catch (err) {
      Notifications.error(err);
    } finally {
      this.close();
      PipelineVisualDialog.close();
    }

  };

  render() {
    const header = (
      <h5>
        <Trans>Save Pipeline</Trans>
      </h5>
    );

    return (
      <Dialog
        className="PipelineSaveDialog"
        isOpen={PipelineSaveDialog.isOpen}
        close={this.close}
        onOpen={this.onOpen}
        pinned
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flex gaps column" next={this.submit}>
            <PipelineSaveDetails
              value={this.value}
              onChange={value => { this.value = value.value }}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
