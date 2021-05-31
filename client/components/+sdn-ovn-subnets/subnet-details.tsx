import React from "react";
import { observer } from "mobx-react";
import { KubeObjectDetailsProps } from "../kube-object";
import { apiManager } from "../../api/api-manager";
import { DrawerItem } from "../drawer/drawer-item";
import { Trans } from "@lingui/macro";
import { KubeEventDetails } from "../+events/kube-event-details";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { subNetApi, SubNet } from "../../api/endpoints";

interface Props extends KubeObjectDetailsProps<SubNet> {
}

@observer
export class SubNetDetails extends React.Component<Props> {

    render() {

        const { object: subnet } = this.props;
        if (!subnet) return;

        const { protocol, cidrBlock, gateway, excludeIps, namespaces, allowSubnets, natOutgoing, gatewayType } = subnet.spec;

        return (
            <div className="SubNetDetails">
                <KubeObjectMeta object={subnet} />
                <DrawerItem name={<Trans>Protocol</Trans>}>
                    {protocol || ""}
                </DrawerItem>

                <DrawerItem name={<Trans>CIDRBlock</Trans>}>
                    {cidrBlock || ""}
                </DrawerItem>

                <DrawerItem name={<Trans>Gateway</Trans>}>
                    {gateway || ""}
                </DrawerItem>
                <DrawerItem name={<Trans>GatewayType</Trans>}>
                    {gatewayType || ""}
                </DrawerItem>
                <DrawerItem name={<Trans>Namepsaces</Trans>}>
                    {subnet.getNamespacesSliceString()}
                </DrawerItem>
                <DrawerItem name={<Trans>ExcludeIps</Trans>}>
                    {subnet.getExcludeIPsSliceString()}
                </DrawerItem>
                <DrawerItem name={<Trans>AllowSubnets</Trans>}>
                    {subnet.getAllowSubnetsSliceString()}
                </DrawerItem>
                <DrawerItem name={<Trans>NatOutgoing</Trans>}>
                    {natOutgoing || ""}
                </DrawerItem>

                <KubeEventDetails object={subnet} />
            </div>
        )
    }
}

apiManager.registerViews(subNetApi, {
    Details: SubNetDetails,
});