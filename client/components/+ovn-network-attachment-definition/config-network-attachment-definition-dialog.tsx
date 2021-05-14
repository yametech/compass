import "./config-network-attachment-definition-dialog.scss";

import React from "react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Notifications } from "../notifications";
import {
  NetworkAttachmentDefinitionConfig,
  networkAttachmentDefinitionConfig,
  NetworkAttachmentDefinition,
} from "../../api/endpoints";
import { IPInput } from "../ip";
import { SubTitle } from "../layout/sub-title";
import { Select } from "../select";
import { Input } from "../input";
import { networkAttachmentDefinitionStore } from "./network-attachment-definition.store";
import { createMuiTheme, Grid, Paper } from "@material-ui/core";
import { Icon } from "../icon";
import { stopPropagation } from "../../utils";
import { ThemeProvider } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";

const theme = createMuiTheme({
  overrides: {
    MuiExpansionPanelDetails: {
      root: {
        display: "gird",
      },
    },
    MuiPaper: {
      root: {
        color: "",
      },
    },
  },
});

interface Props extends DialogProps {
}

@observer
export class ConfigNetworkAttachmentDefinitionDialog extends React.Component<Props> {

  @observable static isOpen = false;
  @observable static data: NetworkAttachmentDefinition = null;
  @observable name: string = "";
  @observable namespace: string = "";
  @observable config: NetworkAttachmentDefinitionConfig = networkAttachmentDefinitionConfig;

  static open(data: NetworkAttachmentDefinition) {
    ConfigNetworkAttachmentDefinitionDialog.data = data;
    ConfigNetworkAttachmentDefinitionDialog.isOpen = true;
  }

  get object() {
    return ConfigNetworkAttachmentDefinitionDialog.data;
  }

  static close() {
    ConfigNetworkAttachmentDefinitionDialog.isOpen = false;
  }

  onOpen = () => {
    this.config = this.object.getConfig();
    this.name = this.object.getName();
    this.namespace = this.object.getNs();
  }

  reset() {
    this.name = "";
    this.namespace = "";
    this.config = networkAttachmentDefinitionConfig;
    ConfigNetworkAttachmentDefinitionDialog.data = null;
  }

  close = () => {
    ConfigNetworkAttachmentDefinitionDialog.close();
    this.reset();
  }

  add = () => {
    this.config.plugins.push({
      type: "macvlan",
      mode: "bridge",
      ipam: {
        type: 'host-local',
        routes: [{ "dst": "0.0.0.0/0" }]
      }
    });
  }

  remove = (index: number) => {
    this.config.plugins.splice(index, 1);
  }

  addRoutes = (pluginIndex: number) => {
    this.config.plugins[pluginIndex].addroutes.push({
      dst: "0.0.0.0/0",
      gw: "0.0.0.0",
    })
  }

  removeRoutes = (pluginIndex: number, index: number) => {
    this.config.plugins[pluginIndex].addroutes.splice(index, 1);
  }

  addDelRoutes = (pluginIndex: number) => {
    this.config.plugins[pluginIndex].delroutes.push({
      dst: "0.0.0.0/0",
    })
  }

  removeDelRoutes = (pluginIndex: number, index: number) => {
    this.config.plugins[pluginIndex].delroutes.splice(index, 1);
  }

  rAddRoutes(pluginIndex: number, index: number) {
    return (
      <>
        <br />
        <Grid container alignItems="center" direction="row">
          <Grid item xs={11} zeroMinWidth>
            <SubTitle title={`destination`} />
            <IPInput
              isIPv4CIDR={true}
              value={this.config.plugins[pluginIndex]?.addroutes[index]?.dst}
              onChange={(value: string) => {
                this.config.plugins[pluginIndex].addroutes[index].dst = value
              }} />
            <SubTitle title={`gateway`} />
            <IPInput
              value={this.config.plugins[pluginIndex]?.addroutes[index]?.gw}
              onChange={(value: string) => {
                this.config.plugins[pluginIndex].addroutes[index].gw = value
              }} />
          </Grid>
          <Grid item xs zeroMinWidth>
            <Icon
              small
              tooltip={`Remove`}
              className="remove-icon"
              material="clear"
              onClick={(event) => {
                this.removeRoutes(pluginIndex, index);
                stopPropagation(event);
              }}
            />
          </Grid>
        </Grid>
      </>
    )
  }

