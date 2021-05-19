import React from "react";
import { KubeObjectDetailsProps } from "../kube-object";
import { observer } from "mobx-react";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { KubeEventDetails } from "../+events/kube-event-details";
import { apiManager } from "../../api/api-manager";
import { tenantUserApi, TenantUser } from "../../api/endpoints/tenant-user";

interface Props extends KubeObjectDetailsProps<TenantUser> {
}

@observer
export class TenantUsersDetails extends React.Component<Props> {
    render() {
        const { object: tenantUser } = this.props;
        if (!tenantUser) {
            return null;
        }
        return (
            <div className="TenantUserDetails">
                <KubeObjectMeta object={tenantUser} />
                <KubeEventDetails object={tenantUser} />
            </div>
        )
    }
}

apiManager.registerViews(tenantUserApi, {
    Details: TenantUsersDetails,
});