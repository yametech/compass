import { KubeObjectDetailsProps } from "../kube-object";
import { observer } from "mobx-react";
import React from "react";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { DrawerItem } from "../drawer";
import { Trans } from "@lingui/macro";
import { KubeEventDetails } from "../+events/kube-event-details";
import { apiManager } from "../../api/api-manager";
import { tektonStoreApi, TektonStore } from "../../api/endpoints";

interface Props extends KubeObjectDetailsProps<TektonStore> {}

@observer
export class TektonStoreDetails extends React.Component<Props> {
  render() {
    const { object: tektonStore } = this.props;
    if (!tektonStore) {
      return null;
    }

    return (
      <div className="TektonStoreDetails">
        <KubeObjectMeta object={tektonStore} />

        <DrawerItem name={<Trans>Type</Trans>}>
          {tektonStore.getType()}
        </DrawerItem>

        <DrawerItem name={<Trans>Data</Trans>}>
          {tektonStore.getData()}
        </DrawerItem>

        <DrawerItem name={<Trans>Forks</Trans>}>
          {tektonStore.getForks()}
        </DrawerItem>

        <DrawerItem name={<Trans>Author</Trans>}>
          {tektonStore.getAuthor()}
        </DrawerItem>

        <DrawerItem name={<Trans>ParamsDescription</Trans>}>
          {tektonStore.getParamsDescription()}
        </DrawerItem>

        <KubeEventDetails object={tektonStore} />
      </div>
    );
  }
}

apiManager.registerViews(tektonStoreApi, { Details: TektonStoreDetails });
