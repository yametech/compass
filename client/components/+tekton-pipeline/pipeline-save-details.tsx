import { observer } from "mobx-react";
import React from "react";
import {
  PipelineParamsDetails,
  PipelineWorkspaces,
  PipelineResourceDetails,
} from "../+tekton-common";
import {computed, observable} from "mobx";
import { ActionMeta } from "react-select/src/types";
import { SubTitle } from "../layout/sub-title";
import { Input } from "../input";
import { PipelineSpec } from "../../api/endpoints";
import { MultiPipelineTaskStepDetails } from "./multi-pipeline-task-ref-details";
import { pipelineTask } from "./pipeline-task";
import { systemName } from "../input/input.validators";

interface Props<T = any> extends Partial<Props> {
  value?: T;
  onChange?(value: T, meta?: ActionMeta<any>): void;

  themeName?: "dark" | "light" | "outlined";
}

export interface PipelineResult extends PipelineSpec {
  pipelineName: string;
}

export const pipeline: PipelineResult = {
  pipelineName: "",
  resources: [],
  tasks: [pipelineTask],
  params: [],
  workspaces: [],
};

@observer
export class PipelineSaveDetails extends React.Component<Props> {

  @observable value: PipelineResult = this.props.value || pipeline;
  
  render() {
    return (
      <div>
        <SubTitle title={"Pipeline Name"} />
        <Input
          value={this.value.pipelineName}
          disabled={true}
          validators={systemName}
          onChange={(value) => { this.value.pipelineName = value }}
        />
        <br/>
        <PipelineParamsDetails
          value={this.value.params}
          onChange={(value) => { this.value.params = value }}
        />
        <PipelineResourceDetails
          value={this.value.resources}
          onChange={(value) => {
            this.value.resources = value.value;
          }}
        />
        <PipelineWorkspaces
          value={this.value.workspaces}
          onChange={(value) => {this.value.workspaces = value }}
        />
        <br/>
        <MultiPipelineTaskStepDetails
          disable={true}
          value={this.value.tasks}
          onChange={(value) => { this.value.tasks = value }}
        />
      </div>
    );
  }
}
