import * as React from "react";
import {observer} from "mobx-react";
import {RouteComponentProps} from "react-router";
import {t, Trans} from "@lingui/macro";
import {KubeObjectMenu, KubeObjectMenuProps} from "../kube-object";
import {KubeObjectListLayout} from "../kube-object";
import {tenantUserStore} from "./user.store";
import {TenantUser, tenantUserApi} from "../../api/endpoints";
import {apiManager} from "../../api/api-manager";
import {AddUserDialog} from "./add-user-dialog";
import {ConfigUserDialog} from "./config-user-dialog";
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

interface UserProps {
}

interface Props extends RouteComponentProps<UserProps> {
}

@observer
export class TenantUsers extends React.Component<Props> {
  spec: { scaleTargetRef: any; };

  renderUserName(user: TenantUser) {
    const name = user.getName();
    return (
      <Link onClick={(event) => { stopPropagation(event); ConfigUserDialog.open(user) }} to={null}>
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
          onDetails={() => {
          }}
          className="Users" store={tenantUserStore}
          sortingCallbacks={{
            [sortBy.name]: (item: TenantUser) => item.getName(),
            [sortBy.namespace]: (item: TenantUser) => item.getNs(),
          }}
          searchFilters={[
            (item: TenantUser) => item.getSearchFields()
          ]}
          renderHeaderTitle={<Trans>Users</Trans>}
          renderTableHeader={[
            {title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name},
            {title: <Trans>TenantName</Trans>, className: "tenant"},
            {title: <Trans>Department</Trans>, className: "department"},
            {title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace},
            {title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age},
          ]}
          renderTableContents={(user: TenantUser) => [
            this.renderUserName(user),
            user.spec.tenant_id,
            user.spec.department_id,
            user.getNs(),
            user.getAge(),
          ]}
          renderItemMenu={(item: TenantUser) => {
            return <TenantUserMenu object={item}/>
          }}
          addRemoveButtons={{
            onAdd: () => AddUserDialog.open(),
            addTooltip: <Trans>Create new User</Trans>
          }}
        />
        <AddUserDialog/>
        <ConfigUserDialog/>
      </>
    );
  }
}

export function TenantUserMenu(props: KubeObjectMenuProps<TenantUser>) {

  const {object, toolbar} = props;

  return (
    <KubeObjectMenu {...props}>
      <MenuItem onClick={() => ConfigUserDialog.open(object)}>
        <Icon material="toc" title={_i18n._(t`Config`)} interactive={toolbar}/>
        <span className="config"><Trans>Config</Trans></span>
      </MenuItem>
    </KubeObjectMenu>
  )
}

apiManager.registerViews(tenantUserApi, {
  Menu: TenantUserMenu,
})
