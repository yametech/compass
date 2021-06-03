import { t, Trans } from "@lingui/macro";
import { computed } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { ActionMeta } from "react-select/src/types";
import { _i18n } from "../../i18n";
import { Input } from "../input";
import { systemName } from "../input/input.validators";
import { SubTitle } from "../layout/sub-title";
import { Select } from "../select";
import { app, App } from "./common";

interface Props<T = any> extends Partial<Props> {
  showIcons?: boolean;
  value?: T;
  themeName?: "dark" | "light" | "outlined";

  onChange?(value: T, meta?: ActionMeta<any>): void;
}

@observer
export class AppDetails extends React.Component<Props> {

  // @observable value: App = this.props.value || app;
  @computed get value(): App {
    return this.props.value || app;
  }

  get typeOptions() {
    return [
      "Stone",
      // "Water",
      "Deployment",
      // "Statefulset"
    ]
  }

  render() {
    return (
      <>
        <SubTitle title={<Trans>App Type</Trans>} />
        <Select
          options={this.typeOptions}
          value={this.value.type}
          onChange={v => this.value.type = v.value}
        />
        <SubTitle title={<Trans>App Name</Trans>}/>
        <Input
          autoFocus required
          validators={systemName}
          placeholder={_i18n._(t`Name`)}
          value={this.value.name}
          onChange={v => this.value.name = v}
        />
      </>
    )
  }
}