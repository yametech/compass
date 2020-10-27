import { observer } from "mobx-react";
import React from "react";
import { Dialog, DialogProps } from "../dialog";
import { observable } from "mobx";
import { Wizard, WizardStep } from "../wizard";
import { t, Trans } from "@lingui/macro";
import { Input } from "../input";
import { _i18n } from "../../i18n";
import { configStore } from "../../config.store";
import { WorkloadEntrySpec } from "../../api/endpoints/istio-workload-entry.api";
import { Notifications } from "../notifications";
import { workloadEntryApi } from "../../api/endpoints";
import { PortDetails, Lable } from "../+istio-common/ports"
import { LabelDetails } from "../+istio-common/label"

interface Props extends DialogProps {
}


export interface WorkloadEntryExt extends WorkloadEntrySpec {
    name: string;
    weightStr: string
}

export const defaultWorkloadEntry: WorkloadEntryExt = {
    name: "",
    weightStr: "",
    address: "",
    network: "",
    locality: "",
    serviceAccount: "",
}


@observer
export class WorkloadEntryDialog extends React.Component<Props> {

    @observable static isOpen = false;
    @observable workloadEntryDetial: WorkloadEntryExt = defaultWorkloadEntry;
    @observable keyPairLabels: Lable[] = [];
    @observable keyPairPorts: Lable[] = [];


    static open() {
        WorkloadEntryDialog.isOpen = true;
    }

    static close() {
        WorkloadEntryDialog.isOpen = false;
    }

    close = async () => {
        WorkloadEntryDialog.close();
        await this.reset();
    }

    reset = async () => {

    }

    addGateWay = async () => {
        try {

            let workloadEntry: WorkloadEntrySpec = {

            }

            if (this?.workloadEntryDetial?.address !== "") {
                workloadEntry.address = this.workloadEntryDetial.address;
            }
            if (this?.workloadEntryDetial?.locality !== "") {
                workloadEntry.locality = this?.workloadEntryDetial?.locality;
            }
            if (this?.workloadEntryDetial?.network !== "") {
                workloadEntry.network = this?.workloadEntryDetial?.network;
            }
            if (this?.workloadEntryDetial?.serviceAccount !== "") {
                workloadEntry.serviceAccount = this?.workloadEntryDetial?.serviceAccount;
            }
            if (this?.workloadEntryDetial?.weightStr !== "") {
                workloadEntry.weight = Number(this?.workloadEntryDetial?.weightStr);
            }
            if (this?.keyPairLabels.length > 0) {
                workloadEntry.labels = new Map<string, string>();
                this?.keyPairLabels?.map((label) => {
                    workloadEntry.labels.set(label.key, label.value);
                });
                workloadEntry.labels = Object.fromEntries(workloadEntry.labels) as any;
            }
            if (this?.keyPairPorts.length > 0) {
                workloadEntry.ports = new Map<string, number>();
                this?.keyPairPorts?.map((port) => {
                    workloadEntry.ports.set(port.key, Number(port.value));
                });
                workloadEntry.ports = Object.fromEntries(workloadEntry.ports) as any;
            }


            await workloadEntryApi.create(
                {
                    name: this?.workloadEntryDetial?.name,
                    namespace: configStore.getOpsNamespace(),
                    labels: new Map<string, string>().set(
                        "namespace",
                        configStore.getDefaultNamespace()
                    ),
                },
                {
                    spec: workloadEntry
                }
            )
            Notifications.ok(
                <>WorkloadEntry {name} succeeded</>
            );
            await this.close();
        } catch (err) {
            Notifications.error(err);
        }
    }

    render() {
        const header = <h5><Trans>WorkloadEntry</Trans></h5>;

        return (
            <Dialog
                className="WorkloadEntryDialog"
                isOpen={WorkloadEntryDialog.isOpen}
                close={this.close}
                pinned
            >
                <Wizard header={header} done={this.close}>
                    <WizardStep contentClass="flex gaps column" next={this.addGateWay}>
                        <Input
                            required={true}
                            placeholder={_i18n._("Name")}
                            value={this.workloadEntryDetial.name}
                            onChange={(value) => (this.workloadEntryDetial.name = value)}
                        />
                        <Input

                            placeholder={_i18n._("Address")}
                            value={this.workloadEntryDetial.address}
                            onChange={(value) => (this.workloadEntryDetial.address = value)}
                        />
                        <Input

                            placeholder={_i18n._("Network")}
                            value={this.workloadEntryDetial.network}
                            onChange={(value) => (this.workloadEntryDetial.network = value)}
                        />
                        <Input

                            placeholder={_i18n._("Locality")}
                            value={this.workloadEntryDetial.locality}
                            onChange={(value) => (this.workloadEntryDetial.locality = value)}
                        />
                        <Input

                            placeholder={_i18n._("ServiceAccount")}
                            value={this.workloadEntryDetial.serviceAccount}
                            onChange={(value) => (this.workloadEntryDetial.serviceAccount = value)}
                        />
                        <Input

                            placeholder={_i18n._("Weight")}
                            value={this.workloadEntryDetial.weightStr}
                            onChange={(value) => (this.workloadEntryDetial.weightStr = value)}
                        />

                        <LabelDetails value={this.keyPairLabels} />
                        <PortDetails value={this.keyPairPorts} />
                    </WizardStep>
                </Wizard>
            </Dialog>
        )
    }
}