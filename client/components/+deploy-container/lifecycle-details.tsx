import {ActionMeta} from "react-select/src/types";
import {observer} from "mobx-react";
import React from "react";
import {computed, observable} from "mobx";
import {SubTitle} from "../layout/sub-title";
import {Icon} from "../icon";
import {_i18n} from "../../i18n";
import {t, Trans} from "@lingui/macro";
import {Input} from "../input";
import {isNumber, isUrl} from "../input/input.validators";
import {Select, SelectOption} from "../select";
import {lifeCycle, LifeCycle} from "./common";
import {FormControlLabel, Grid, Switch} from "@material-ui/core";

interface Props<T = any> extends Partial<Props> {
  value?: T;
  themeName?: "dark" | "light" | "outlined";

  onChange?(value: T, meta?: ActionMeta<any>): void;
}

@observer
export class LifeCycleDetails extends React.Component<Props> {

  // @observable value: LifeCycle = this.props.value || lifeCycle
  @computed get value(): LifeCycle {
    return this.props.value || lifeCycle;
  }

  get selectOptions() {
    return [
      "HTTP",
      "TCP",
      "Command",
    ]
  }

  formatOptionLabel = (option: SelectOption) => {
    const {value, label} = option;
    return label || (
      <div>
        <Icon small material="layers" className="primary" />
        {value}
      </div>
    );
  }

  rHTTP(of: any) {
    return (
      <>
        <br/>
        <Grid container spacing={5} alignItems="center" direction="row">
          <Grid item xs zeroMinWidth>
            <SubTitle title={<Trans>HTTP</Trans>}/>
            <Input
              placeholder={_i18n._(t`0`)}
              type="number"
              validators={isNumber}
              value={ of.httpPort }
              onChange={value => { of.httpPort = value }}
            />
          </Grid>
          <Grid item xs zeroMinWidth>
            <SubTitle title={<Trans>URL</Trans>}/>
            <Input
              placeholder={_i18n._(t`http://`)}
              value={of.url}
              validators={isUrl}
              onChange={value => { of.url = value }}
            />
          </Grid>
        </Grid>
      </>
    )
  }

  rTCP(of: any) {
    return (
      <>
        <br/>
        <Grid>
          <SubTitle title={<Trans>TCP</Trans>}/>
          <Input
            placeholder={_i18n._(t`0`)}
            type="number"
            validators={isNumber}
            // value={this.value.postStart.tcpPort}
            value={of.tcpPort}
            onChange={value => of.tcpPort = value}
          />
        </Grid>
      </>
    )
  }

  rCommand(of: any) {
    return (
      <>
        <br/>
        <Grid>
          <SubTitle title={<Trans>Command</Trans>}/>
          <Input
            multiLine={true}
            // value={this.value.postStart.command}
            value={of.command}
            onChange={value => of.command = value}
          />
        </Grid>
      </>
    )
  }

  render() {

    return (
      <>
        <FormControlLabel
          control={
            <Switch
              checked={this.value.status}
              color="default"
              onChange={() => {
                this.value.status = !this.value.status
              }}/>
          }
          label={<Trans>LifeCycle</Trans>}
        />
        {this.value.status ?
          <>
            <SubTitle title={<Trans>PostStart</Trans>}/>
            <Select
              formatOptionLabel={this.formatOptionLabel}
              options={this.selectOptions}
              value={this.value.postStart.type}
              onChange={value => this.value.postStart.type = value.value}
            />
            {this.value.postStart.type == "HTTP" ? this.rHTTP(this.value.postStart) : null}
            {this.value.postStart.type == "TCP" ? this.rTCP(this.value.postStart) : null}
            {this.value.postStart.type == "Command" ? this.rCommand(this.value.postStart) : null}

            <SubTitle title={<Trans>PreStop</Trans>}/>
            <Select
              formatOptionLabel={this.formatOptionLabel}
              options={this.selectOptions}
              value={this.value.preStop.type}
              onChange={value => this.value.preStop.type = value.value}
            />
            {this.value.preStop.type == "HTTP" ? this.rHTTP(this.value.postStart) : null}
            {this.value.preStop.type == "TCP" ? this.rTCP(this.value.preStop) : null}
            {this.value.preStop.type == "Command" ? this.rCommand(this.value.preStop) : null}
          </> : null}
      </>
    )
  }
}