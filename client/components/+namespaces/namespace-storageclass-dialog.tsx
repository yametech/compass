import React from "react";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { observable } from "mobx";
import { Input } from "../input"
import { Wizard, WizardStep } from "../wizard";
import { t, Trans } from "@lingui/macro";
import { SubTitle } from "../layout/sub-title";
import { _i18n } from "../../i18n";
import { NodeSelect } from "../+nodes"
import { apiBase } from "../../api";
import { Notifications } from "../notifications";
import { Namespace, StorageClass } from "../../api/endpoints"
import { SelectOption } from "../select/select";
import { namespaceStore } from "./namespace.store";
import { StorageClassSelect } from "../+storage-classes/storage-select";

interface Props extends Partial<DialogProps> {
}

@observer
export class NamespaceStorageClasslimit extends React.Component<Props> {

    @observable static isOpen = false;
    @observable static namespace: Namespace;
    // @observable storageClasses = observable.array<any>([], { deep: false });
    @observable storageClasses: string = "";


    static open(namespace: Namespace) {
        NamespaceStorageClasslimit.isOpen = true;
        NamespaceStorageClasslimit.namespace = namespace;
    }

    static close() {
        NamespaceStorageClasslimit.isOpen = false;
    }


    close = () => {
        NamespaceStorageClasslimit.close();
    }

    onOpen = () => {
        NamespaceStorageClasslimit.namespace.getAnnotations().map(annotation => {
            const annotationKeyValue = annotation.split("=");
            if (annotationKeyValue[0] == "fuxi.kubernetes.io/default_storage_limit") {
                this.storageClasses = JSON.parse(annotationKeyValue[1])[0];
            }
        })
    }

    updateAnnotate = async () => {
        const data = {
            namespace: NamespaceStorageClasslimit.namespace.getName(),
            storageClasses: new Array<string>()
        };
        data.storageClasses.push(this.storageClasses);

        try {
            await apiBase.post("/namespaces/annotation/storageclass", { data }).
                then(() => {
                    this.close();
                })
            Notifications.ok(
              <> {NamespaceStorageClasslimit.namespace.getName()} annotation succeeded </>
            );
        } catch (err) {
            Notifications.error(err);
        }
    }

    render() {
        const { ...dialogProps } = this.props;
        // const unwrapStorageClasses = (options: SelectOption[]) => options.map(option => option.value);
        const header = <h5><Trans>Annotate StorageClass</Trans></h5>;
        return (
            <Dialog
                {...dialogProps}
                className="NamespaceStorageClasslimit"
                isOpen={NamespaceStorageClasslimit.isOpen}
                onOpen={this.onOpen}
                close={this.close}
            >
                <Wizard header={header} done={this.close}>
                    <WizardStep contentClass="flow column" nextLabel={<Trans>Annotate</Trans>}
                        next={this.updateAnnotate}>
                        <div className="node">
                            <SubTitle title={<Trans>Annotate StorageClass</Trans>} />
                            <StorageClassSelect
                                // isMulti
                                isClearable
                                value={this.storageClasses}
                                placeholder={_i18n._(t`StorageClass`)}
                                themeName="light"
                                className="box grow"
                                onChange={value => this.storageClasses = value.value}
                                // onChange={(opts: SelectOption[]) => {
                                //     if (!opts) opts = [];
                                //     this.storageClasses.replace(unwrapStorageClasses(opts));
                                // }}
                            />
                        </div>
                    </WizardStep>
                </Wizard>
            </Dialog>
        )
    }
}