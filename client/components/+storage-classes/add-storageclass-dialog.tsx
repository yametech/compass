import "./add-storageclass-dialog.scss"

import React from "react";
import { Dialog, DialogProps } from "../dialog";
import { t, Trans } from "@lingui/macro";
import { Wizard, WizardStep } from "../wizard";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Input } from "../input";
import { _i18n } from "../../i18n";
import { Select, SelectOption } from "../select";
import { Icon } from "../icon";
import { SubTitle } from "../layout/sub-title";
import { cephParams, CephParams } from "./common";
import { SecretsSelect } from "../+config-secrets/secrets-select";
import { NamespaceSelect } from "../+namespaces/namespace-select";
import { Notifications } from "../notifications";
import { storageClassApi, StorageClass } from "../../api/endpoints";
import { systemName } from "../input/input.validators";
import { IKubeObjectMetadata } from "../../api/kube-object";
import { showDetails } from "../../navigation";

interface Props extends DialogProps {
}

@observer
export class AddStorageClassDialog extends React.Component<Props> {

  @observable static isOpen = false;
  @observable name: string = "";
  @observable provisioner: string = "ceph.com/rbd";
  @observable volumeBindingMode: string = "Immediate";
  @observable reclaimPolicy: string = "Retain";
  @observable params: CephParams = cephParams;
  @observable userSecretNamespace = "";

  static open() {
    AddStorageClassDialog.isOpen = true;
  }

  static close() {
    AddStorageClassDialog.isOpen = false;
  }

  close = () => {
    AddStorageClassDialog.close();
  }

  reset() {
    this.name = "";
    this.params = cephParams;
  }

  formatOptionLabel = (option: SelectOption) => {
    const { value, label } = option;
    return label || (
      <>
        <Icon small material="layers" className="primary" />
        {value}
      </>
    );
  }

  get provisionerOptions() {
    return [
      "ceph.com/rbd"
    ]
  }

  get volumeBindingModeOptions() {
    return [
      "Immediate"
    ]
  }

  get reclaimPolicyOptions() {
    return [
      "Retain",
      "Delete"
    ]
  }

  get fsTypeOptions() {
    return [
      "ext4",
      "xfs"
    ]
  }

  get imageFormatOptions() {
    return [
      "1",
      "2",
      "3",
      "4",
      "5"
    ]
  }

  get imageFeaturesOptions() {
    return [
      "layering",
    ]
  }

  addStorageClass = async () => {
    const {name, provisioner, volumeBindingMode, reclaimPolicy, params} = this

    try {
      const storageClass: Partial<StorageClass> = {
        metadata: {
          name: name,
        } as IKubeObjectMetadata,
        provisioner: provisioner,
        volumeBindingMode: volumeBindingMode,
        reclaimPolicy: reclaimPolicy,
        parameters: {
          adminSecretNamespace: params.adminSecretNamespace,
          adminSecretName: params.adminSecretName,
          userSecretNamespace: params.userSecretNamespace,
          userSecretName: params.userSecretName,
          monitors: params.monitors,
          adminId: params.adminId,
          pool: params.pool,
          userId: params.userId,
          fsType: params.fsType,
          imageFormat: params.imageFormat,
          imageFeatures: params.imageFeatures
        }
      };
      let newStorageClass = await storageClassApi.create({ name: this.name, namespace: '' }, storageClass)
      showDetails(newStorageClass.selfLink)
      this.reset();
      Notifications.ok(
        <>StorageClass {name} save succeeded</>
      );
      this.close();
    } catch (err) {
      Notifications.error(err);
    }

  }

