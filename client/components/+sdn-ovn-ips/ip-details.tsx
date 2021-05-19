import React from "react";
import { observer } from "mobx-react";
import { KubeObjectDetailsProps } from "../kube-object";
import { apiManager } from "../../api/api-manager";
import { IP, ipApi } from "../../api/endpoints/ip.api";
import { DrawerItem } from "../drawer/drawer-item";
import { Trans } from "@lingui/macro";
import { KubeEventDetails } from "../+events/kube-event-details";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<IP> {
}

@observer
export class IPDetails extends React.Component<Props> {

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