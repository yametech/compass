import * as React from "react";
import {observer} from "mobx-react";
import {RouteComponentProps} from "react-router";
import {t, Trans} from "@lingui/macro";
import {KubeObjectListLayout, KubeObjectMenu, KubeObjectMenuProps} from "../kube-object";
import {tenantUserApi} from "../../api/endpoints";
import {apiManager} from "../../api/api-manager";
import {AddTenantDialog} from "./add-tenant-dialog";
import {ConfigTenantDialog} from "./config-tenant-dialog";
import {MenuItem} from "../menu";
import {Icon} from "../icon";
import {_i18n} from "../../i18n";
import Tooltip from "@material-ui/core/Tooltip";
import {Tenant} from "../../api/endpoints/tenant-tenant";
import {tenantStore} from "./tenant.store";
import {Link} from "react-router-dom";
import {stopPropagation} from "../../utils";

enum sortBy {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface TenantProps {
}

interface Props extends RouteComponentProps<TenantProps> {
}

@observer
export class Tenants extends React.Component<Props> {
  spec: { scaleTargetRef: any; };

  renderTenantName(tenant: Tenant) {
    const name = tenant.getName();
    return (
      <Link onClick={(event) => { stopPropagation(event); ConfigTenantDialog.open(tenant) }} to={null}>
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
          className="Tenants" store={tenantStore}
          sortingCallbacks={{
            [sortBy.name]: (item: Tenant) => item.getName(),
            [sortBy.namespace]: (item: Tenant) => item.getNs(),
          }}
          searchFilters={[
            (item: Tenant) => item.getSearchFields()
          ]}
          renderHeaderTitle={<Trans>Tenants</Trans>}
          renderTableHeader={[
            {title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name},
            {title: <Trans>Owner</Trans>, className: "owner"},
            {title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace},
            {title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age},
          ]}
          renderTableContents={(tenant: Tenant) => [
            this.renderTenantName(tenant),
            tenant.spec.owner,
            tenant.getNs(),
            tenant.getAge(),
          ]}
          renderItemMenu={(item: Tenant) => {
            return <TenantMenu object={item}/>
          }}
          addRemoveButtons={{
            onAdd: () => AddTenantDialog.open(),
            addTooltip: <Trans>Create new Tenant</Trans>
          }}
        />
        <AddTenantDialog/>
        <ConfigTenantDialog/>
      </>
    );
  }
}

export function TenantMenu(props: KubeObjectMenuProps<Tenant>) {

  const {object, toolbar} = props;

  return (
    <KubeObjectMenu {...props}>
      <MenuItem onClick={() => ConfigTenantDialog.open(object)}>
        <Icon material="toc" title={_i18n._(t`Config`)} interactive={toolbar}/>
        <span className="config"><Trans>Config</Trans></span>
      </MenuItem>
    </KubeObjectMenu>
  )
}

apiManager.registerViews(tenantUserApi, {
  Menu: TenantMenu,
})
