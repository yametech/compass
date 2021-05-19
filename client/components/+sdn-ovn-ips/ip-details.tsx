import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { reaction } from "mobx";
import { KubeObjectDetailsProps } from "../kube-object";
import { apiManager } from "../../api/api-manager";
import { IP, ipApi } from "../../api/endpoints/ip.api";
import { ipStore } from "./ip.store";
import { DrawerItem } from "../drawer/drawer-item";
import { Trans } from "@lingui/macro";
import { KubeEventDetails } from "../+events/kube-event-details";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<IP> {
}

@observer
export class IPDetails extends React.Component<Props> {
    @disposeOnUnmount
    clean = reaction(() => this.props.object, () => {
        ipStore.reset();
    });

    componentWillUnmount() {
        ipStore.reset();
    }

    render() {

        const { object: ip } = this.props;
        if (!ip) return;

        const { namespace, ipAddress, macAddress, nodeName } = ip.spec;

        return (
            <div className="IPDetails">
                <KubeObjectMeta object={ip} />
                <DrawerItem name={<Trans>Namespaces</Trans>}>
                    {namespace || ""}
                </DrawerItem>

                <DrawerItem name={<Trans>IpAddress</Trans>}>
                    {ipAddress || ""}
                </DrawerItem>

                <DrawerItem name={<Trans>MacAddress</Trans>}>
                    {macAddress || ""}
                </DrawerItem>

                <DrawerItem name={<Trans>NodeName</Trans>}>
                    {nodeName || ""}
                </DrawerItem>

                <KubeEventDetails object={ip} />
            </div>
        )
    }
}

apiManager.registerViews(ipApi, {
    Details: IPDetails,
});