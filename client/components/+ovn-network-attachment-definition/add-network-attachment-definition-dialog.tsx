import "./add-network-attachment-definition-dialog.scss";

import React from "react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Notifications } from "../notifications";
import {
  networkAttachmentDefinitionApi,
  NetworkAttachmentDefinitionConfig,
  networkAttachmentDefinitionConfig,
} from "../../api/endpoints";
import { IPInput } from "../ip";
import { SubTitle } from "../layout/sub-title";
import { Input } from "../input";
import { Icon } from "../icon";
import { stopPropagation } from "../../utils";
import { createMuiTheme, Grid, Paper } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";
import { Select } from "../select";
import { NamespaceSelect } from "../+namespaces/namespace-select";
import Switch from '@material-ui/core/Switch';

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
export class AddNetworkAttachmentDefinitionDialog extends React.Component<Props> {

  @observable static isOpen = false;
  @observable name: string = "";
  @observable namespace: string = "";
  @observable config: NetworkAttachmentDefinitionConfig = networkAttachmentDefinitionConfig;
  @observable routes: { [key: string]: string }[] = [{ "dst": "0.0.0.0/0" }];

  static open() {
    AddNetworkAttachmentDefinitionDialog.isOpen = true;
  }

  static close() {
    AddNetworkAttachmentDefinitionDialog.isOpen = false;
  }

  reset() {
    this.config = networkAttachmentDefinitionConfig;
    this.name = "";
  }

  close = () => {
    AddNetworkAttachmentDefinitionDialog.close();
    this.reset();
  }

  addNetworkAttachmentDefinition = async () => {
    try {
      this.config.name = this.name;
      await networkAttachmentDefinitionApi.create({ name: this.name, namespace: this.namespace }, {
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
              ripple="secondary"
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
              ripple="secondary"
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
                        <Icon material={"add_circle"} className={"add_circle"} onClick={event => {
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
                        <Icon material={"add_circle"} className={"add_circle"} onClick={event => {
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
              ripple="secondary"
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

  render() {
    const { ...dialogProps } = this.props;
    const header = <h5>Create NetworkAttachmentDefinition</h5>;
    return (
      <ThemeProvider theme={theme}>
        <Dialog {...dialogProps} className="AddNetworkAttachmentDefinitionDialog"
          isOpen={AddNetworkAttachmentDefinitionDialog.isOpen} close={this.close}>
          <Wizard header={header} done={this.close}>
            <WizardStep contentClass="flex gaps column"
              nextLabel={`Create NetworkAttachmentDefinition`} next={this.addNetworkAttachmentDefinition}>
              <SubTitle title={`name`} />
              <Input
                required
                value={this.name}
                onChange={(value) => this.name = value}
              />
              <SubTitle title={`namespace`} />
              <NamespaceSelect required value={this.namespace} onChange={value => this.namespace = value.value} />
              <SubTitle
                title={
                  <>
                    Plugins
                    &nbsp;&nbsp;
                    <Icon material={"add_circle"} className={"add_circle"} onClick={event => {
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