import "./add-department-dialog.scss"

import React from "react";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { computed, observable } from "mobx";
import { Namespace, Stack, TenantDepartment, tenantDepartmentApi } from "../../api/endpoints";
import { Wizard, WizardStep } from "../wizard";
import { t, Trans } from "@lingui/macro";
import { SubTitle } from "../layout/sub-title";
import { Input } from "../input";
import { _i18n } from "../../i18n";
import { systemName } from "../input/input.validators";
import { Notifications } from "../notifications";
import { NamespaceSelect } from "../+namespaces/namespace-select";
import { SelectOption } from "../select";
import { StackDetails } from "./stack-details";
import { BaseTenantSelect } from "../+tenant-manage-tenant/tenant-select";
import { BaseUserSelect } from "../+tenant-manage-user/user-select";

interface Props extends Partial<DialogProps> {
}

@observer
export class AddDepartmentDialog extends React.Component<Props> {

  @observable static isOpen = false;

  static open() {
    AddDepartmentDialog.isOpen = true;
  }

  static close() {
    AddDepartmentDialog.isOpen = false;
  }

  @observable name = "";
  @observable tenant_id = "";
  @observable owner = "";
  @observable namespaces = observable.array<Namespace>([], { deep: false });
  // @observable defaultNamespace = "";
  @observable gits: Stack[] = [];
  @observable registers: Stack[] = [];

  close = () => {
    AddDepartmentDialog.close();
  }

  reset = () => {
    this.name = "";
    this.tenant_id = "";
    this.owner = "";
    // this.defaultNamespace = "";
    this.namespaces.replace([]);
  }

  @computed get selectedNamespaces() {
    return [
      ...this.namespaces,
    ]
  }

  createDepartment = async () => {
    const { name, tenant_id } = this;
    const department: Partial<TenantDepartment> = {
      spec: {
        tenant_id: this.tenant_id,
        owner: this.owner,
        namespaces: this.selectedNamespaces,
        // defaultNamespace: this.defaultNamespace,
        gits: this.gits,
        registers: this.registers
      }
    }


    await tenantDepartmentApi.create(
      {
        namespace: "", name: name, labels: new Map<string, string>().
          set("tenant.yamecloud.io", tenant_id)
      }, department).
      then(() => {
        Notifications.ok(<>Department {name} save succeeded</>);
      }).catch((err) => {
        Notifications.error(err);
      }).finally(() => {
        this.reset();
        this.close();
      })
  }

  render() {
    const { ...dialogProps } = this.props;
    const { name } = this;
    const unwrapNamespaces = (options: SelectOption[]) => options.map(option => option.value);
    const header = <h5><Trans>Create Department</Trans></h5>;
    return (
      <Dialog
        {...dialogProps}
        isOpen={AddDepartmentDialog.isOpen}
        className="AddDepartmentDialog"
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flow column" nextLabel={<Trans>Create</Trans>}
            next={this.createDepartment}>
            <div className="baseTenant">
              <SubTitle title={<Trans>BaseTenant</Trans>} />
              <BaseTenantSelect
                placeholder={_i18n._(t`BaseTenant`)}
                themeName="light"
                className="box grow"
                value={this.tenant_id} onChange={({ value }) => {
                  this.tenant_id = value;
                  this.owner = ""
                }}
              />
            </div>
            <div className="department-name">
              <SubTitle title={<Trans>Department name</Trans>} />
              <Input
                autoFocus required
                placeholder={_i18n._(t`Name`)}
                validators={systemName}
                value={name} onChange={v => this.name = v}
              />
            </div>
            <div className="owner">
              <SubTitle title={<Trans>Owner</Trans>} />
              <BaseUserSelect
                placeholder={_i18n._(t`Tenant Department`)}
                themeName="light"
                className="box grow"
                tenantId={this.tenant_id}
                value={this.owner} onChange={({ value }) => this.owner = value}
              />
            </div>
            <div className="namespaces">
              <SubTitle title={<Trans>Namespace</Trans>} />
              <NamespaceSelect
                isMulti
                value={this.namespaces}
                placeholder={_i18n._(t`Namespace`)}
                themeName="light"
                className="box grow"
                tenantId={this.tenant_id}
                onChange={(opts: SelectOption[]) => {
                  if (!opts) opts = [];
                  this.namespaces.replace(unwrapNamespaces(opts));
                }}
              />
            </div>
            {/*<div className="default_namespace">*/}
            {/*  <SubTitle title={<Trans>Default Namespace</Trans>} />*/}
            {/*  <Select*/}
            {/*    value={this.defaultNamespace}*/}
            {/*    placeholder={_i18n._(t`Default Namespace`)}*/}
            {/*    options={this.namespaces}*/}
            {/*    themeName="light"*/}
            {/*    className="box grow"*/}
            {/*    onChange={value => this.defaultNamespace = value.value}*/}
            {/*  />*/}
            {/*</div>*/}
            <br />
            <StackDetails name={"Git"} value={this.gits} onChange={value => this.gits = value} />
            <br />
            <StackDetails name={"Register"} value={this.registers} onChange={value => this.registers = value} />
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}