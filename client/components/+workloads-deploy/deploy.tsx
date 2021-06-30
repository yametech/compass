import "./deploy.store.ts";

import React from "react";
import { observer } from "mobx-react";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { _i18n } from "../../i18n"
import { RouteComponentProps } from "react-router";
import { t, Trans } from "@lingui/macro";
import { Deploy, deployApi } from "../../api/endpoints";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object";
import { KubeObjectListLayout } from "../kube-object";
import { DeployDialog, AddDeployDialog, TaggingDialog } from "../+workloads-deploy";
import { IDeployWorkloadsParams } from "../+workloads"
import { apiManager } from "../../api/api-manager";
import { deployStore } from "./deploy.store";
import { ConfigDeployDialog } from "./config-deploy-dialog";
import { Link } from "react-router-dom";
import { stopPropagation } from "../../utils";
import Tooltip from "@material-ui/core/Tooltip";
import { namespaceStore } from "../+namespaces/namespace.store";
import { networkAttachmentDefinitionStore } from "../+sdn-multus-network-attachment-definition";

enum sortBy {
  templateName = "templateName",
  appName = "appName",
  resourceType = "resourceType",
  generateTimestamp = "generateTimestamp",
  age = "age",
}

interface Props extends RouteComponentProps<IDeployWorkloadsParams> {
}


export function deployNameRender(deploy: Deploy) {
  const name = deploy.getAppName();
  return (
    <a onClick={(event) => { stopPropagation(event); ConfigDeployDialog.open(deploy) }}>
      <Tooltip title={name} placement="top-start">
        <span>{name}</span>
      </Tooltip>
    </a>
  );
}

@observer
export class Deploys extends React.Component<Props> {
  render() {
    return (
      <>
        <KubeObjectListLayout
          isClusterScoped
          isShowTag
          className="Deploy" store={deployStore}
          sortingCallbacks={{
            [sortBy.templateName]: (deploy: Deploy) => deploy.getName(),
            [sortBy.appName]: (deploy: Deploy) => deploy.getAppName(),
            [sortBy.resourceType]: (deploy: Deploy) => deploy.getResourceType(),
            [sortBy.generateTimestamp]: (deploy: Deploy) => deploy.getGenerateTimestamp(),
            [sortBy.age]: (deploy: Deploy) => deploy.getAge(false),
          }
          }
          searchFilters={[
            (deploy: Deploy) => deploy.getSearchFields(),
          ]}
          searchRegexpFilters={[
            { prefix: '^tagName:', cb: (deploy: Deploy) => deploy.getTagName() }, //Regexp match
          ]}
          renderHeaderTitle={< Trans> Workloads Template </Trans>}
          renderTableHeader={
            [
              { title: <Trans>AppName</Trans>, className: "appName", sortBy: sortBy.appName },
              { title: <Trans>TemplateName</Trans>, className: "template", sortBy: sortBy.templateName },
              { title: <Trans>ResourceType</Trans>, className: "resourceType", sortBy: sortBy.resourceType },
              {
                title: <Trans>Created</Trans>,
                className: "Created",
                sortBy: sortBy.generateTimestamp
              },
              { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
            ]}
          renderTableContents={(deploy: Deploy) => [
            // deploy.getAppName(),
            deployNameRender(deploy),
            deploy.getName(),
            deploy.getResourceType(),
            deploy.getCreated(),
            deploy.getAge(),
          ]}
          renderItemMenu={(item: Deploy) => {
            return <DeployMenu object={item} />
          }}
          addRemoveButtons={{
            addTooltip: <Trans>AddDeployDialog</Trans>,
            onAdd: () => AddDeployDialog.open()
          }}
        />
        <TaggingDialog />
        <DeployDialog />
        <AddDeployDialog />
        <ConfigDeployDialog />
      </>
    )
  }
}

export function DeployMenu(props: KubeObjectMenuProps<Deploy>) {
  const { object, toolbar } = props;
  return (
    <>
      <KubeObjectMenu {...props} >
        <MenuItem onClick={() => {
          TaggingDialog.open(object)
        }}>
          <Icon material="loyalty" title={_i18n._(t`Tagging`)} interactive={toolbar} />
          <span className="title"><Trans>Tagging</Trans></span>
        </MenuItem>
        <MenuItem onClick={() => {
          DeployDialog.open(object)
        }}>
          <Icon material="play_circle_filled" title={_i18n._(t`DeployTO`)} interactive={toolbar} />
          <span className="title"><Trans>DeployTO</Trans></span>
        </MenuItem>
        <MenuItem onClick={() => {
          ConfigDeployDialog.open(object)
        }}>
          <Icon material="sync_alt" title={_i18n._(t`Config`)} interactive={toolbar} />
          <span className="title"><Trans>Config</Trans></span>
        </MenuItem>
      </KubeObjectMenu>
    </>
  )
}

apiManager.registerViews(deployApi, {
  Menu: DeployMenu,
})
