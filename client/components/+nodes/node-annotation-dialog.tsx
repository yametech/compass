import { observer } from "mobx-react";
import React from "react";
import { observable } from "mobx";
import { ActionMeta } from "react-select/src/types";
import { t, Trans } from "@lingui/macro";
import { Dialog } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Notifications } from "../notifications";
import { SubTitle } from "../layout/sub-title";
import { Input } from "../input";
import { Node } from "../../api/endpoints";
import { apiManager } from "../../../client/api/api-manager";

interface Props<T = any> extends Partial<Props> {
  value?: T;
  themeName?: "dark" | "light" | "outlined";

  onChange?(value: T, meta?: ActionMeta<any>): void;
}

@observer
export class NodeAnnotationDialog extends React.Component<Props> {

  @observable static isOpen = false;
  @observable static data: Node;
  @observable host: string = "";
  @observable rack: string = "";
  @observable zone: string = "";

  static open(object: Node) {
    NodeAnnotationDialog.isOpen = true;
    NodeAnnotationDialog.data = object;
  }

  static close() {
    NodeAnnotationDialog.isOpen = false;
  }

  close = () => {
    NodeAnnotationDialog.close();
  }

  onOpen = () => {
    try {
      this.host = this.node.metadata.labels["nuwa.kubernetes.io/host"]
    } catch (e) {
      this.host = ""
    }
    try {
      this.rack = this.node.metadata.labels["nuwa.kubernetes.io/rack"]
    } catch (e) {
      this.rack = ""
    }
    try {
      this.zone = this.node.metadata.labels["nuwa.kubernetes.io/zone"]
    } catch (e) {
      this.zone = ""
    }
  }

  get node() {
    return NodeAnnotationDialog.data
  }

  reset = () => {
    this.host = ""
    this.rack = ""
    this.zone = ""
  }

  submit = async () => {
    try {
      const data = {
        "node": NodeAnnotationDialog.data.getName(),
        "host": this.host,
        "rack": this.rack,
        "zone": this.zone,

      };
      let newObj = await apiManager.getApi(this.node.selfLink).annotate({ name: this.node.getName(), namespace: "", subresource: "geo" }, { data }).
        then((data) => {
          this.reset();
          this.close();
        })

      Notifications.ok(
        <>
          Node annotation geo succeeded
        </>);
    } catch (err) {
      Notifications.error(err);
    }
  }

  render() {
    const header = <h5><Trans>Node Annotation</Trans></h5>;
    return (
      <Dialog
        isOpen={NodeAnnotationDialog.isOpen}
        close={this.close}
        onOpen={this.onOpen}
      >
        <Wizard className="NodeAnnotationDialog" header={header} done={this.close}>
          <WizardStep contentClass="flex gaps column" next={this.submit}>
            <SubTitle title={<Trans>host</Trans>} />
            <Input
              autoFocus required
              value={this.host} onChange={v => this.host = v}
            />
            <SubTitle title={<Trans>rack</Trans>} />
            <Input
              autoFocus required
              value={this.rack} onChange={v => this.rack = v}
            />
            <SubTitle title={<Trans>zone</Trans>} />
            <Input
              autoFocus required
              value={this.zone} onChange={v => this.zone = v}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}