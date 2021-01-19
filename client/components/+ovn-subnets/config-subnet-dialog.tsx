import React from "react";
import { Dialog, DialogProps } from "../dialog";
import { t, Trans } from "@lingui/macro";
import { Wizard, WizardStep } from "../wizard";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Notifications } from "../notifications";
import { SubTitle } from "../layout/sub-title";
import { Input } from "../input";
import { _i18n } from "../../i18n";
import { Select, SelectOption } from "../select";
import { Icon } from "../icon";
import { NamespaceSelect } from "../+namespaces/namespace-select";
import { Namespace, subNetApi, SubNet } from "../../api/endpoints";
import { ExcludeIPsDetails } from "./excludeips-details";
import { AllowSubnets } from "./allow-subnets";
import { Checkbox } from "../checkbox";

interface Props extends DialogProps {
}

@observer
export class ConfigSubNetDialog extends React.Component<Props> {

    @observable static isOpen = false;
    @observable static Data: SubNet;
    @observable name: string = "";
    @observable protocol: string = "IPV4";
    @observable cidrBlock: string = "";
    @observable gateway: string = "";
    @observable namespaces = observable.array<Namespace>([], { deep: false });
    @observable excludeIps: string[] = [];
    @observable _private: boolean = false;
    @observable allowSubnets: string[] = [];


    static open(data: SubNet) {
        ConfigSubNetDialog.isOpen = true;
        ConfigSubNetDialog.Data = data;
    }

    static close() {
        ConfigSubNetDialog.isOpen = false;
    }

    close = () => {
        ConfigSubNetDialog.close();
    }

    reset() {
        this.name = "";
        this.cidrBlock = "";
        this.gateway = "";
    }


    get subNet() {
        return ConfigSubNetDialog.Data
    }

    get protocolOptions() {
        return [
            "IPV4"
        ]
    }

    onOpen = () => {
        this.name = this.subNet.getName();
        this.cidrBlock = this.subNet.spec.cidrBlock;
        this.gateway = this.subNet.spec.gateway;
        this.namespaces.replace(this.subNet.spec.namespaces);
        this.excludeIps = this.subNet.spec.excludeIps;
        this._private = this.subNet.spec.private;
        if (!this._private) {
            this.allowSubnets = [];
        } else {
            this.allowSubnets = this.subNet.spec.allowSubnets;
        }
    }


    updateSubnet = async () => {
        const { protocol, cidrBlock, gateway, namespaces, excludeIps, _private, allowSubnets } = this;
        const subnet: Partial<SubNet> = {
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
        }
        try {
            await subNetApi.create({
                namespace: '',
                name: this.subNet.metadata.name
            },
                { ...subnet });
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
        const { value, label } = option;
        return label || (
            <>
                <Icon small material="layers" className="primary" />
                {value}
            </>
        );
    }

    render() {
        const { ...dialogProps } = this.props;
        const unwrapNamespaces = (options: SelectOption[]) => options.map(option => option.value);
        const header = <h5><Trans>Config SubNet</Trans></h5>;
        return (
            <Dialog
                {...dialogProps}
                isOpen={ConfigSubNetDialog.isOpen}
                onOpen={this.onOpen}
                close={this.close}
            >
                <Wizard className="ConfigSubNetDialog" header={header} done={this.close}>
                    <WizardStep
                        contentClass="flex gaps column"
                        nextLabel={<Trans>Apply</Trans>}
                        next={this.updateSubnet}
                    >
                        <SubTitle title={<Trans>Name</Trans>} />
                        <Input
                            required autoFocus
                            placeholder={_i18n._(t`Name`)}
                            value={this.name}
                            onChange={(value: string) => this.name = value}
                        />
                        <SubTitle title={<Trans>Protocol</Trans>} />
                        <Select
                            value={this.protocol}
                            options={this.protocolOptions}
                            formatOptionLabel={this.formatOptionLabel}
                            onChange={value => this.protocol = value.value}
                        />
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
                        <SubTitle title={<Trans>Gateway</Trans>} />
                        <Input
                            required autoFocus
                            placeholder={_i18n._(t`Gateway`)}
                            value={this.gateway}
                            onChange={(value: string) => this.gateway = value}
                        />
                        <SubTitle title={<Trans>CIDR Block</Trans>} />
                        <Input
                            required autoFocus
                            placeholder={_i18n._(t`CIDR Block`)}
                            value={this.cidrBlock}
                            onChange={(value: string) => this.cidrBlock = value}
                        />
                        <ExcludeIPsDetails
                            value={this.excludeIps} onChange={value => { this.excludeIps = value }} />
                        <br />
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
                                        value={this.allowSubnets} onChange={(value => { this.allowSubnets = value })}
                                    />
                                </> : null
                        }
                    </WizardStep>
                </Wizard>
            </Dialog>
        )
    }
}