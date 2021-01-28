import "./config-service-dialog.scss";

import React from "react";
import { observer } from "mobx-react";
import { observable } from "mobx";
import { Dialog, DialogProps } from "../dialog";
import { Trans } from "@lingui/macro";
import { Wizard, WizardStep } from "../wizard";
import { Service } from "../../api/endpoints";
import { createMuiTheme, Paper } from "@material-ui/core";
import { SubTitle } from "../layout/sub-title";
import { Select } from "../select";
import { Input } from "../input";
import { Notifications } from "../notifications";
import { ThemeProvider } from "@material-ui/core/styles";
import { apiManager } from "../../../client/api/api-manager";

interface ServicePort {
  name?: string;
  protocol: string;
  port: number;
  targetPort: number;
}

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

interface Props extends Partial<DialogProps> {
}

@observer
export class ConfigServiceDialog extends React.Component<Props> {

  @observable static Data: Service = null;
  @observable static isOpen = false;
  @observable ports: ServicePort[] = [];

  static open(item: Service) {
    ConfigServiceDialog.isOpen = true;
    ConfigServiceDialog.Data = item;
  }

  get service() {
    return ConfigServiceDialog.Data;
  }

  static close() {
    ConfigServiceDialog.isOpen = false;
  }

  close = async () => {
    ConfigServiceDialog.close();
    await this.reset();
  }

  get protocolOptions() {
    return [
      "TCP",
      "UDP"
    ]
  }

  onOpen = async () => {
    this.ports = this.service?.spec.ports;
  }

  reset = async () => {
    ConfigServiceDialog.Data = null;
    this.ports = [];
  }

  update = async () => {
    try {
      this.service.spec.ports = this.ports;
      await apiManager.getApi(this.service.selfLink).update(
        { name: this.service.getName(), namespace: this.service.getNs() },
        { data: this.service }
      ).then((data) => {
        Notifications.ok(
          <>Service: {this.service.getName()} update succeeded</>
        );
        this.close();
      })
    } catch (err) {
      Notifications.error(err);
    }
  }

  rPorts(index: number) {
    return (
      <>
        <Paper elevation={3} style={{ padding: 25 }}>
          <SubTitle title={"Name - "} children={this.ports[index].name} />
          <SubTitle title={<Trans>Protocol</Trans>} />
          <Select
            options={this.protocolOptions}
            value={this.ports[index].protocol}
            onChange={value => {
              this.ports[index].protocol = value.value;
            }}
          />
          <SubTitle title={<Trans>Port</Trans>} />
          <Input
            required={true}
            title={"Port"}
            type={"number"}
            value={this.ports[index].port.toString()}
            onChange={value => this.ports[index].port = Number(value)}
          />
          <SubTitle title={<Trans>TargetPort</Trans>} />
          <Input
            required={true}
            title={"TargetPort"}
            type={"number"}
            value={this.ports[index].targetPort.toString()}
            onChange={value => this.ports[index].targetPort = Number(value)}
          />
        </Paper>
        <br />
      </>
    )
  }

  render() {
    const { ...dialogProps } = this.props;
    const header = <h5><Trans>Config Service</Trans></h5>;
    return (
      <ThemeProvider theme={theme}>
        <Dialog
          {...dialogProps}
          className="ConfigServiceDialog"
          isOpen={ConfigServiceDialog.isOpen}
          onOpen={this.onOpen}
          close={this.close}
        >
          <Wizard header={header} done={this.close}>
            <WizardStep contentClass="flow column" nextLabel={<Trans>Update</Trans>} next={this.update}>
              {this.ports.map((item, index) => this.rPorts(index))}
            </WizardStep>
          </Wizard>
        </Dialog>
      </ThemeProvider>
    )
  }
}