import React from "react";
import {observer} from "mobx-react";
import {ActionMeta} from "react-select/src/types";
import {themeStore} from "../../theme.store";
import {EnvironmentDetails} from "./env-details";
import {BaseDetails} from "./base-details";
import {CommandDetails} from "./command-details";
import {ProbeDetails} from "./probe-details";
import {LifeCycleDetails} from "./lifecycle-details";
import {ArgsDetails} from "./args-details";
import {observable} from "mobx";
import {Container, container} from "./common";
import {VolumeMountDetails} from "./volume-mount";

interface Props<T = any> extends Partial<Props> {
  value?: T;
  themeName?: "dark" | "light" | "outlined";

  onChange?(value: T, meta?: ActionMeta<any>): void;

  args?: boolean;
  base?: boolean;
  commands?: boolean;
  environment?: boolean;
  liveProbe?: boolean;
  lifeCycle?: boolean;
  readyProbe?: boolean;
  volumeMounts?: boolean;
}

@observer
export class ContainerDetails extends React.Component<Props> {

  static defaultProps = {
    args: true,
    base: true,
    commands: true,
    environment: true,
    liveProbe: true,
    lifeCycle: true,
    readyProbe: true,
    volumeMounts: true,
  }

  @observable static value: Container = container;
  private theme = this.props.themeName || themeStore.activeTheme.type;

  get value() {
    return this.props.value || container;
  }

  render() {
    const {base, commands, args, environment, readyProbe, liveProbe, lifeCycle, volumeMounts} = this.props;
    return (
      <>
        {base ?
          <BaseDetails
            themeName={this.theme} value={this.value.base}
            onChange={(value) => this.value.base = value}
          /> : null}
        <br/>
        {/* {readyProbe ?
          <ProbeDetails
            className={"ReadyProbe"}
            themeName={this.theme}
            value={this.value.readyProbe}
            onChange={(value) => this.value.readyProbe = value}
          /> : null}
        <br/>
        {liveProbe ?
          <ProbeDetails
            className={"LiveNessProbe"}
            themeName={this.theme}
            value={this.value.liveProbe}
            onChange={(value) => this.value.liveProbe = value}
          /> : null}
        <br/>
        {lifeCycle ?
          <LifeCycleDetails
            themeName={this.theme} value={this.value.lifeCycle}
            onChange={(value) => this.value.lifeCycle = value}
          /> : null}
        <br/> */}
        {environment ?
          <EnvironmentDetails
            themeName={this.theme}
            value={this.value.environment}
            onChange={(value) => this.value.environment = value}
          /> : null}
        <br/>
        {commands ?
          <CommandDetails
            themeName={this.theme}
            value={this.value.commands}
            onChange={(value) => this.value.commands = value}
          /> : null}
        <br/>
        {args ?
          <ArgsDetails
            themeName={this.theme}
            value={this.value.args}
            onChange={(value) => this.value.args = value}
          /> : null}
        <br/>
        {volumeMounts ?
          <VolumeMountDetails
            themeName={this.theme}
            value={this.value.volumeMounts}
            onChange={(value) => this.value.volumeMounts = value}
          /> : null}
      </>
    )
  }
}