import "./service-details.scss";

import React from "react";
import {observer} from "mobx-react";
import {SubTitle} from "../layout/sub-title";
import {t, Trans} from "@lingui/macro";
import {Select} from "../select";
import {Icon} from "../icon";
import {_i18n} from "../../i18n";
import {Input} from "../input";
import {isNumber} from "../input/input.validators";
import {computed, observable} from "mobx";
import {deployPort, deployService, Service} from "./common";
import {ActionMeta} from "react-select/src/types";
import {Paper, Grid} from "@material-ui/core";
import {stopPropagation} from "../../utils";

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

export interface Props<T = any> extends Partial<Props> {
  value?: T;
  showIcons?: boolean;
  themeName?: "dark" | "light" | "outlined";

  onChange?(value: T, meta?: ActionMeta<any>): void;
}

@observer
export class DeployServiceDetails extends React.Component<Props> {

  // @observable value: Service = this.props.value || deployService;
  @observable Index: number = 0;
  @computed get value(): Service {
    return this.props.value || deployService;
  }

  get typeOptions() {
    return [
      "ClusterIP",
      "NodePort",
      "LoadBalancer",
    ]
  }

  get protocolOptions() {
    return [
      "TCP",
      "UDP"
    ]
  }

  add() {
    this.value.ports.push(deployPort)
  }

  remove(index: number) {
    this.value.ports.splice(index, 1);
  }

  rPorts(index: number) {
    return (
      <div key={`ports${index}`}>
        <br/>
        <Paper elevation={3} style={{padding: 25}}>
          <Grid container spacing={2} alignItems="center" direction="row">
            <Grid item xs={11} zeroMinWidth>
              <Grid>
                <SubTitle title={<Trans>Name</Trans>}/>
                <Input
                  className="item"
                  required={true}
                  placeholder={_i18n._(t`Name`)}
                  value={this.value.ports[index].name}
                  onChange={(value) => {
                    this.value.ports[index].name = value;
                  }}
                />
                <SubTitle title={<Trans>Protocol</Trans>}/>
                <Select
                  options={this.protocolOptions}
                  value={this.value.ports[index].protocol}
                  onChange={v => {
                    this.value.ports[index].protocol = v.value;
                  }}
                />
              </Grid>
              <br/>
              <Grid container spacing={5} alignItems="center" direction="row">
                <Grid item xs zeroMinWidth>
                  <SubTitle title={<Trans>Port</Trans>}/>
                  <Input
                    required={true}
                    placeholder={_i18n._(t`Port`)}
                    type="number"
                    validators={isNumber}
                    value={this.value.ports[index].port}
                    onChange={value => this.value.ports[index].port = value}
                  />
                </Grid>
                <Grid item xs zeroMinWidth>
                  <SubTitle title={<Trans>TargetPort</Trans>}/>
                  <Input
                    required={true}
                    placeholder={_i18n._(t`TargetPort`)}
                    type="number"
                    validators={isNumber}
                    value={this.value.ports[index].targetPort}
                    onChange={value => this.value.ports[index].targetPort = value}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs zeroMinWidth style={{textAlign: "center"}}>
              <Icon
                small
                tooltip={_i18n._(t`Remove Ports`)}
                className="remove-icon"
                material="clear"
                ripple="secondary"
                onClick={(e) => {
                  this.remove(index);
                  e.stopPropagation()
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </div>
    )
  }

  render() {

    return (
      <>
        <SubTitle title={<Trans>Service Type</Trans>}/>
        <Select
          isClearable
          options={this.typeOptions}
          value={this.value.type}
          onChange={v => {
            this.value.type = v.value
          }}
        />
        <SubTitle
          title={
            <>
              <Trans>Ports</Trans>
              &nbsp;&nbsp;
              <Icon material={"add_circle"} className={"add_circle"} onClick={event => {
                stopPropagation(event);
                this.add()
              }} />
            </>
          }>
        </SubTitle>
        {this.value.ports.map((item: any, index: number) => {
          return this.rPorts(index)
        })}
      </>
    )
  }

}