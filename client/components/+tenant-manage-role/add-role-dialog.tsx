import "./add-role-dialog.scss"

import React from "react";
import {observer} from "mobx-react";
import {Dialog, DialogProps} from "../dialog";
import {computed, observable} from "mobx";
import {TenantRole, tenantRoleApi} from "../../api/endpoints";
import {Wizard, WizardStep} from "../wizard";
import {t, Trans} from "@lingui/macro";
import {SubTitle} from "../layout/sub-title";
import {Input} from "../input";
import {_i18n} from "../../i18n";
import {systemName} from "../input/input.validators";
import {Notifications} from "../notifications";
import {BaseTenantSelect} from "../+tenant-manage-tenant/tenant-select";
import {BaseDepartmentSelect} from "../+tenant-manage-department/department-select";
import {NamespaceSelect} from "../+namespaces/namespace-select";
import {SelectOption} from "../select";

interface Props extends Partial<DialogProps> {
}

@observer
export class AddRoleDialog extends React.Component<Props> {

  @observable static isOpen = false;

  static open() {
    AddRoleDialog.isOpen = true;
  }

  static close() {
    AddRoleDialog.isOpen = false;
  }

  @observable name = "";
  @observable tenant_id = "";
  @observable department_id = "";
  @observable namespaces = observable.array<string>([], {deep: false});
  @observable namespace = "";
  @observable comment = "";

  @computed get selectedNamespaces() {
    return [
      ...this.namespaces,
    ]
  }

  close = () => {
    AddRoleDialog.close();
  }

  reset = () => {
    this.name = "";
    this.tenant_id = "";
    this.department_id = "";
    this.comment = "";
    this.namespaces.replace([]);
  }

  createRole = async () => {
    const {name, namespace, tenant_id, department_id, comment} = this;
    const role: Partial<TenantRole> = {
      spec: {
        tenant_id: tenant_id,
        department_id: department_id,
        namespaces: this.selectedNamespaces,
        comment: comment,
      }
    }
    try {
      let labelMap = new Map<string, string>()
          .set("tenant.yamecloud.io", tenant_id)
          .set("department.yamecloud.io",department_id);
      const newRole = await tenantRoleApi.create({namespace, name, labels: labelMap}, role);
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
    const header = <h5><Trans>Create Role</Trans></h5>;
    const unwrapNamespaces = (options: SelectOption[]) => options.map(option => option.value);
    return (
      <Dialog
        {...dialogProps}
        className="AddRoleDialog"
        isOpen={AddRoleDialog.isOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flow column" nextLabel={<Trans>Create</Trans>} next={this.createRole}>
            <div className="name">
              <SubTitle title={<Trans>Name</Trans>}/>
              <Input
                autoFocus required
                placeholder={_i18n._(t`Name`)}
                validators={systemName}
                value={name} onChange={v => this.name = v}
              />
            </div>

            <div className="baseTenant">
              <SubTitle title={<Trans>BaseTenant</Trans>}/>
              <BaseTenantSelect
                  placeholder={_i18n._(t`BaseTenant`)}
                  themeName="light"
                  className="box grow"
                  value={tenant_id} onChange={({value}) => this.tenant_id = value}
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
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}