import React from "react";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { observable } from "mobx";
import { Wizard, WizardStep } from "../wizard";
import { t, Trans } from "@lingui/macro";
import { SubTitle } from "../layout/sub-title";
import { _i18n } from "../../i18n";
import { NodeSelect } from "../+nodes"
import { Notifications } from "../notifications";
import { Namespace } from "../../api/endpoints"
import { SelectOption } from "../select/select";
import { apiManager } from "../../../client/api/api-manager";


interface NodeResourceLimit {
    zone: string;
    rack: string;
    host: string;
    name: string;
}

interface Props extends Partial<DialogProps> {
}

@observer
export class NamespaceNodeRangeLimitDialog extends React.Component<Props> {

    @observable static isOpen = false;
    @observable static namespace: Namespace;
    @observable nodes = observable.array<any>([], { deep: false });


    static open(namespace: Namespace) {
        NamespaceNodeRangeLimitDialog.isOpen = true;
        NamespaceNodeRangeLimitDialog.namespace = namespace;
    }

    static close() {
        NamespaceNodeRangeLimitDialog.isOpen = false;
    }


    close = () => {
        this.reset();
        NamespaceNodeRangeLimitDialog.close();
    }

    reset = () => {
        this.nodes = observable.array<any>([], { deep: false });
    }

    onOpen = () => {
        let nodeResourceLimitTemps: NodeResourceLimit[] = JSON.parse(NamespaceNodeRangeLimitDialog.namespace.getAnnotation("nuwa.kubernetes.io/default_resource_limit"));
        nodeResourceLimitTemps.map(node => {
            if (this.nodes === null) { this.nodes = observable.array<any>([], { deep: false }) };
            this.nodes.push(node.name)
        })
    }

    updateAnnotate = async () => {
        const ns = NamespaceNodeRangeLimitDialog.namespace;

        const data = {
            namespace: ns.getName(),
            nodes: new Array<string>()
        };
        this.nodes.map(node => {
            data.nodes.push(node);
        })

        try {
            await apiManager.getApi(ns.selfLink).annotate({ name: ns.getName(), namespace: "", subresource: "node" }, { data })
            Notifications.ok(
                <>{NamespaceNodeRangeLimitDialog.namespace.getName()} annotation node succeeded</>)
                ;
        } catch (err) {
            Notifications.error(err);
        } finally {
            this.close();
        }
    }

    render() {
        const { ...dialogProps } = this.props;
        const unwrapNodes = (options: SelectOption[]) => options.map(option => option.value);
        const header = <h5><Trans>Annotate Node</Trans></h5>;
        return (
            <Dialog
                {...dialogProps}
                className="NamespaceNodeRangeLimitDialog"
                isOpen={NamespaceNodeRangeLimitDialog.isOpen}
                onOpen={this.onOpen}
                close={this.close}
            >
                <Wizard header={header} done={this.close}>
                    <WizardStep contentClass="flow column" nextLabel={<Trans>Annotate</Trans>}
                        next={this.updateAnnotate}>
                        <div className="node">
                            <SubTitle title={<Trans>Annotate Node</Trans>} />
                            <NodeSelect
                                isMulti
                                value={this.nodes}
                                placeholder={_i18n._(t`Node`)}
                                themeName="light"
                                className="box grow"
                                onChange={(opts: SelectOption[]) => {
                                    if (!opts) opts = [];
                                    this.nodes.replace(unwrapNodes(opts));
                                }}
                            />
                        </div>
                    </WizardStep>
                </Wizard>
            </Dialog>
        )
    }
}