import React from "react";
import { KubeObjectDetailsProps } from "../kube-object";
import { observer } from "mobx-react";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { KubeEventDetails } from "../+events/kube-event-details";
import { apiManager } from "../../api/api-manager";
import { tenantApi, Tenant } from "../../api/endpoints/tenant-tenant";

interface Props extends KubeObjectDetailsProps<Tenant> {
}

@observer
export class TenantsDetails extends React.Component<Props> {
    render() {
        const { object: tenant } = this.props;
        if (!tenant) {
            return null;
        }
        return (
            <div className="TenantsDetails">
                <KubeObjectMeta object={tenant} />
                <KubeEventDetails object={tenant} />
            </div>
        )
    }
}

apiManager.registerViews(tenantApi, {
    Details: TenantsDetails,
});