  render() {
    const { ...dialogProps } = this.props;
    const header = <h5><Trans>Create StorageClass</Trans></h5>;
    return (
      <Dialog
        {...dialogProps}
        className="AddStorageClassDialog"
        isOpen={AddStorageClassDialog.isOpen}
        close={this.close}
      >
        <Wizard  header={header} done={this.close}>
          <WizardStep
            contentClass="flex gaps column"
            nextLabel={<Trans>Apply</Trans>}
            next={this.addStorageClass}
          >
            <SubTitle title={<Trans>Name</Trans>} />
            <Input
              required autoFocus
              validators={systemName}
              placeholder={_i18n._(t`Name`)}
              value={this.name}
              onChange={(value: string) => this.name = value}
            />
            <SubTitle title={<Trans>VolumeBindingMode</Trans>} />
            <Select
              value={this.volumeBindingMode}
              options={this.volumeBindingModeOptions}
              formatOptionLabel={this.formatOptionLabel}
              onChange={value => this.volumeBindingMode = value.value}
            />
            <SubTitle title={<Trans>ReclaimPolicy</Trans>} />
            <Select
              value={this.reclaimPolicy}
              options={this.reclaimPolicyOptions}
              formatOptionLabel={this.formatOptionLabel}
              onChange={value => this.reclaimPolicy = value.value}
            />
            <SubTitle title={<Trans>Provisioner</Trans>} />
            <Select
              value={this.provisioner}
              options={this.provisionerOptions}
              formatOptionLabel={this.formatOptionLabel}
              onChange={value => this.provisioner = value.value}
            />
            {this.provisioner == "ceph.com/rbd" ?
              <>
                <SubTitle title={<Trans>Admin Secret Namespace:</Trans>} />
                <NamespaceSelect
                  required autoFocus
                  value={this.params.adminSecretNamespace}
                  onChange={value => this.params.adminSecretNamespace = value.value} />
                <SubTitle title={<Trans>Admin Secret Name</Trans>} />
                <SecretsSelect
                  required autoFocus
                  value={this.params.adminSecretName}
                  namespace={this.params.adminSecretNamespace}
                  onChange={value => this.params.adminSecretName = value.value}
                />
                <SubTitle title={<Trans>User Secret Namespace:</Trans>} />
                <NamespaceSelect
                  required autoFocus
                  value={this.params.userSecretNamespace}
                  onChange={value => this.params.userSecretNamespace = value.value} />
                <SubTitle title={<Trans>User Secret Name</Trans>} />
                <SecretsSelect
                  required autoFocus
                  value={this.params.userSecretName}
                  namespace={this.params.userSecretNamespace}
                  onChange={value => this.params.userSecretName = value.value}
                />
                <SubTitle title={<Trans>Monitors</Trans>} />
                <Input
                  required autoFocus
                  placeholder={_i18n._(t`Monitors`)}
                  value={this.params.monitors}
                  onChange={(value: string) => this.params.monitors = value}
                />
                <SubTitle title={<Trans>Admin ID</Trans>} />
                <Input
                  required autoFocus
                  placeholder={_i18n._(t`Admin ID`)}
                  value={this.params.adminId}
                  onChange={(value: string) => this.params.adminId = value}
                />
                <SubTitle title={<Trans>Pool</Trans>} />
                <Input
                  placeholder={_i18n._(t`Pool`)}
                  value={this.params.pool}
                  onChange={(value: string) => this.params.pool = value}
                />
                <SubTitle title={<Trans>User ID</Trans>} />
                <Input
                  placeholder={_i18n._(t`User ID`)}
                  value={this.params.userId}
                  onChange={(value: string) => this.params.userId = value}
                />
                <SubTitle title={<Trans>FileSystem Type</Trans>} />
                <Select
                  options={this.fsTypeOptions}
                  value={this.params.fsType}
                  onChange={value => this.params.fsType = value.value} />
                <SubTitle title={<Trans>Image Format</Trans>} />
                <Select
                  options={this.imageFormatOptions}
                  value={this.params.imageFormat}
                  onChange={value => this.params.imageFormat = value.value} />
                <SubTitle title={<Trans>Image Features</Trans>} />
                <Select
                  options={this.imageFeaturesOptions}
                  value={this.params.imageFeatures}
                  onChange={value => this.params.imageFeatures = value.value} />
              </> : null
            }
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}