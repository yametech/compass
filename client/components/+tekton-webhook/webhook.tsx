import "./webhook.scss";

import {RouteComponentProps} from "react-router";
import {observer} from "mobx-react";
import React from "react";
import {KubeObjectListLayout, KubeObjectMenu, KubeObjectMenuProps} from "../kube-object";
import {tektonWebHookStore} from "./webhook.store";
import {t, Trans} from "@lingui/macro";
import {TektonWebHook, tektonWebHookApi} from "../../api/endpoints/tekton-webhook.api";
import {AddWebhookDialog} from "./add-webhook-dialog";
import {apiManager} from "../../api/api-manager";
import {ConfigWebhookDialog} from "./config-webhook-dialog";
import {MenuItem} from "../menu";
import {Icon} from "../icon";
import {_i18n} from "../../i18n";
import {Link} from "react-router-dom";
import {stopPropagation} from "../../utils";
import Tooltip from "@material-ui/core/Tooltip";

enum sortBy {
  name = "name",
  namespace = "namespace",
  git = "git",
  age = "age",
}

interface Props extends RouteComponentProps {
}

@observer
export class WebHook extends React.Component<Props> {

  renderUri(tektonWebHook: TektonWebHook) {
    const uri = "/webhook/gitea/namespaces/" + tektonWebHook.getNs() + "/tektonwebhooks/" + tektonWebHook.getName();
    return (
      <Tooltip title={uri} placement="top-start" >
        <span>{uri}</span>
      </Tooltip>
    )
  }

  renderWebHookeName(tektonWebHook: TektonWebHook) {
    const name = tektonWebHook.getName();
    return (
      <Link
        onClick={(event) => {
          stopPropagation(event);
          ConfigWebhookDialog.open(tektonWebHook);
        }}
        to={null}
      >
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
          className="WebHook"
          store={tektonWebHookStore}
          sortingCallbacks={{
            [sortBy.name]: (tektonWebHook: TektonWebHook) => tektonWebHook.getName(),
            [sortBy.namespace]: (tektonWebHook: TektonWebHook) => tektonWebHook.getNs(),
            [sortBy.git]: (tektonWebHook: TektonWebHook) => tektonWebHook.spec.git || "",
            [sortBy.age]: (tektonWebHook: TektonWebHook) => tektonWebHook.getAge(false),
          }}
          searchFilters={[
            (tektonWebHook: TektonWebHook) => tektonWebHook.getSearchFields(),
          ]}
          renderHeaderTitle={<Trans>Tekton WebHook</Trans>}
          renderTableHeader={[
            {
              title: <Trans>Name</Trans>,
              className: "name",
              sortBy: sortBy.name,
            },
            {
              title: <Trans>Namespace</Trans>,
              className: "namespace",
              sortBy: sortBy.namespace,
            },
            {
              title: <Trans>Git Address</Trans>,
              className: "git",
              sortBy: sortBy.git,
            },
            {
              title: <Trans>Uniform Resource Identifier</Trans>,
              className: "uri",
            },
            {
              title: <Trans>Age</Trans>,
              className: "age",
              sortBy: sortBy.age
            },
          ]}
          renderTableContents={(tektonWebHook: TektonWebHook) => [
            this.renderWebHookeName(tektonWebHook),
            tektonWebHook.getNs(),
            tektonWebHook.spec.git || "",
            this.renderUri(tektonWebHook),
            tektonWebHook.getAge(),
          ]}
          renderItemMenu={(item: TektonWebHook) => {
            return <TektonWebHookMenu object={item}/>;
          }}
          addRemoveButtons={{
            addTooltip: <Trans>WebHook</Trans>,
            onAdd: () => {
              AddWebhookDialog.open();
            },
          }}
        />
        <AddWebhookDialog/>
        <ConfigWebhookDialog/>
      </>
    )
  }
}

export function TektonWebHookMenu(props: KubeObjectMenuProps<TektonWebHook>) {
  const {object, toolbar} = props;

  return (
    <KubeObjectMenu {...props} >
      <MenuItem onClick={() => {
        ConfigWebhookDialog.open(object)
      }}>
        <Icon material="sync_alt" title={_i18n._(t`Config`)} interactive={toolbar}/>
        <span className="title"><Trans>Config</Trans></span>
      </MenuItem>
    </KubeObjectMenu>
  );
}

apiManager.registerViews(tektonWebHookApi, {Menu: TektonWebHookMenu});
