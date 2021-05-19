import * as React from "react";
import {observer} from "mobx-react";
import {RouteComponentProps} from "react-router";
import {t, Trans} from "@lingui/macro";
import {KubeObjectMenu, KubeObjectMenuProps} from "../kube-object";
import {KubeObjectListLayout} from "../kube-object";
import {TenantDepartment, tenantDepartmentApi} from "../../api/endpoints";
import {apiManager} from "../../api/api-manager";
import {tenantDepartmentStore} from "./department.store";
import {AddDepartmentDialog} from "./add-department-dialog";
import {ConfigDepartmentDialog} from "./config-department-dialog";
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
export class TenantDepartments extends React.Component<Props> {

  renderDepartmentName(department: TenantDepartment) {
    const name = department.getName();
    return (
      <Link onClick={(event) => { stopPropagation(event); ConfigDepartmentDialog.open(department); }} to={null}>
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
          className="Departments" store={tenantDepartmentStore}
          sortingCallbacks={{
            [sortBy.name]: (item: TenantDepartment) => item.getName(),
            [sortBy.namespace]: (item: TenantDepartment) => item.getNs(),
          }}
          searchFilters={[
            (item: TenantDepartment) => item.getSearchFields()
          ]}
          renderHeaderTitle={<Trans>Departments</Trans>}
          renderTableHeader={[
            {title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name},
            {title: <Trans>TenantName</Trans>, className: "tenantName"},
            {title: <Trans>Owner</Trans>, className: "owner"},
            {title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace},
            {title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age},
          ]}
          renderTableContents={(department: TenantDepartment) => [
            this.renderDepartmentName(department),
            department.spec.tenant_id,
            department.spec.owner,
            department.getNs(),
            department.getAge(),
          ]}
          renderItemMenu={(item: TenantDepartment) => {
            return <DepartmentMenu object={item}/>
          }}
          addRemoveButtons={{
            onAdd: () => AddDepartmentDialog.open(),
            addTooltip: <Trans>Create new Department</Trans>
          }}
        />
        <AddDepartmentDialog/>
        <ConfigDepartmentDialog/>
      </>
    );
  }
}

export function DepartmentMenu(props: KubeObjectMenuProps<TenantDepartment>) {

  const {object, toolbar} = props;

  return (
    <KubeObjectMenu {...props}>
      <MenuItem onClick={() => ConfigDepartmentDialog.open(object)}>
        <Icon material="toc" title={_i18n._(t`Config`)} interactive={toolbar}/>
        <span className="config"><Trans>Config</Trans></span>
      </MenuItem>
    </KubeObjectMenu>
  )
}

apiManager.registerViews(tenantDepartmentApi, {
  Menu: DepartmentMenu,
})
