import "./add-pipelineresource-dialog.scss"

import { observer } from "mobx-react";
import React from "react";
import { observable } from "mobx";
import { SubTitle } from "../layout/sub-title";
import { Input } from "../input";
import { _i18n } from "../../i18n";
import { ActionMeta } from "react-select/src/types";
import { Dialog } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { pipelineResourceApi, storageClassApi } from "../../api/endpoints";
import { Notifications } from "../notifications";
import { Select, SelectOption } from "../select";
import { Icon } from "../icon";
import { Params } from "../+tekton-common";
import { configStore } from "../../config.store";
import { Trans } from "@lingui/macro";
import { PipelineResourceParamsDetails } from "./pipelineresource-params-details"

interface Props<T = any> extends Partial<Props> {
  value?: T;
  themeName?: "dark" | "light" | "outlined";

  onChange?(value: T, meta?: ActionMeta<any>): void;
}

@observer
export class AddPipelineResourceDialog extends React.Component<Props> {
  @observable static isOpen = false;
  // @observable prefix: string = configStore.getDefaultNamespace();
  @observable name: string = "";
  @observable type: string = "git";
  @observable params: Params[] = [];

  static open() {
    AddPipelineResourceDialog.isOpen = true;
  }

  static close() {
    AddPipelineResourceDialog.isOpen = false;
  }

  close = () => {
    AddPipelineResourceDialog.close();
  };

  reset = () => {
    this.name = "";
    this.type = "git";
  };

  get selectOptions() {
    return ["git", "image"];
  }

  formatOptionLabel = (option: SelectOption) => {
    const { value, label } = option;
    return (
      label || (
        <>
          <Icon small material="layers" className="primary" />
          {value}
        </>
      )
    );
  };

  submit = async () => {

    const { name, type, params } = this;
    try {
      await pipelineResourceApi.create(
        {
          name: name,
          namespace: configStore.getOpsNamespace(),
          labels: new Map<string, string>().set("namespace", configStore.getDefaultNamespace()),
        },
        {
          spec: {
            type: type,
            params: params,
          },
        }
      );
      this.reset();
      Notifications.ok(
        <>PipelineResource {name} save succeeded</>
      );
      this.close();
    } catch (err) {
      Notifications.error(err);
    }
  };

  add = () => {
    this.params.push({
      name: "",
      value: "",
    });
  };

  remove = (index: number) => {
    this.params.splice(index, 1);
  };



  render() {
    const header = (
      <h5>
        <Trans>Create Pipeline Resource</Trans>
      </h5>
    );

    return (
      <Dialog
        isOpen={AddPipelineResourceDialog.isOpen}
        className="AddPipelineResourceDialog"
        close={this.close}>
        <Wizard
          header={header}
          done={this.close}
        >
          <WizardStep contentClass="flex gaps column" next={this.submit}>
            <SubTitle title={"Pipeline Resource Name"} />
            <Input
              required={true}
              placeholder={_i18n._("Pipeline Resource Name")}
              value={this.name}
              onChange={(value) => (this.name = value)}
            />
            <SubTitle title={"Type"} />
            <Select
              className="Type"
              formatOptionLabel={this.formatOptionLabel}
              options={this.selectOptions}
              value={this.type}
              onChange={(value) => (this.type = value.value)}
            />
            <br />

            <PipelineResourceParamsDetails
              value={this.params}
            />

          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
