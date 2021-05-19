import * as React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { t, Trans } from "@lingui/macro";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object";
import { KubeObjectListLayout } from "../kube-object";
import { IIPRouteParams } from "./ip.route";
import { ipStore } from "./ip.store";
import { apiManager } from "../../api/api-manager";
import { IP, ipApi } from "../../api/endpoints/ip.api";

enum sortBy {
    name = "name",
    namespace = "namespace",
    age = "age",
}

interface Props extends RouteComponentProps<IIPRouteParams> {
}

@observer
export class IPs extends React.Component<Props> {

    render() {
        return (
            <>
                <KubeObjectListLayout
                    className="IP" store={ipStore}
                    sortingCallbacks={{
                        [sortBy.name]: (item: IP) => item.getName(),
                        [sortBy.namespace]: (item: IP) => item.getNs(),
                    }}
                    searchFilters={[
                        (item: IP) => item.getSearchFields()
                    ]}
                    renderHeaderTitle={<Trans>IP</Trans>}
                    renderTableHeader={[
                        { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
                        { title: <Trans>Namespace</Trans>, className: "namespace" },
                        { title: <Trans>IP Address</Trans>, className: "ipAddress" },
                        { title: <Trans>Mac Address</Trans>, className: "macAddress" },
                        { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
                    ]}
                    renderTableContents={(field: IP) => [
                        field.getName(),
                        field.spec.namespace,
                        field.spec.ipAddress,
                        field.spec.macAddress,
                        field.getAge(),
                    ]}
                    renderItemMenu={(item: IP) => {
                        return <IPMenu object={item} />
                    }}
                />
            </>
        );
    }
}

export function IPMenu(props: KubeObjectMenuProps<IP>) {
    return (
        <KubeObjectMenu {...props} />
    )
}

apiManager.registerViews(ipApi, {
    Menu: IPMenu,
})
