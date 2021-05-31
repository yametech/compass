import "./add-tenant-dialog.scss"

import React from "react";
import {observer} from "mobx-react";
import {Dialog, DialogProps} from "../dialog";
import {computed, observable} from "mobx";
import {Wizard, WizardStep} from "../wizard";
import {t, Trans} from "@lingui/macro";
import {SubTitle} from "../layout/sub-title";
import {Input} from "../input";
import {_i18n} from "../../i18n";
import {systemName} from "../input/input.validators";
import {Notifications} from "../notifications";
import {SelectOption} from "../select";
import {Tenant, tenantApi} from "../../api/endpoints/tenant-tenant";
import {TenantUser, tenantUserApi} from "../../api/endpoints";
import {tenantStore} from "./tenant.store";
import {tenantUserStore} from "../+tenant-manage-user";
import {NamespaceSelect} from "../+namespaces/namespace-select";

interface Props extends Partial<DialogProps> {
}

@observer
export class AddTenantDialog extends React.Component<Props> {

  @observable static isOpen = false;
  @observable name = "";
  @observable owner = "";
  @observable username = "";
  @observable password = "";
  @observable namespace = "";
  @observable namespaces = observable.array<string>([], {deep: false});

  @computed get selectedNamespaces() {
    return [
      ...this.namespaces,
    ]
  }

  static open() {
    AddTenantDialog.isOpen = true;
  }

  static close() {
    AddTenantDialog.isOpen = false;
  }

  close = () => {
    AddTenantDialog.close();
  }

  reset = () => {
    this.name = "";
    this.owner = "";
    this.password = "";
    this.namespaces.replace([]);
  }


  createTenant = async () => {
    const {name, namespace, username, password} = this;
    let tenantCheck = tenantStore.getByName(name);
    console.log("tenant:" + tenantCheck)
    if (tenantCheck != undefined){
      Notifications.error(
          <>Tenant {name} already exists</>
      );
      return
    }
    let userCheck = tenantUserStore.getByName(username);
    console.log("user:" + userCheck)
    if (userCheck != undefined){
      Notifications.error(
          <>User {username} already exists</>
      );
      return
    }

    const tenant: Partial<Tenant> = {
      spec: {
        name: name,
        owner: username,
        namespaces: this.selectedNamespaces,
      }
    }
    const user: Partial<TenantUser> = {
      spec: {
        name: username,
        password: password,
        tenant_id: name,
        is_tenant_owner: true
      }
    }
    try {
      await tenantApi.create({namespace, name,labels: new Map<string, string>().set("tenant.yamecloud.io", name),}, tenant);
      await tenantUserApi.create({name: username,namespace,labels: new Map<string, string>().set("tenant.yamecloud.io", name)},user)

      Notifications.ok(
          <>Tenant {name} save succeeded</>
      );
      // showDetails(newUser.selfLink);
      this.reset();
      this.close();
    } catch (err) {
      Notifications.error(err);
    }
  }

  render() {
    const {...dialogProps} = this.props;
    const {name, username, password} = this;
    // const unwrapRoles = (options: SelectOption[]) => options.map(option => option.value);
    const unwrapNamespaces = (options: SelectOption[]) => options.map(option => option.value);
    const header = <h5><Trans>Create Tenant</Trans></h5>;
    return (
      <Dialog
        {...dialogProps}
        className="AddTenantDialog"
        isOpen={AddTenantDialog.isOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flow column" nextLabel={<Trans>Create</Trans>} next={this.createTenant}>

            <div className="tenant-name">
              <SubTitle title={<Trans>Tenant name</Trans>}/>
              <Input
                autoFocus required
                placeholder={_i18n._(t`TenantName`)}
                validators={systemName}
                value={name} onChange={v => this.name = v}
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
                  onChange={(opts: SelectOption[]) => {
                    if (!opts) opts = [];
                    this.namespaces.replace(unwrapNamespaces(opts));
                  }}
              />
            </div>
            <div className="user-name">
              <SubTitle title={<Trans>User name</Trans>}/>
              <Input
                  autoFocus required
                  placeholder={_i18n._(t`Name`)}
                  validators={systemName}
                  value={username} onChange={v => this.username = v}
              />
            </div>
            <div className="password">
              <SubTitle title={<Trans>Password</Trans>}/>
              <Input
                  type="password"
                  placeholder={_i18n._(t`Password`)}
                  value={password} onChange={v => this.password = v}
              />
            </div>
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}