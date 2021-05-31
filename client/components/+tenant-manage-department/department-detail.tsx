import React from "react";
import { KubeObjectDetailsProps } from "../kube-object";
import { observer } from "mobx-react";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { KubeEventDetails } from "../+events/kube-event-details";
import { apiManager } from "../../api/api-manager";
import { TenantDepartment, tenantDepartmentApi } from "../../api/endpoints";

interface Props extends KubeObjectDetailsProps<TenantDepartment> {
}

@observer
export class TenantDepartmentsDetails extends React.Component<Props> {
    render() {
        const { object: tenantDepartment } = this.props;
        if (!tenantDepartment) {
            return null;
        }
        return (
            <div className="TenantDepartmentsDetails">
                <KubeObjectMeta object={tenantDepartment} />
                <KubeEventDetails object={tenantDepartment} />
            </div>
        )
    }
}

apiManager.registerViews(tenantDepartmentApi, {
    Details: TenantDepartmentsDetails,
});