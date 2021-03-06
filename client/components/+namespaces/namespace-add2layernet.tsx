import React from "react";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { observable } from "mobx";
import { Wizard, WizardStep } from "../wizard";
import { t, Trans } from "@lingui/macro";
import { SubTitle } from "../layout/sub-title";
import { _i18n } from "../../i18n";
import { Notifications } from "../notifications";
import { Namespace, namespacesApi } from "../../api/endpoints"
import { NetworkAttachmentDefinitionSelect } from "../+sdn-multus-network-attachment-definition/network-attachment-definition-select";
import { apiManager } from "../../../client/api/api-manager";

interface Props extends Partial<DialogProps> {
}

@observer
export class Namespace2Layernet extends React.Component<Props> {
    @observable static isOpen = false;
    @observable static namespace: Namespace;
    @observable networkAttachment: string = "";
    @observable networkAttachmentNamespace: string = "";

    static open(namespace: Namespace) {
        Namespace2Layernet.isOpen = true;
        Namespace2Layernet.namespace = namespace;
    }

    static close() {
        Namespace2Layernet.isOpen = false;
    }


    close = () => {
        Namespace2Layernet.close();
    }

    onOpen = () => {
        this.networkAttachment = Namespace2Layernet.namespace.getAnnotation("k8s.v1.cni.cncf.io/namespaces");
        this.networkAttachmentNamespace = Namespace2Layernet.namespace.getName();
    }

    updateAnnotate = async () => {
        const data = {
            namespace: Namespace2Layernet.namespace.getName(),
            networkAttachment: this.networkAttachment,
        };

        try {
            const ns = Namespace2Layernet.namespace;
            await apiManager.getApi(ns.selfLink).annotate({ name: ns.getName(), namespace: "", subresource: "networkattachment" }, { data });
            Notifications.ok(
                <> namespace {Namespace2Layernet.namespace.getName()} annotation networkAttachmentDefinition succeeded </>
            );
        } catch (err) {
            Notifications.error(err);
        } finally {
            this.close();
        }
    }

    render() {
        const { ...dialogProps } = this.props;
        const header = <h5><Trans>NetworkAttachmentDefinition</Trans></h5>;

        return (
            <Dialog
                {...dialogProps}
                className="Namespace2Layernet"
                isOpen={Namespace2Layernet.isOpen}
                onOpen={this.onOpen}
                close={this.close}
            >
                <Wizard header={header} done={this.close}>
                    <WizardStep contentClass="flow column" nextLabel={<Trans>Annotate</Trans>}
                        next={this.updateAnnotate}>
                        <div className="node">
                            <SubTitle title={<Trans>Chioce NetworkAttachment</Trans>} />
                            <NetworkAttachmentDefinitionSelect
                                isClearable
                                value={this.networkAttachment}
                                placeholder={_i18n._(t`NetworkAttachment`)}
                                themeName="light"
                                className="box grow"
                                namespace={this.networkAttachmentNamespace}
                                onChange={value => this.networkAttachment = value.value}
                            />
                        </div>
                    </WizardStep>
                </Wizard>
            </Dialog>
        )
    }
}