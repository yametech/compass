import * as React from "react";
import {observer} from "mobx-react";
import {RouteComponentProps} from "react-router";
import {t, Trans} from "@lingui/macro";
import {KubeObjectMenu, KubeObjectMenuProps} from "../kube-object";
import {KubeObjectListLayout} from "../kube-object";
import {TenantRole, tenantRoleApi} from "../../api/endpoints";
import {apiManager} from "../../api/api-manager";
import {tenantRoleStore} from "./role.store"

import {AddRoleDialog} from "./add-role-dialog";
import {ConfigRoleDialog} from "./config-role-dialog";
import {GrantRoleDialog} from "./grant-role-dialog";
import {MenuItem} from "../menu";
import {Icon} from "../icon";
import {_i18n} from "../../i18n";
import {Link} from "react-router-dom";
import {stopPropagation} from "../../utils";
import Tooltip from "@material-ui/core/Tooltip";

enum sortBy {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface RoleProps {
}

interface Props extends RouteComponentProps<RoleProps> {
}

@observer
export class TenantRoles extends React.Component<Props> {

  renderRoleName(role: TenantRole) {
    const name = role.getName();
    return (
      <Link onClick={(event) => { stopPropagation(event); ConfigRoleDialog.open(role) }} to={null}>
        <Tooltip title={name} placement="top-start">
          <span>{name}</span>
        </Tooltip>
      </Link>
    );
  }

  render() {
    return (
      <>
        <KubeObjectListLayout
          // onDetails={() => {}}
          className="TenantRoles" store={tenantRoleStore}
          sortingCallbacks={{
            [sortBy.name]: (item: TenantRole) => item.getName(),
            [sortBy.namespace]: (item: TenantRole) => item.getNs(),
          }}
          searchFilters={[
            (item: TenantRole) => item.getSearchFields()
          ]}
          renderHeaderTitle={<Trans>Roles</Trans>}
          renderTableHeader={[
            {title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name},
            {title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace},
            {title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age},
          ]}
          renderTableContents={(role: TenantRole) => [
            this.renderRoleName(role),
            role.getNs(),
            role.getAge(),
          ]}
          renderItemMenu={(item: TenantRole) => {
            return <RoleMenu object={item}/>
          }}
          addRemoveButtons={{
            onAdd: () => AddRoleDialog.open(),
            addTooltip: <Trans>Create new Role</Trans>
          }}
        />
        <AddRoleDialog/>
        <ConfigRoleDialog/>
        <GrantRoleDialog/>
      </>
    );
  }
}

export function RoleMenu(props: KubeObjectMenuProps<TenantRole>) {

  const {object, toolbar} = props;

  return (
    <KubeObjectMenu {...props}>
      <MenuItem onClick={() => ConfigRoleDialog.open(object)}>
        <Icon material="toc" title={_i18n._(t`Config`)} interactive={toolbar}/>
        <span className="config"><Trans>Config</Trans></span>
      </MenuItem>
      <MenuItem onClick={() => GrantRoleDialog.open(object)}>
        <Icon material="sync_alt" title={_i18n._(t`Grant`)} interactive={toolbar}/>
        <span className="sync_alt"><Trans>Grant</Trans></span>
      </MenuItem>
    </KubeObjectMenu>
  )
}

apiManager.registerViews(tenantRoleApi, {
  Menu: RoleMenu,
})
