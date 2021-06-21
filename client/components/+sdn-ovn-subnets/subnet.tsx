import * as React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { MenuItem } from "../menu";
import { t, Trans } from "@lingui/macro";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object";
import { KubeObjectListLayout } from "../kube-object";
import { apiManager } from "../../api/api-manager";
import { SubNet, subNetApi } from "../../api/endpoints/subnet.api";
import { subNetStore } from "./subnet.store";
import { ISubNetRouteParams } from "./subnet.route";
import { AddSubNetDialog } from "./add-subnet-dialog";
import { Icon } from "../icon";
import { ConfigSubNetDialog } from "./config-subnet-dialog";
import { _i18n } from "../../i18n";
import { Link } from "react-router-dom";
import { stopPropagation } from "../../utils";
import Tooltip from "@material-ui/core/Tooltip";

enum sortBy {
  name = "name",
  namespace = "namespace",
  age = "age",
  allowsubnets = 'allowsubnets',
}

interface Props extends RouteComponentProps<ISubNetRouteParams> {
}


export function subnetNameRender(subnet: SubNet) {
  const name = subnet.getName();
  return (
    <Link onClick={(event) => { stopPropagation(event); ConfigSubNetDialog.open(subnet) }} to={null}>
      <Tooltip title={name} placement="top-start">
        <span>{name}</span>
      </Tooltip>
    </Link>
  );
}
@observer
export class SubNets extends React.Component<Props> {

  render() {
    return (
      <>
        <KubeObjectListLayout
          // onDetails={() => {}}
          className="SubNet" store={subNetStore}
          sortingCallbacks={{
            [sortBy.name]: (item: SubNet) => item.getName(),
            [sortBy.namespace]: (item: SubNet) => item.getNs(),
          }}
          searchFilters={[
            (item: SubNet) => item.getSearchFields()
          ]}
          renderHeaderTitle={<Trans>SubNet</Trans>}
          renderTableHeader={[
            { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
            { title: <Trans>Protocol</Trans>, className: "protocol" },
            { title: <Trans>GateWay</Trans>, className: "gateway" },
            { title: <Trans>CIDR Block</Trans>, className: "cidrBlock" },
            { title: <Trans>ExcludeIP</Trans>, className: "excludeIps" },
            { title: <Trans>AllowSubnets</Trans>, className: "allowSubnets", sortBy: sortBy.allowsubnets },
            { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          ]}
          renderTableContents={(subnet: SubNet) => [
            // field.getName(),
            subnetNameRender(subnet),
            subnet.spec.protocol,
            subnet.spec.gateway,
            subnet.spec.cidrBlock,
            subnet.spec.excludeIps,
            subnet.spec.allowSubnets,
            subnet.getAge(),
          ]}
          renderItemMenu={(item: SubNet) => {
            return <SubNetMenu object={item} />
          }}
          addRemoveButtons={{
            addTooltip: <Trans>AddSubNetDialog</Trans>,
            onAdd: () => AddSubNetDialog.open()
          }}
        />
        <AddSubNetDialog />
        <ConfigSubNetDialog />
      </>
    );
  }
}

export function SubNetMenu(props: KubeObjectMenuProps<SubNet>) {
  const { object, toolbar } = props;
  return (
    <>
      <KubeObjectMenu {...props} >
        <MenuItem onClick={() => {
          ConfigSubNetDialog.open(object)
        }}>
          <Icon material="play_circle_filled" title={_i18n._(t`Config`)} interactive={toolbar} />
          <span className="title"><Trans>Config</Trans></span>
        </MenuItem>
      </KubeObjectMenu>
    </>
  )
}

apiManager.registerViews(subNetApi, {
  Menu: SubNetMenu,
})
