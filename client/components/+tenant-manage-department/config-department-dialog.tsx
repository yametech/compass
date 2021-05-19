import "./config-department-dialog.scss"

import React from "react";
import {observer} from "mobx-react";
import {Dialog, DialogProps} from "../dialog";
import {computed, observable} from "mobx";
import {Namespace, Stack, TenantDepartment, tenantDepartmentApi,} from "../../api/endpoints";
import {Wizard, WizardStep} from "../wizard";
import {t, Trans} from "@lingui/macro";
import {SubTitle} from "../layout/sub-title";
import {_i18n} from "../../i18n";
import {Notifications} from "../notifications";
import {NamespaceSelect} from "../+namespaces/namespace-select";
import {SelectOption} from "../select";
import {StackDetails} from "./stack-details";
import {Input} from "../input";
import {BaseUserSelect} from "../+tenant-manage-user/user-select";

interface Props extends Partial<DialogProps> {
}

@observer
export class ConfigDepartmentDialog extends React.Component<Props> {

  @observable static isOpen = false;
  @observable static data: TenantDepartment = null;
  @observable name = "";
  @observable tenant_id = "";
  @observable owner = "";
  @observable namespaces = observable.array<Namespace>([], {deep: false});
  // @observable defaultNamespace = "";
  @observable gits: Stack[] = [];
  @observable registers: Stack[] = [];

  @computed get selectedNamespaces() {
    return [
      ...this.namespaces,
    ]
  }

  static open(department: TenantDepartment) {
    ConfigDepartmentDialog.isOpen = true;
    ConfigDepartmentDialog.data = department;
  }

  static close() {
    ConfigDepartmentDialog.isOpen = false;
  }

  get department() {
    return ConfigDepartmentDialog.data;
  }

  onOpen = () => {
    this.name = this.department.getName();
    this.tenant_id = this.department.spec.tenant_id;
    this.owner = this.department.spec.owner;
    this.namespaces.replace(this.department.spec.namespaces);
    // this.defaultNamespace = this.department.spec.defaultNamespace;
    this.gits = this.department.spec.gits || [];
    this.registers = this.department.spec.registers || [];
  }

  close = () => {
    ConfigDepartmentDialog.close();
  }

  updateDepartment = async () => {
    const {name} = this;
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

    try {
      await tenantDepartmentApi.create({namespace: "kube-system", name: name, labels: new Map<string, string>().set("tenant.yamecloud.io", this.tenant_id) }, department);
      Notifications.ok(
        <>Department {name} save succeeded</>
      );
      this.close();
    } catch (err) {
      Notifications.error(err);
    }
  }

  render() {
    const {...dialogProps} = this.props;
    const unwrapNamespaces = (options: SelectOption[]) => options.map(option => option.value);
    const header = <h5><Trans>Config Department</Trans></h5>;
    return (
      <Dialog
        {...dialogProps}
        className="ConfigDepartmentDialog"
        isOpen={ConfigDepartmentDialog.isOpen}
        onOpen={this.onOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flow column" nextLabel={<Trans>Apply</Trans>}
                      next={this.updateDepartment}>
            <div className="baseTenant">
              <SubTitle title={<Trans>BaseTenant</Trans>}/>
              <Input
                  required={true}
                  disabled={true}
                  title={"BaseTenant"}
                  value={this.tenant_id}
                  onChange={value => this.tenant_id = value}
              />
              {/*<BaseTenantSelect*/}
              {/*    placeholder={_i18n._(t`BaseTenant`)}*/}
              {/*    themeName="light"*/}
              {/*    className="box grow"*/}
              {/*    value={this.tenant_id} onChange={({value}) => this.tenant_id = value}*/}
              {/*/>*/}
            </div>
            <div className="owner">
              <SubTitle title={<Trans>Owner</Trans>} />
              <BaseUserSelect
                  placeholder={_i18n._(t`Tenant Department`)}
                  themeName="light"
                  className="box grow"
                  tenantId={this.tenant_id}
                  value={this.owner} onChange={({value}) => this.owner = value}
              />
            </div>
            <div className="namespaces">
              <SubTitle title={<Trans>Namespace</Trans>}/>
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
            {/*  <SubTitle title={<Trans>Default Namespace</Trans>}/>*/}
            {/*  <Select*/}
            {/*    value={this.defaultNamespace}*/}
            {/*    placeholder={_i18n._(t`Default Namespace`)}*/}
            {/*    options={this.namespaces}*/}
            {/*    themeName="light"*/}
            {/*    className="box grow"*/}
            {/*    onChange={value => this.defaultNamespace = value.value}*/}
            {/*  />*/}
            {/*</div>*/}
            <br/>
            <StackDetails name={"Git"} value={this.gits} onChange={value => this.gits = value}/>
            <br/>
            <StackDetails name={"Register"} value={this.registers} onChange={value => this.registers = value}/>
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}