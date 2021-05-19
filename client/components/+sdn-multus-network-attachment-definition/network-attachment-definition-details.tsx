import { KubeObjectDetailsProps } from "../kube-object";
import { observer } from "mobx-react";
import React from "react";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { KubeEventDetails } from "../+events/kube-event-details";
import {
  NetworkAttachmentDefinition, networkAttachmentDefinitionApi,
} from "../../api/endpoints";
import { apiManager } from "../../api/api-manager";

interface Props extends KubeObjectDetailsProps<NetworkAttachmentDefinition> {
}

@observer
export class NetworkAttachmentDefinitionDetails extends React.Component<Props> {

  render() {
    const { object: networkAttachmentDefinition } = this.props;
    if (!networkAttachmentDefinition) {
      return null;
    }

    const config = networkAttachmentDefinition.getConfig()

    return (
      <div className="NetworkAttachmentDefinitionDetails">
        <KubeObjectMeta object={networkAttachmentDefinition} />
        <KubeEventDetails object={networkAttachmentDefinition} />
      </div>
    )
  }
}

apiManager.registerViews(networkAttachmentDefinitionApi, { Details: NetworkAttachmentDefinitionDetails });