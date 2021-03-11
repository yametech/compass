import './tenant.scss'
import * as React from "react";
import {observer} from "mobx-react";
import {Redirect, Route, Switch} from "react-router";
import {RouteComponentProps} from "react-router-dom";
import {Trans} from "@lingui/macro";
import {MainLayout, TabRoute} from "../layout/main-layout";
import {TenantDepartments} from '../+tenant-department';
import {TenantRoles} from '../+tenant-role';
import {TenantUsers} from "../+tenant-user";
import {namespaceStore} from "../+namespaces/namespace.store";
import {
    tenantDepartmentRoute,
    tenantDepartmentURL,
    tenantRoleRoute,
    tenantRoleURL,
    tenantTenantRoute,
    tenantTenantURL,
    tenantUserRoute,
    tenantUserURL
} from './tenant.route'
import {Tenants} from "../+tenant-tenant";

interface Props extends RouteComponentProps {
}

@observer
export class Tenant extends React.Component<Props> {

    static get tabRoutes(): TabRoute[] {
        const query = namespaceStore.getContextParams();
        return [
            {
                title: <Trans>BaseTenant</Trans>,
                component: Tenants,
                url: tenantTenantURL({query}),
                path: tenantTenantRoute.path
            },
            {
                title: <Trans>Department</Trans>,
                component: TenantDepartments,
                url: tenantDepartmentURL({query}),
                path: tenantDepartmentRoute.path
            },
            {
                title: <Trans>Role</Trans>,
                component: TenantRoles,
                url: tenantRoleURL({query}),
                path: tenantRoleRoute.path
            },
            {
                title: <Trans>User</Trans>,
                component: TenantUsers,
                url: tenantUserURL({query}),
                path: tenantUserRoute.path
            },
        ]
    };

    render() {
        const tabRoutes = Tenant.tabRoutes;
        return (
            <MainLayout className="tenant" tabs={tabRoutes}>
                <Switch>
                    {tabRoutes.map((route, index) => <Route key={index} {...route}/>)}
                    <Redirect to={tabRoutes[0].url}/>
                </Switch>
            </MainLayout>
        )
    }
}