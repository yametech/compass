import React from "react";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { observable } from "mobx";
import { t, Trans } from "@lingui/macro";
import { Wizard, WizardStep } from "../wizard";
import { app, App } from "../+deploy-app";
import { deployStore } from "./deploy.store";
import { Notifications } from "../notifications";
import { Deploy } from "../../api/endpoints";
import { Input } from "../input"
import { SubTitle } from "../layout/sub-title";
import { _i18n } from "../../i18n";
import { apiManager } from "../../../client/api/api-manager";

interface Props extends DialogProps {

}

@observer
export class TaggingDialog extends React.Component<Props> {

  @observable static isOpen = false;
  @observable static Data: Deploy = null;
  @observable app: App = app;
  @observable tagName: string = '';

  static open(object: Deploy) {
    TaggingDialog.isOpen = true;
    TaggingDialog.Data = object;
  }

  get deploy() {
    return TaggingDialog.Data
  }

  static close() {
    TaggingDialog.isOpen = false;
  }

  close = async () => {
    TaggingDialog.close();
    await this.reset();
  }

  reset = async () => {
    this.app = app;
  }

  onOpen = async () => {
    this.tagName = this.deploy.metadata.labels.tagName
  }

  updateDeploy = async () => {

    const { app } = this;
    const data = { tagName: this.tagName };
    try {
      await apiManager.getApi(this.deploy.selfLink).updateLabel(
        { name: this.deploy.getName(), namespace: "" },
        data,
      );
      await this.close();
      Notifications.ok(
        <>Tagging {app.name} as {this.tagName} succeeded</>
      );
    } catch (err) {
      Notifications.error(err);
    }
  }

  render() {
    const header = <h5><Trans>Tagging</Trans></h5>;

    return (
      <Dialog
        isOpen={TaggingDialog.isOpen}
        className="TaggingDialog"
        onOpen={this.onOpen}
        close={this.close}
        pinned
      >
        <Wizard className="TaggingWizard small" header={header} done={this.close}>
          <WizardStep contentClass="flex gaps column" next={this.updateDeploy}>
            <div>
              <SubTitle title={<Trans>TagName</Trans>} />
              <Input
                autoFocus
                placeholder={_i18n._(t`TagName`)}
                value={this.tagName}
                onChange={v => this.tagName = v}
              />
            </div>
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}