import "./config-deploy-dialog.scss"

import React from "react";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { observable } from "mobx";
import { Trans } from "@lingui/macro";
import { Wizard, WizardStep } from "../wizard";
import { Container, container, MultiContainerDetails } from "../+deploy-container";
import { Collapse } from "../collapse";
import { deployService, DeployServiceDetails, Service } from "../+deploy-service";
import { MultiVolumeClaimDetails, VolumeClaimTemplate } from "../+deploy-volumeclaim";
import { app, App } from "../+deploy-app";
import { AppDetails } from "../+deploy-app";
import { Notifications } from "../notifications";
import { Deploy } from "../../api/endpoints";
import { apiManager } from "../../../client/api/api-manager";

interface Props extends DialogProps {

}

@observer
export class ConfigDeployDialog extends React.Component<Props> {

  @observable static isOpen = false;
  @observable static Data: Deploy = null;
  @observable app: App = app;
  @observable service: Service = deployService;
  @observable containers: Container[] = [container];
  @observable volumeClaims: VolumeClaimTemplate[] = [];

  static open(object: Deploy) {
    ConfigDeployDialog.isOpen = true;
    ConfigDeployDialog.Data = object;
  }

  get deploy() {
    return ConfigDeployDialog.Data
  }

  static close() {
    ConfigDeployDialog.isOpen = false;
  }

  close = async () => {
    ConfigDeployDialog.close();
    await this.reset();
  }

  reset = async () => {
    this.app = app;
    this.service = deployService;
    this.containers = [container];
    this.volumeClaims = [];
  }

  onOpen = async () => {
    this.app = {
      name: this.deploy.spec.appName,
      type: this.deploy.spec.resourceType
    };
    this.containers = JSON.parse(this.deploy.spec.metadata);
    this.service = JSON.parse(this.deploy.spec.service);
    this.volumeClaims = JSON.parse(this.deploy.spec.volumeClaims);
  }

  updateDeploy = async () => {

    const { app, containers, service, volumeClaims } = this;

    try {
      this.deploy.spec = {
        appName: app.name,
        resourceType: app.type,
        metadata: JSON.stringify(containers),
        service: JSON.stringify(service),
        volumeClaims: JSON.stringify(volumeClaims),
      };
      await apiManager.getApi(this.deploy.selfLink).update(
        { name: this.deploy.getName(), namespace: "" },
        {
          ...this.deploy
        });
      await this.close();
      Notifications.ok(
        <>Workloads Template {app.name} save succeeded</>
      );
    } catch (err) {
      Notifications.error(err);
    }
  }

  render() {
    const header = <h5><Trans>Config Workloads Template</Trans></h5>;

    return (
      <Dialog
        isOpen={ConfigDeployDialog.isOpen}
        className="ConfigDeployDialog"
        onOpen={this.onOpen}
        close={this.close}
        pinned
      >
        <Wizard className={"ConfigDeployWizard"} header={header} done={this.close}>
          <WizardStep className={"ConfigDeployWizardStep"} contentClass="flex gaps column" next={this.updateDeploy}>
            <div>
              <AppDetails value={this.app} onChange={value => this.app = value} />
              <br />
              <Collapse panelName={<Trans>Containers</Trans>} key={"containers"}>
                <MultiContainerDetails value={this.containers}
                  onChange={value => this.containers = value} />
              </Collapse>
              <br />
              <Collapse panelName={<Trans>Service</Trans>} key={"services"}>
                <DeployServiceDetails value={this.service}
                  onChange={value => this.service = value} />
              </Collapse>
              <br />
              {
                this.app.type != "Stone" ?
                  <></>
                  :
                  <Collapse panelName={<Trans>Volume</Trans>} key={"volume"}>
                    <MultiVolumeClaimDetails value={this.volumeClaims}
                      onChange={value => this.volumeClaims = value} />
                  </Collapse>
              }
            </div>
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}