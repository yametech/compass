import "./config-tenant-dialog.scss"

import React from "react";
import {observer} from "mobx-react";
import {Dialog, DialogProps} from "../dialog";
import {computed, observable} from "mobx";
import {Wizard, WizardStep} from "../wizard";
import {t, Trans} from "@lingui/macro";
import {SubTitle} from "../layout/sub-title";
import {Input} from "../input";
import {Notifications} from "../notifications";
import {Tenant, tenantApi} from "../../api/endpoints/tenant-tenant";
import {SelectOption} from "../select";
import {NamespaceSelect} from "../+namespaces/namespace-select";
import {_i18n} from "../../i18n";

interface Props extends Partial<DialogProps> {
}

@observer
export class ConfigTenantDialog extends React.Component<Props> {

  @observable static isOpen = false;
  @observable static data: Tenant = null;
  @observable name = "";
  @observable owner = "";
  @observable namespace = "kube-system";
  @observable namespaces = observable.array<string>([], {deep: false});

  @computed get selectedNamespaces() {
    return [
      ...this.namespaces,
    ]
  }

  static open(tenant: Tenant) {
    ConfigTenantDialog.isOpen = true;
    ConfigTenantDialog.data = tenant;
  }

  static close() {
    ConfigTenantDialog.isOpen = false;
  }

  close = () => {
    ConfigTenantDialog.close();
  }


  get tenant() {
    return ConfigTenantDialog.data;
  }

  onOpen = () => {
    this.name = this.tenant.getName();
    this.owner = this.tenant.spec.owner;
    this.namespaces.replace(this.tenant.spec.namespaces);
  }

  reset = () => {
    this.name = "";
    this.owner = "";
    this.namespaces.replace([]);
  }

  updateTenant = async () => {
    const {name, namespace,owner} = this;
    const tenant: Partial<Tenant> = {
      spec: {
        name: name,
        owner: owner,
        namespaces: this.selectedNamespaces,
      }
    }
    try {
      await tenantApi.create({namespace, name, labels: new Map<string, string>().set("tenant.yamecloud.io", name)}, tenant);
      // showDetails(newUser.selfLink);
      this.reset();
      Notifications.ok(
        <>Tenant {name} save succeeded</>
      );
      this.close();
    } catch (err) {
      Notifications.error(err);
    }
  }

  render() {
    const {...dialogProps} = this.props;
    const header = <h5><Trans>Update Tenant</Trans></h5>;
    const unwrapNamespaces = (options: SelectOption[]) => options.map(option => option.value);
    return (
      <Dialog
        {...dialogProps}
        className="ConfigTenantDialog"
        isOpen={ConfigTenantDialog.isOpen}
        onOpen={this.onOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flow column" nextLabel={<Trans>Apply</Trans>} next={this.updateTenant}>
            <div className="baseTenant">
              <SubTitle title={<Trans>Name</Trans>} />
              <Input
                  required={true}
                  disabled={true}
                  title={"TenantName"}
                  value={this.name}
                  onChange={value => this.name = value}
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
            <div className="owner">
              <SubTitle title={<Trans>Owner</Trans>} />
              <Input
                  required={true}
                  disabled={true}
                  title={"Owner"}
                  value={this.owner}
                  onChange={value => this.owner = value}
              />
            </div>

          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}