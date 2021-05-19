import "./add-subenet-dialog.scss"

import React from "react";
import {Dialog, DialogProps} from "../dialog";
import {t, Trans} from "@lingui/macro";
import {Wizard, WizardStep} from "../wizard";
import {observable} from "mobx";
import {observer} from "mobx-react";
import {Notifications} from "../notifications";
import {SubTitle} from "../layout/sub-title";
import {Input} from "../input";
import {_i18n} from "../../i18n";
import {Select, SelectOption} from "../select";
import {Icon} from "../icon";
import {NamespaceSelect} from "../+namespaces/namespace-select";
import {Namespace, subNetApi} from "../../api/endpoints";
import {ExcludeIPsDetails} from "./excludeips-details";
import {AllowSubnets} from "./allow-subnets";
import {Checkbox} from "../checkbox";

interface Props extends DialogProps {
}

@observer
export class AddSubNetDialog extends React.Component<Props> {

  @observable static isOpen = false;
  @observable name: string = "";
  @observable protocol: string = "IPV4";
  @observable cidrBlock: string = "";
  @observable gateway: string = "";
  @observable namespaces = observable.array<Namespace>([], {deep: false});
  @observable excludeIps: string[] = [];
  @observable _private: boolean = false;
  @observable allowSubnets: string[] = [];

  static open() {
    AddSubNetDialog.isOpen = true;
  }

  static close() {
    AddSubNetDialog.isOpen = false;
  }

  close = () => {
    AddSubNetDialog.close();
  }

  reset() {
    this.name = "";
    this.cidrBlock = "";
    this.gateway = "";
  }

  get protocolOptions() {
    return [
      "IPV4"
    ]
  }

  addSubNet = async () => {
    const {name, protocol, cidrBlock, gateway, namespaces, excludeIps, _private, allowSubnets} = this

    try {
      await subNetApi.create({name: name, namespace: ''}, {
        spec: {
          protocol: protocol,
          cidrBlock: cidrBlock,
          gateway: gateway,
          namespaces: namespaces,
          excludeIps: excludeIps,
          private: _private,
          allowSubnets: allowSubnets,
          natOutgoing: true,
          gatewayType: "distributed",
        }
      })
      this.reset();
      Notifications.ok(
        <>SubNet {name} save succeeded</>
      );
      this.close();
    } catch (err) {
      Notifications.error(err);
    }

  }

  formatOptionLabel = (option: SelectOption) => {
    const {value, label} = option;
    return label || (
      <>
        <Icon small material="layers" className="primary" />
        {value}
      </>
    );
  }

  render() {
    const {...dialogProps} = this.props;
    const unwrapNamespaces = (options: SelectOption[]) => options.map(option => option.value);
    const header = <h5><Trans>Create SubNet</Trans></h5>;
    return (
      <Dialog
        {...dialogProps}
        className="AddSubNetDialog"
        isOpen={AddSubNetDialog.isOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep
            contentClass="flex gaps column"
            nextLabel={<Trans>Create</Trans>}
            next={this.addSubNet}
          >
            <SubTitle title={<Trans>Name</Trans>}/>
            <Input
              required autoFocus
              placeholder={_i18n._(t`Name`)}
              value={this.name}
              onChange={(value: string) => this.name = value}
            />
            <SubTitle title={<Trans>Protocol</Trans>}/>
            <Select
              value={this.protocol}
              options={this.protocolOptions}
              formatOptionLabel={this.formatOptionLabel}
              onChange={value => this.protocol = value.value}
            />
            <SubTitle title={<Trans>Namespace</Trans>}/>
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
            <SubTitle title={<Trans>Gateway</Trans>}/>
            <Input
              required autoFocus
              placeholder={_i18n._(t`Gateway`)}
              value={this.gateway}
              onChange={(value: string) => this.gateway = value}
            />
            <SubTitle title={<Trans>CIDR Block</Trans>}/>
            <Input
              required autoFocus
              placeholder={_i18n._(t`CIDR Block`)}
              value={this.cidrBlock}
              onChange={(value: string) => this.cidrBlock = value}
            />
            <br/>
            <ExcludeIPsDetails
              value={this.excludeIps} onChange={value => {
              this.excludeIps = value
            }}/>
            <br/>
            <Checkbox
              theme="light"
              label={<Trans> AllowSubnets </Trans>}
              value={this._private}
              onChange={(v: boolean) => this._private = v}
            />
            {
              this._private ?
                <>
                  <AllowSubnets
                    value={this.allowSubnets} onChange={(value => {
                    this.allowSubnets = value
                  })}
                  />
                </> : null
            }
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}