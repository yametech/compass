import "./ingresses.scss"

import * as React from "react"
import {observer} from "mobx-react";
import {RouteComponentProps} from "react-router-dom"
import {IngressRouteParams} from "./ingresses.route"
import {Ingress, ingressApi} from "../../api/endpoints/ingress.api"
import {ingressStore} from "./ingress.store";
import {KubeObjectMenu, KubeObjectMenuProps} from "../kube-object/kube-object-menu";
import {KubeObjectListLayout} from "../kube-object";
import {Trans} from "@lingui/macro";
import {apiManager} from "../../api/api-manager";
import {AddIngressDialog} from "./add-ingress-dialog";
import {ConfigIngressDialog} from "./config-ingress-dialog";
import { Link } from "react-router-dom";
import { stopPropagation } from "../../utils";
import Tooltip from "@material-ui/core/Tooltip";

enum sortBy {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Props extends RouteComponentProps<IngressRouteParams> {
}

export function nameRender(ingress: Ingress) {
  const name = ingress.getName();
  return (
    <a onClick={(event) => { stopPropagation(event); ConfigIngressDialog.open(ingress) }}>
      <Tooltip title={name} placement="top-start">
        <span>{name}</span>
      </Tooltip>
    </a>
  );
}

@observer
export class Ingresses extends React.Component<Props> {
  render() {
    return (
      <>
        <KubeObjectListLayout
          className="Ingresses" store={ingressStore}
          sortingCallbacks={{
            [sortBy.name]: (ingress: Ingress) => ingress.getName(),
            [sortBy.namespace]: (ingress: Ingress) => ingress.getNs(),
            [sortBy.age]: (ingress: Ingress) => ingress.getAge(false),
          }}
          searchFilters={[
            (ingress: Ingress) => ingress.getSearchFields(),
            (ingress: Ingress) => ingress.getPorts(),
          ]}
          renderHeaderTitle={<Trans>Ingresses</Trans>}
          renderTableHeader={[
            {title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name},
            {title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace},
            {title: <Trans>Rules</Trans>, className: "rules"},
            {title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age},
          ]}
          renderTableContents={(ingress: Ingress) => [
            nameRender(ingress),
            ingress.getNs(),
            ingress.getRoutes().map(route => <p key={route}>{route}</p>),
            ingress.getAge(),
          ]}
          renderItemMenu={(item: Ingress) => {
            return <IngressMenu object={item}/>
          }}
          tableProps={{
            customRowHeights: (item: Ingress, lineHeight, paddings) => {
              const lines = item.getRoutes().length || 1;
              return lines * lineHeight + paddings;
            }
          }}
          addRemoveButtons={{
            onAdd: () => AddIngressDialog.open(),
            addTooltip: <Trans>Create new Ingress</Trans>
          }}
        />
        <AddIngressDialog/>
        <ConfigIngressDialog/>
      </>
    )
  }
}

export function IngressMenu(props: KubeObjectMenuProps<Ingress>) {
  return (
    <KubeObjectMenu {...props}/>
  )
}

apiManager.registerViews(ingressApi, {
  Menu: IngressMenu
})


