import React from "react";
import {ActionMeta} from "react-select/src/types";
import {observer} from "mobx-react";
import {computed, observable} from "mobx";
import {SubTitle} from "../layout/sub-title";
import {Icon} from "../icon";
import {_i18n} from "../../i18n";
import {t, Trans} from "@lingui/macro";
import {Input} from "../input";
import {isNumber, isUrl} from "../input/input.validators";
import {Select, SelectOption} from "../select";
import {liveProbe, Probe} from "./common";
import {FormControlLabel, Grid, Switch} from "@material-ui/core";

interface Props<T = any> extends Partial<Props> {
  value?: T;
  themeName?: "dark" | "light" | "outlined";
  className?: string

  onChange?(value: T, meta?: ActionMeta<any>): void;
}

@observer
export class ProbeDetails extends React.Component<Props> {

  static defaultProps = {
    className: "Probe"
  }

  // @observable value: Probe = this.props.value || liveProbe;
  @computed get value(): Probe {
    return this.props.value || liveProbe;
  }

  get selectOptions() {
    return [
      "HTTP",
      "TCP",
      "Command",
    ];
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

  rBase() {
    return (
      <Grid container spacing={5} alignItems="center" direction="row">
        <Grid item xs zeroMinWidth>
          <SubTitle title={<Trans>Timeout</Trans>}/>
          <Input
            placeholder={_i18n._(t`0`)}
            type="number"
            validators={isNumber}
            value={this.value.timeout}
            onChange={value => this.value.timeout = value}
          />
          <SubTitle title={<Trans>Period</Trans>}/>
          <Input
            placeholder={_i18n._(t`0`)}
            type="number"
            validators={isNumber}
            value={this.value.cycle}
            onChange={value => this.value.cycle = value}
          />
        </Grid>
        <Grid item xs zeroMinWidth>
          <SubTitle title={<Trans>Failure</Trans>}/>
          <Input
            placeholder={_i18n._(t`0`)}
            type="number"
            validators={isNumber}
            value={this.value.retryCount}
            onChange={value => this.value.retryCount = value}
          />
          <SubTitle title={<Trans>InitialDelay</Trans>}/>
          <Input
            placeholder={_i18n._(t`0`)}
            type="number"
            validators={isNumber}
            value={this.value.delay}
            onChange={value => this.value.delay = value}
          />
        </Grid>
      </Grid>
    )
  }

  rHTTP() {
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
              value={this.value.pattern.httpPort}
              onChange={value => this.value.pattern.httpPort = value}
            />
          </Grid>
          <Grid item xs zeroMinWidth>
            <SubTitle title={<Trans>URL</Trans>}/>
            <Input
              placeholder={_i18n._(t`http://`)}
              validators={isUrl}
              value={this.value.pattern.url}
              onChange={value => this.value.pattern.url = value}
            />
          </Grid>
        </Grid>
      </>
    )
  }

  rTCP() {
    return (
      <>
        <br/>
        <Grid>
          <SubTitle title={<Trans>TCP</Trans>}/>
          <Input
            placeholder={_i18n._(t`0`)}
            type="number"
            validators={isNumber}
            value={this.value.pattern.tcpPort}
            onChange={value => this.value.pattern.tcpPort = value}
          />
        </Grid>
      </>
    )
  }

  rCommand() {
    return (
      <>
        <br/>
        <Grid>
          <SubTitle title={<Trans>Command</Trans>}/>
          <Input
            multiLine={true}
            maxRows={5}
            value={this.value.pattern.command}
            onChange={value => this.value.pattern.command = value}
          />
        </Grid>
      </>
    )
  }

  render() {

    const {className} = this.props;

    return (
      <>
        <FormControlLabel
          control={
            <Switch
              color="default"
              checked={this.value.status}
              onChange={() => {
                this.value.status = !this.value.status
              }}
            />
          }
          label={_i18n._(className)}
        />
        {this.value.status ?
          <>
            {this.rBase()}
            <SubTitle title={<Trans>Pattern Type</Trans>}/>
            <Select
              formatOptionLabel={this.formatOptionLabel}
              options={this.selectOptions}
              value={this.value.pattern.type}
              onChange={value => this.value.pattern.type = value.value}
            />
            {this.value.pattern.type == "HTTP" ? this.rHTTP() : null}
            {this.value.pattern.type == "TCP" ? this.rTCP() : null}
            {this.value.pattern.type == "Command" ? this.rCommand() : null}
          </> : null}
      </>
    )
  }
}