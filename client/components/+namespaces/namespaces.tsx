import "./namespaces.scss"
import * as React from "react";
import { t, Trans } from "@lingui/macro";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { _i18n } from "../../i18n"
import { Namespace, namespacesApi, NamespaceStatus } from "../../api/endpoints";
import { AddNamespaceDialog } from "./add-namespace-dialog";
import { MainLayout } from "../layout/main-layout";
import { Badge } from "../badge";
import { RouteComponentProps } from "react-router";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
import { INamespacesRouteParams } from "./namespaces.route";
import { namespaceStore } from "./namespace.store";
import { apiManager } from "../../api/api-manager";
import { NamespaceNodeRangeLimitDialog } from "./namespace-nodelimit-dialog";
import { NamespaceStorageClasslimit } from "./namespace-storageclass-dialog";
import { Namespace2Layernet } from "./namespace-add2layernet";

enum sortBy {
  name = "name",
  labels = "labels",
  age = "age",
  status = "status",
}


interface Props extends RouteComponentProps<INamespacesRouteParams> {
}

export class Namespaces extends React.Component<Props> {
  render() {
    return (
      <MainLayout>
        <KubeObjectListLayout
          isClusterScoped
          className="Namespaces" store={namespaceStore}
          sortingCallbacks={{
            [sortBy.name]: (ns: Namespace) => ns.getName(),
            [sortBy.labels]: (ns: Namespace) => ns.getLabels(),
            [sortBy.age]: (ns: Namespace) => ns.getAge(false),
            [sortBy.status]: (ns: Namespace) => ns.getStatus(),
          }}
          searchFilters={[
            (item: Namespace) => item.getSearchFields(),
            (item: Namespace) => item.getStatus()
          ]}
          renderHeaderTitle={<Trans>Namespaces</Trans>}
          renderTableHeader={[
            { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
            { title: <Trans>Labels</Trans>, className: "labels", sortBy: sortBy.labels },
            { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
            { title: <Trans>Status</Trans>, className: "status", sortBy: sortBy.status },
          ]}
          renderTableContents={(item: Namespace) => [
            item.getName(),
            item.getLabels().map(label => <Badge key={label} label={label} />),
            item.getAge(),
            { title: item.getStatus(), className: item.getStatus().toLowerCase() },
          ]}
          renderItemMenu={(item: Namespace) => {
            return <NamespaceMenu object={item} />
          }}
          addRemoveButtons={{
            addTooltip: <Trans>Add Namespace</Trans>,
            onAdd: () => AddNamespaceDialog.open(),
          }}
          customizeTableRowProps={(item: Namespace) => ({
            disabled: item.getStatus() === NamespaceStatus.TERMINATING,
          })}
        />
        <AddNamespaceDialog />
        <NamespaceNodeRangeLimitDialog />
        <NamespaceStorageClasslimit />
        <Namespace2Layernet />
      </MainLayout>
    )
  }
}

export function NamespaceMenu(props: KubeObjectMenuProps<Namespace>) {
  const { object, toolbar } = props;
  return (
    <KubeObjectMenu {...props} >
      <MenuItem onClick={() => { NamespaceNodeRangeLimitDialog.open(object); }}>
        <Icon material="settings_applications" title={_i18n._(t`Allow Node`)} interactive={toolbar} />
        <span className="title"><Trans>Allow Node</Trans></span>
      </MenuItem>
      <MenuItem onClick={() => { NamespaceStorageClasslimit.open(object); }}>
        <Icon material="store" title={_i18n._(t`Allow StorageClass`)} interactive={toolbar} />
        <span className="title"><Trans>Allow StorageClass</Trans></span>
      </MenuItem>
      <MenuItem onClick={() => { Namespace2Layernet.open(object); }}>
        <Icon material="gesture" title={_i18n._(t`Add 2LayerNet`)} interactive={toolbar} />
        <span className="title"><Trans>Add 2LayerNet</Trans></span>
      </MenuItem>
    </KubeObjectMenu>

  )
}

apiManager.registerViews(namespacesApi, {
  Menu: NamespaceMenu,
});
