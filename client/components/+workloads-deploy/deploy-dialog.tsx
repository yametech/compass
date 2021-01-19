import React from "react";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { observable } from "mobx";
import { Namespace } from "../../api/endpoints";
import { Input } from "../input"
import { Wizard, WizardStep } from "../wizard";
import { t, Trans } from "@lingui/macro";
import { SubTitle } from "../layout/sub-title";
import { _i18n } from "../../i18n";
import { NamespaceSelect } from "../+namespaces/namespace-select";
import { apiBase } from "../../api";
import { Notifications } from "../notifications";
import { NamespaceAllowStorageClassSelect } from "../+namespaces/namespace-allow-storageclass-select";
import { MultusCniNameSelect } from "../+deploy-multus-cni/multus-name-select";
import { SelectOption } from "../select";
import {
  NetworkAttachmentDefinition,
} from "../../api/endpoints";

interface Props extends Partial<DialogProps> {
}

@observer
export class DeployDialog extends React.Component<Props> {

  @observable static isOpen = false;
  @observable static appName = "";
  @observable static templateName = "";
  @observable namespace = "";
  @observable replicas = "1";
  @observable storageClass = "";
  // @observable networkCard = observable.array<string>([], { deep: false });
  @observable networkCard = "";
  @observable cniNameMap = new Map<string, string>();

  static open(appName: string, templateName: string) {
    DeployDialog.isOpen = true;
    DeployDialog.appName = appName;
    DeployDialog.templateName = templateName;
  }

  static close() {
    DeployDialog.isOpen = false;
  }

  get appName() {
    return DeployDialog.appName;
  }

  get templateName() {
    return DeployDialog.templateName;
  }

  close = () => {
    DeployDialog.close();
  }

  reset = () => {
    DeployDialog.appName = "";
    DeployDialog.templateName = "";
    this.namespace = "";
    this.networkCard = "";
    this.cniNameMap = new Map<string, string>();
  }

  updateDeploy = async () => {
    // k8s.v1.cni.cncf.io/networks: '[
    //   { "name" : "macvlan-conf1" }, 
    //   { "name" : "macvlan-conf" }
    // ]'
    // let keyPair: Map<string, string> = new Map<string, string>();
    // keyPair.set("name", this.networkCard);
    // this.networkCard.map((item) => {
    //   keyPair.set("name", item)
    // });
    // console.log(this.networkCard);

    // let cniNameMap: Map<string, string> = new Map<string, string>();
    // let a = `${}`;
    if (this.networkCard !== "") {
      this.cniNameMap.set("k8s.v1.cni.cncf.io/networks", this.networkCard);

    }

    const data = {
      annotations: Object.fromEntries(this.cniNameMap),
      appName: this.appName,
      templateName: this.templateName,
      storageClass: this.storageClass,
      namespace: this.namespace,
      replicas: this.replicas,
    }


    try {
      await apiBase.post("/deploy", { data }).then((data) => {
        this.reset();
        this.close();
      })
      Notifications.ok(
        <>Deploy {data.appName} to namespace {data.namespace} succeeded</>
      );
    } catch (err) {
      Notifications.error(err);
    }
  }

  render() {
    const { ...dialogProps } = this.props;
    const header = <h5><Trans>Deploy</Trans></h5>;
    // const unwrapCNiName = (options: SelectOption[]) => options.map(option => option.value);
    return (
      <Dialog
        {...dialogProps}
        className="DeployDialog"
        isOpen={DeployDialog.isOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flow column" nextLabel={<Trans>Create</Trans>}
            next={this.updateDeploy}>
            <div className="namespace">
              <SubTitle title={<Trans>Namespace</Trans>} />
              <NamespaceSelect
                isClearable
                value={this.namespace}
                placeholder={_i18n._(t`Namespace`)}
                themeName="light"
                className="box grow"
                onChange={(v) => this.namespace = v.value}
              />

              <SubTitle title={<Trans>Multus NetWorkcat</Trans>} />
              <MultusCniNameSelect
                isClearable
                namespace={this.namespace}
                placeholder={_i18n._(t`Multus NetWorkCat`)}
                themeName="light"
                className="box grow"
                onChange={(v) => this.networkCard = v.value}
              // onChange={(opts: SelectOption[]) => {
              //   if (!opts) opts = [];
              //   this.networkCard.replace(unwrapCNiName(opts));
              // }}
              />


              <SubTitle title={<Trans>StorageClass</Trans>} />
              <NamespaceAllowStorageClassSelect
                isClearable
                themeName="light"
                className="box grow"
                placeholder={_i18n._(t`StorageClass`)}
                namespaceName={this.namespace}
                value={this.storageClass}
                onChange={({ value }) => this.storageClass = value}
              />

              <SubTitle title={<Trans>Replicas</Trans>} />
              <Input
                autoFocus
                placeholder={_i18n._(t`Replicas`)}
                value={this.replicas}
                onChange={v => this.replicas = v}
              />
            </div>
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}