import "./pipelineresource.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { Trans } from "@lingui/macro";
import { PipelineResource, pipelineResourceApi } from "../../api/endpoints";
import { pipelineResourceStore } from "./pipelineresource.store";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object";
import { KubeObjectListLayout } from "../kube-object";
import { apiManager } from "../../api/api-manager";
import { AddPipelineResourceDialog } from "./add-pipelineresource-dialog";

enum sortBy {
  name = "name",
  namespace = "namespace",
  ownernamespace = "ownernamespace",
  age = "age",
}

interface Props extends RouteComponentProps {
}

@observer
export class PipelineResources extends React.Component<Props> {
  render() {
    return (
      <>
        <KubeObjectListLayout
          className="PipelineResources" store={pipelineResourceStore}
          sortingCallbacks={{
            [sortBy.name]: (pipelineResource: PipelineResource) => pipelineResource.getName(),
            [sortBy.namespace]: (pipelineResource: PipelineResource) => pipelineResource.getNs(),
            [sortBy.ownernamespace]: (pipelineResource: PipelineResource) => pipelineResource.getOwnerNamespace(),
            [sortBy.age]: (pipelineResource: PipelineResource) => pipelineResource.getAge(false),
          }}
          searchFilters={[
            (pipelineResource: PipelineResource) => pipelineResource.getSearchFields(),
          ]}
          renderHeaderTitle={<Trans>Pipeline Resources</Trans>}
          renderTableHeader={[
            { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
            { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
            { title: <Trans>OwnerNamespace</Trans>, className: "ownernamespace", sortBy: sortBy.ownernamespace },
            { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          ]}
          renderTableContents={(pipelineResource: PipelineResource) => [
            pipelineResource.getName(),
            pipelineResource.getNs(),
            pipelineResource.getOwnerNamespace(),
            pipelineResource.getAge(),
          ]}
          renderItemMenu={(item: PipelineResource) => {
            return <PipelineResourceMenu object={item} />
          }}
          addRemoveButtons={{
            addTooltip: <Trans>Pipeline Resource</Trans>,
            onAdd: () => {
              AddPipelineResourceDialog.open()
            }
          }}
        />
        <AddPipelineResourceDialog />
      </>
    )
  }
}

export function PipelineResourceMenu(props: KubeObjectMenuProps<PipelineResource>) {
  return (
    <KubeObjectMenu {...props} />
  )
}

apiManager.registerViews(pipelineResourceApi, { Menu: PipelineResourceMenu, })