  rDelRoutes(pluginIndex: number, index: number) {
    return (
      <>
        <br />
        <Grid container alignItems="center" direction="row">
          <Grid item xs={11} zeroMinWidth>
            <SubTitle title={`destination`} />
            <IPInput
              isIPv4CIDR={true}
              value={this.config.plugins[pluginIndex]?.delroutes[index]?.dst}
              onChange={(value: string) => {
                this.config.plugins[pluginIndex].delroutes[index].dst = value
              }} />
          </Grid>
          <Grid item xs zeroMinWidth>
            <Icon
              small
              tooltip={`Remove`}
              className="remove-icon"
              material="clear"
              onClick={(event) => {
                this.removeDelRoutes(pluginIndex, index);
                stopPropagation(event);
              }}
            />
          </Grid>
        </Grid>
      </>
    )
  }

  rPlugin(index: number) {
    return (
      <Paper elevation={3} style={{ padding: 25 }}>
        <Grid container spacing={5} alignItems="center" direction="row">
          <Grid item xs={11} zeroMinWidth>
            <SubTitle title={`type`} />
            <Select
              value={this.config.plugins[index]?.type}
              options={['macvlan', 'route-override']}
              onChange={
                (value) => {
                  this.config.plugins[index].type = value.value;
                  if (this.config.plugins[index].type == 'macvlan') {
                    this.config.plugins[index].ipam = { type: 'host-local', routes: [{ "dst": "0.0.0.0/0" }] };
                    this.config.plugins[index].master = "";
                    this.config.plugins[index].mode = "bridge";

                    delete this.config.plugins[index].delroutes;
                    delete this.config.plugins[index].addroutes;
                  }
                  if (this.config.plugins[index].type == 'route-override') {
                    this.config.plugins[index].delroutes = [];
                    this.config.plugins[index].addroutes = [];
                    this.config.plugins[index].flushroutes = true;

                    delete this.config.plugins[index].ipam;
                    delete this.config.plugins[index].master;
                    delete this.config.plugins[index].mode;
                  }
                }
              }
            />
            {
              this.config.plugins[index]?.type == 'macvlan' ?
                <>
                  <SubTitle title={`master`} />
                  <Input
                    required
                    value={this.config.plugins[index]?.master}
                    onChange={(value) => this.config.plugins[index].master = value}
                  />
                  <SubTitle title={`mode :`} children={'bridge'} />
                  <SubTitle title={`IPAM type`} />
                  <Select
                    value={this.config.plugins[index]?.ipam.type}
                    options={['host-local', 'global-ipam']}
                    onChange={
                      (value) => this.config.plugins[index].ipam.type = value.value
                    }
                  />
                  <SubTitle title={`IPAM RangeStart`} />
                  <IPInput
                    value={this.config.plugins[index]?.ipam.rangeStart}
                    onChange={(value: string) => {
                      this.config.plugins[index].ipam.rangeStart = value
                    }} />
                  <SubTitle title={`IPAM RangeEnd`} />
                  <IPInput
                    value={this.config.plugins[index]?.ipam.rangeEnd}
                    onChange={(value: string) => {
                      this.config.plugins[index].ipam.rangeEnd = value
                    }} />
                  <SubTitle title={`IPAM SubNet`} />
                  <IPInput
                    value={this.config.plugins[index]?.ipam.subnet}
                    isIPv4CIDR
                    onChange={(value: string) => {
                      this.config.plugins[index].ipam.subnet = value
                    }} />

                  {
                    this.config.plugins[index].ipam.type == 'global-ipam' ?
                      <>
                        <SubTitle title={`EtcdURL`} />
                        <Input
                          required
                          value={this.config.plugins[index]?.ipam.etcdConfig.etcdURL}
                          onChange={(value) => this.config.plugins[index].ipam.etcdConfig.etcdURL = value}
                        />
                        <SubTitle title={`etcdCertFile`} />
                        <Input
                          value={this.config.plugins[index]?.ipam.etcdConfig.etcdCertFile}
                          onChange={(value) => this.config.plugins[index].ipam.etcdConfig.etcdCertFile = value}
                        />
                        <SubTitle title={`etcdKeyFile`} />
                        <Input
                          value={this.config.plugins[index]?.ipam.etcdConfig.etcdKeyFile}
                          onChange={(value) => this.config.plugins[index].ipam.etcdConfig.etcdKeyFile = value}
                        />
                        <SubTitle title={`etcdTrustedCAFileFile`} />
                        <Input
                          value={this.config.plugins[index]?.ipam.etcdConfig.etcdTrustedCAFileFile}
                          onChange={(value) => this.config.plugins[index].ipam.etcdConfig.etcdTrustedCAFileFile = value}
                        />
                      </> : null
                  }
                </> : null
            }
            {
              this.config.plugins[index]?.type == 'route-override' ?
                <>
                  <SubTitle title={`flushRoutes`} children={
                    <Switch
                      checked={this.config.plugins[index]?.flushroutes}
                      onChange={(event) =>
                        this.config.plugins[index].flushroutes = event.target.checked
                      }
                      name="flushroutes"
                      inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                  } />
                  <SubTitle
                    title={
                      <>
                        AddRoutes
                        &nbsp;&nbsp;
                        <Icon material={"edit"} className={"editIcon"} onClick={event => {
                          this.addRoutes(index);
                          stopPropagation(event);
                        }} small />
                      </>
                    }>
                  </SubTitle>
                  {this.config.plugins[index]?.addroutes.map(
                    (item, addRouteIndex) => this.rAddRoutes(index, addRouteIndex)
                  )}
                  <SubTitle
                    title={
                      <>
                        DelRoutes
                        &nbsp;&nbsp;
                        <Icon material={"edit"} className={"editIcon"} onClick={event => {
                          this.addDelRoutes(index);
                          stopPropagation(event);
                        }} small />
                      </>
                    }>
                  </SubTitle>
                  {this.config.plugins[index]?.delroutes.map(
                    (item, delRouteIndex) => this.rDelRoutes(index, delRouteIndex)
                  )}
                </> : null
            }
          </Grid>
          <Grid item xs zeroMinWidth>
            <Icon
              small
              tooltip={`Remove`}
              className="remove-icon"
              material="clear"
              onClick={(event) => {
                this.remove(index);
                stopPropagation(event);
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    )
  }

  configNetworkAttachmentDefinition = async () => {
    try {
      await networkAttachmentDefinitionStore.update(this.object, {
        spec: {
          config: JSON.stringify(this.config)
        }
      })
      Notifications.ok(
        <>NetworkAttachmentDefinition {name} save succeeded</>
      );
      this.close();
    } catch (err) {
      Notifications.error(err);
    }
  }

  render() {
    const { ...dialogProps } = this.props;
    const header = <h5>Config NetworkAttachmentDefinition</h5>;

    return (
      <ThemeProvider theme={theme}>
        <Dialog {...dialogProps}
          className="ConfigNetworkAttachmentDefinitionDialog"
          isOpen={ConfigNetworkAttachmentDefinitionDialog.isOpen}
          close={this.close}
          onOpen={this.onOpen}>
          <Wizard header={header} done={this.close}>
            <WizardStep contentClass="flex gaps column"
              nextLabel={`Config NetworkAttachmentDefinition`} next={this.configNetworkAttachmentDefinition}>
              <SubTitle title={`name :`} children={this.name} />
              <SubTitle title={`namespace :`} children={this.namespace} />
              <SubTitle
                title={
                  <>
                    Plugins
                    &nbsp;&nbsp;
                    <Icon material={"edit"} className={"editIcon"} onClick={event => {
                      this.add();
                      stopPropagation(event);
                    }} small />
                  </>
                }>
              </SubTitle>
              {this.config.plugins?.map((item, index) => this.rPlugin(index))}
            </WizardStep>
          </Wizard>
        </Dialog>
      </ThemeProvider>
    )
  }
}