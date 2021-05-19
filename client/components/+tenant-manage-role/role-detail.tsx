import React from "react";
import { KubeObjectDetailsProps } from "../kube-object";
import { observer } from "mobx-react";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { KubeEventDetails } from "../+events/kube-event-details";
import { apiManager } from "../../api/api-manager";
import { TenantRole, tenantRoleApi } from "../../../client/api/endpoints";

interface Props extends KubeObjectDetailsProps<TenantRole> {
}

@observer
export class TenantRolesDetails extends React.Component<Props> {
    render() {
        const { object: tenantRole } = this.props;
        if (!tenantRole) {
            return null;
        }
        return (
            <div className="TenantUserDetails">
                <KubeObjectMeta object={tenantRole} />
                <KubeEventDetails object={tenantRole} />
            </div>
        )
    }
}

apiManager.registerViews(tenantRoleApi, {
    Details: TenantRolesDetails,
});