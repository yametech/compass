import * as React from "react";
import {observer} from "mobx-react";
import {RouteComponentProps} from "react-router";
import {KubeObjectMenu, KubeObjectMenuProps} from "../kube-object";
import {KubeObjectListLayout} from "../kube-object";
import {INetworkAttachmentDefinitionRouteParams} from "./network-attachment-definition.route";
import {networkAttachmentDefinitionStore} from "./network-attachment-definition.store";
import {apiManager} from "../../api/api-manager";
import {
  NetworkAttachmentDefinition,
  networkAttachmentDefinitionApi
} from "../../api/endpoints";
import {AddNetworkAttachmentDefinitionDialog} from "./add-network-attachment-definition-dialog";
import {MenuItem} from "../menu";
import {Icon} from "../icon";
import {ConfigNetworkAttachmentDefinitionDialog} from "./config-network-attachment-definition-dialog";

enum sortBy {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Props extends RouteComponentProps<INetworkAttachmentDefinitionRouteParams> {
}

@observer
export class NetworkAttachmentDefinitions extends React.Component<Props> {

  render() {
    return (
      <>
        <KubeObjectListLayout
          className="NetworkAttachmentDefinition"
          store={networkAttachmentDefinitionStore}
          sortingCallbacks={{
            [sortBy.name]: (item: NetworkAttachmentDefinition) => item.getName(),
            [sortBy.namespace]: (item: NetworkAttachmentDefinition) => item.getNs(),
          }}
          searchFilters={[
            (item: NetworkAttachmentDefinition) => item.getSearchFields()
          ]}
          renderHeaderTitle={`NetworkAttachmentDefinition`}
          renderTableHeader={[
            {title: `Name`, className: "name", sortBy: sortBy.name},
            {title: `Namespace`, className: "namespace"},
            {title: `Age`, className: "age", sortBy: sortBy.age},
          ]}
          renderTableContents={(field: NetworkAttachmentDefinition) => [
            field.getName(),
            field.getNs(),
            field.getAge(),
          ]}
          renderItemMenu={(item: NetworkAttachmentDefinition) => {
            return <NetworkAttachmentDefinitionMenu object={item}/>
          }}
          addRemoveButtons={{
            addTooltip: `Add NetworkAttachmentDefinition`,
            onAdd: () => AddNetworkAttachmentDefinitionDialog.open(),
          }}
        />
        <AddNetworkAttachmentDefinitionDialog />
        <ConfigNetworkAttachmentDefinitionDialog />
      </>
    );
  }
}

export function NetworkAttachmentDefinitionMenu(props: KubeObjectMenuProps<NetworkAttachmentDefinition>) {
  const { object, toolbar } = props;
  return (
    <KubeObjectMenu {...props} >
      <MenuItem onClick={() => {
        ConfigNetworkAttachmentDefinitionDialog.open(object)
      }}>
        <Icon material="play_circle_filled" title={`Config`} interactive={toolbar} />
        <span className="title">Config</span>
      </MenuItem>
    </KubeObjectMenu>
  )
}

apiManager.registerViews(networkAttachmentDefinitionApi, {Menu: NetworkAttachmentDefinitionMenu})
