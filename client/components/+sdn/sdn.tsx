import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Redirect, Route, Switch } from "react-router";
import { MainLayout, TabRoute } from "../layout/main-layout";
import { Trans } from "@lingui/macro";
import { namespaceStore } from "../+namespaces/namespace.store";
import { IPs, ipRoute, ipURL } from "../+sdn-ovn-ips";
import { SubNets, subNetURL, subNetRoute } from "../+sdn-ovn-subnets";
import {
    networkAttachmentDefinitionRoute,
    NetworkAttachmentDefinitions,
    networkAttachmentDefinitionURL
} from "../+sdn-multus-network-attachment-definition";

interface Props extends RouteComponentProps {
}

export class SDN extends React.Component<Props> {
    static get tabRoutes(): TabRoute[] {
        const query = namespaceStore.getContextParams();
        return [
            {
                title: <Trans>OVN-IP</Trans>,
                component: IPs,
                url: ipURL({ query }),
                path: ipRoute.path,
            },
            {
                title: <Trans>OVN-SubNet</Trans>,
                component: SubNets,
                url: subNetURL({ query }),
                path: subNetRoute.path,
            },
            {
                title: <Trans>Multus-NetworkAttachmentDefinition</Trans>,
                component: NetworkAttachmentDefinitions,
                url: networkAttachmentDefinitionURL({ query }),
                path: networkAttachmentDefinitionRoute.path,
            },
        ];
    }

    render() {
        const tabRoutes = SDN.tabRoutes;
        return (
            <MainLayout>
                <Switch>
                    {tabRoutes.map((route, index) => (
                        <Route key={index} {...route} />
                    ))}
                    <Redirect to={tabRoutes[0].url} />
                </Switch>
            </MainLayout>
        );
    }
}
