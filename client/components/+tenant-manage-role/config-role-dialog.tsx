import "./config-role-dialog.scss"

import React from "react";
import {observer} from "mobx-react";
import {Dialog, DialogProps} from "../dialog";
import {computed, observable} from "mobx";
import {TenantRole, tenantRoleApi} from "../../api/endpoints";
import {Wizard, WizardStep} from "../wizard";
import {t, Trans} from "@lingui/macro";
import {SubTitle} from "../layout/sub-title";
import {_i18n} from "../../i18n";
import {Notifications} from "../notifications";
import {Input} from "../input";
import {BaseDepartmentSelect} from "../+tenant-manage-department/department-select";
import {NamespaceSelect} from "../+namespaces/namespace-select";
import {SelectOption} from "../select";

interface Props extends Partial<DialogProps> {
}

@observer
export class ConfigRoleDialog extends React.Component<Props> {

  @observable static isOpen = false;
  @observable static data: TenantRole = null;
  @observable tenant_id = "";
  @observable department_id = "";
  @observable name = "";
  @observable namespace = "";
  @observable comment = "";
  @observable namespaces = observable.array<string>([], {deep: false});

  static open(object: TenantRole) {
    ConfigRoleDialog.isOpen = true;
    ConfigRoleDialog.data = object;
  }

  static close() {
    ConfigRoleDialog.isOpen = false;
  }

  @computed get selectedNamespaces() {
    return [
      ...this.namespaces,
    ]
  }

  close = () => {
    ConfigRoleDialog.close();
  }

  reset = () => {
    this.name = "";
    this.tenant_id = ""
    this.department_id = ""
    this.comment = ""
    this.namespaces.replace([])
  }

  get tenantRole() {
    return ConfigRoleDialog.data
  }

  onOpen = () => {
    this.name = this.tenantRole.getName()
    this.tenant_id = this.tenantRole.spec.tenant_id
    this.department_id = this.tenantRole.spec.department_id
    this.namespaces.replace(this.tenantRole.spec.namespaces)
    this.comment = this.tenantRole.spec.comment
  }

  unwrapPermissions = (options: string[]) => options.map(option => option);

  updateRole = async () => {
    const {name, namespace, tenant_id, department_id, comment} = this;
    // const data = permissions.map(item => item);
    // await apiPermission.post("/permission_auth_value/", {data}).then((value: number) => this.value = value)
    const role: Partial<TenantRole> = {
      spec: {
        tenant_id: tenant_id,
        department_id: department_id,
        namespaces: this.selectedNamespaces,
        privilege: this.tenantRole.spec.privilege,
        comment: comment,
      }
    }
    this.tenantRole.spec = role.spec
    try {
      const newRole = await tenantRoleApi.update({namespace, name,}, this.tenantRole);
      // showDetails(newRole.selfLink);
      this.reset();
      Notifications.ok(
        <>Role {name} save succeeded</>
      );
      this.close();
    } catch (err) {
      Notifications.error(err);
    }
  }

  render() {
    const {...dialogProps} = this.props;
    const {name, tenant_id, department_id, comment} = this;
    const unwrapNamespaces = (options: SelectOption[]) => options.map(option => option.value);
    const header = <h5><Trans>Config Role</Trans></h5>;
    return (
      <Dialog
        {...dialogProps}
        className="ConfigRoleDialog"
        isOpen={ConfigRoleDialog.isOpen}
        onOpen={this.onOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flow column" nextLabel={<Trans>Update</Trans>} next={this.updateRole}>
            <div className="name">
              <SubTitle title={<Trans>Name</Trans>}/>
              <Input
                  required={true}
                  disabled={true}
                  placeholder={_i18n._(t`Name`)}
                  value={name}
              />
            </div>

            <div className="baseTenant">
              <SubTitle title={<Trans>BaseTenant</Trans>}/>
              <Input
                  required={true}
                  disabled={true}
                  placeholder={_i18n._(t`BaseTenant`)}
                  value={tenant_id}
              />
            </div>
            <div className="tenant-department">
              <SubTitle title={<Trans>Tenant Department</Trans>}/>
              <BaseDepartmentSelect
                  placeholder={_i18n._(t`Tenant Department`)}
                  themeName="light"
                  className="box grow"
                  tenantId={this.tenant_id}
                  value={department_id} onChange={({value}) => this.department_id = value}
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
                  departmentId={this.department_id}
                  onChange={(opts: SelectOption[]) => {
                    if (!opts) opts = [];
                    this.namespaces.replace(unwrapNamespaces(opts));
                  }}
              />
            </div>
            <div className="comment">
              <SubTitle title={<Trans>Comment</Trans>}/>
              <Input
                  placeholder={_i18n._(t`Comment`)}
                  value={comment} onChange={v => this.comment = v}
              />
            </div>
            {/*<div className="namespace">*/}
            {/*  <SubTitle title={<Trans>Permission</Trans>}/>*/}
            {/*  <BasePermissionSelect*/}
            {/*    isMulti*/}
            {/*    value={this.permissions}*/}
            {/*    placeholder={_i18n._(t`Permission`)}*/}
            {/*    themeName="light"*/}
            {/*    className="box grow"*/}
            {/*    onChange={(opts: string[]) => {*/}
            {/*      if (!opts) opts = [];*/}
            {/*      this.permissions.replace(this.unwrapPermissions(opts));*/}
            {/*    }}*/}
            {/*  />*/}
            {/*</div>*/}
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}