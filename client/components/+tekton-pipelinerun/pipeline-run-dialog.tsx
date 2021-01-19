import "./pipeline-run-dialog.scss";
import {observer} from "mobx-react";
import React from "react";
import {observable} from "mobx";
import {SubTitle} from "../layout/sub-title";
import {Input} from "../input";
import {_i18n} from "../../i18n";
import {ActionMeta} from "react-select/src/types";
import {Trans} from "@lingui/macro";
import {Dialog} from "../dialog";
import {Wizard, WizardStep} from "../wizard";
import {
  Param,
  Pipeline,
  PipelineRef,
  PipelineResourceBinding,
  pipelineRunApi,
  WorkspaceBinding,
} from "../../api/endpoints";
import {Notifications} from "../notifications";
import {PipelineRunResourceDetails} from "./pipeline-run-resource-details";
import {systemName} from "../input/input.validators";
import {ParamsDetails, PipelineRunWorkspaces,} from "../+tekton-common";
import {IKubeObjectMetadata} from "../../api/kube-object";

interface Props<T = any> extends Partial<Props> {
  value?: T;
  themeName?: "dark" | "light" | "outlined";
  namespace?: string;
  onChange?(value: T, meta?: ActionMeta<any>): void;
}

export interface PipelineRunResult {
  name: string;
  namespace?: string;
  pipelineRef: PipelineRef;
  resources?: PipelineResourceBinding[];
  serviceAccountName?: string;
  workspces: WorkspaceBinding[];
  params?: Param[];
}

export const ref: PipelineRef = {
  name: "",
};

export const pipelineRunResult: PipelineRunResult = {
  name: "",
  serviceAccountName: "default",
  pipelineRef: ref,
  resources: [],
  workspces: [],
  params: [],
};

@observer
export class PipelineRunDialog extends React.Component<Props> {
  @observable static isOpen = false;
  @observable static pipelineData: Pipeline = null;
  @observable graph: any = null;
  // @observable nameSpace: string = "";
  @observable value: PipelineRunResult = this.props.value || pipelineRunResult;

  // @computed get value(): PipelineRunResult {
  //   return this.props.value || pipelineRunResult;
  // }

  static open(pipeline: Pipeline) {
    PipelineRunDialog.isOpen = true;
    PipelineRunDialog.pipelineData = pipeline;
  }

  static close() {
    PipelineRunDialog.isOpen = false;
  }

  close = () => {
    this.value.resources = [];
    this.value.params = [];
    this.reset();
    PipelineRunDialog.close();
  };

  get pipeline() {
    return PipelineRunDialog.pipelineData;
  }

  onOpen = () => {
    this.value.pipelineRef.name = this.pipeline.getName();
    this.value.name = this.pipeline.getName() + "-" + Math.round(new Date().getTime() / 1000);
    this.value.namespace = this.pipeline.getNs();

    //fill the  resources

    this.pipeline.spec?.resources?.map((item: any, index: number) => {
      let resources: PipelineResourceBinding = {
        name: item.name,
        resourceRef: { name: "" },
      };
      this.value.resources.push(resources);
    });

    this.pipeline.spec?.params?.map((item: any, index: number) => {
      let params: Param = {
        name: item.name,
        value: ''
      };
      this.value.params.push(params);
    });

  };

  submit = async () => {
    try {
      /*// create a pipeline run
      const runNodeData = pipelineStore.getNodeData(this.pipeline);
      let width = 1000;
      let height = 1000;
      const nodeSize = pipelineStore.getNodeSize(this.pipeline);
      if (nodeSize != null) {
        width = nodeSize.width;
        height = nodeSize.height;
      }

      const graph = await tektonGraphStore.create(
        {
          name: "run-" + this.pipeline.getName() + "-" + new Date().getTime().toString(),
          namespace: this.pipeline.getNs(),
          labels: new Map<string, string>().set("namespace", this.pipeline.getValueFromLabels("namespace")),
        },
        {
          spec: {
            data: JSON.stringify(runNodeData),
            width: width,
            height: height,
          },
        }
      );

      const pipelineRun: Partial<PipelineRun> = {
        metadata: {
          name: this.value.name,
          annotations: Object.fromEntries(new Map<string, string>().set(runGraphAnnotationKey, graph.getName())),
        } as IKubeObjectMetadata,
        spec: {
          resources: this.value.resources,
          pipelineRef: this.value.pipelineRef,
          serviceAccountName: this.value.serviceAccountName,
          workspaces: this.value.workspces,
          params: this.value.params,
        },
      };



      let resultObject: any = await pipelineRunApi.create(
        { name: this.value.name, namespace: this.pipeline.getNs() },
        { ...pipelineRun }
      );

      // const currentPipelineRun = resultObject["Object"] as PipelineRun
      const currentPipelineRun = resultObject as PipelineRun
      const ownerReferences: OwnerReferences = {
        apiVersion: currentPipelineRun.metadata.resourceVersion,
        kind: currentPipelineRun.kind,
        name: this.pipeline.metadata.name,
        uid: currentPipelineRun.metadata.uid,
        controller: false,
        blockOwnerDeletion: false,
      }
      graph.addOwnerReferences([ownerReferences]);
      await tektonGraphStore.update(graph, { ...graph })*/

      await pipelineRunApi.post({path:  this.pipeline.selfLink + "/run"},{
        metadata: {
          name: this.value.name,
          namespace: this.value.namespace
        } as IKubeObjectMetadata,
        spec: {
          resources: this.value.resources,
          pipelineRef: this.value.pipelineRef,
          serviceAccountName: this.value.serviceAccountName,
          workspaces: this.value.workspces,
          params: this.value.params,
        },
      })

      Notifications.ok(<>PipelineRun {this.value.name} Run Success</>);
      this.close();
    } catch (err) {
      Notifications.error(err);
    }
  };

  reset = () => {
    this.graph = null;
  };

  render() {
    const header = (<h5><Trans>Pipeline Run</Trans></h5>);

    return (
      <Dialog
        isOpen={PipelineRunDialog.isOpen}
        className="PipelineRunDialog"
        close={this.close}
        onOpen={this.onOpen}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flex gaps column" next={this.submit}>
            <SubTitle title={<Trans>Name</Trans>} />
            <Input
              placeholder={_i18n._("Pipeline Run Name")}
              disabled={true}
              validators={systemName}
              value={this.value.name}
              onChange={(value) => (this.value.name = value)}
            />
            <SubTitle title={<Trans>Pipeline Ref</Trans>} />
            <Input
              placeholder={_i18n._("Pipeline Ref")}
              disabled={true}
              value={this.value?.pipelineRef?.name}
              onChange={(value) => (this.value.pipelineRef.name = value)}
            />
            <SubTitle title={<Trans>Service Account Name</Trans>} />
            <Input
              disabled={true}
              placeholder={_i18n._("Service Account Name")}
              value={this.value?.serviceAccountName}
              onChange={(value) => (this.value.serviceAccountName = value)}
            />
            <br />
            <ParamsDetails
              value={this.value?.params}
              disable={true}
              onChange={(value) => { this.value.params = value }}
            />
            <PipelineRunResourceDetails
              disable={true}
              value={this.value?.resources}
              namespace={this.value?.namespace}
              onChange={(value) => { this.value.resources = value; }}
            />
            <br />
            <PipelineRunWorkspaces
              value={this.value?.workspces}
              disable={true}
              onChange={(value) => { this.value.workspces = value; }}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
