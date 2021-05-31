import "./stones.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { t, Trans } from "@lingui/macro";
import { Stone, stoneApi } from "../../api/endpoints";
import { podsStore } from "../+workloads-pods/pods.store";
import { stoneStore } from "./stones.store";
import { nodesStore } from "../+nodes/nodes.store";
import { eventStore } from "../+events/event.store";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object";
import { KubeObjectListLayout } from "../kube-object";
import { IStatefulSetsRouteParams, IStonesRouteParams } from "../+workloads";
import { apiManager } from "../../api/api-manager";
import { enhanceStatefulSetStore } from "../+workloads-enhancestatefulsets/enhancestatefulset.store";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { _i18n } from "../../i18n";
import { ConfigStoneDialog } from "./config-stone-dialog";
import { Link } from "react-router-dom";
import Tooltip from "@material-ui/core/Tooltip";
import { stopPropagation } from "../../utils";

enum sortBy {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  statefulSets = "statefulSets",
  strategy = "strategy",
  age = "age",
}

interface Props extends RouteComponentProps<IStonesRouteParams> {
}

@observer
export class Stones extends React.Component<Props> {

  renderStoneName(stone: Stone) {
    const name = stone.getName();
    return (
      <a onClick={(event) => { stopPropagation(event); ConfigStoneDialog.open(stone) }}>
        <Tooltip title={name} placement="top-start">
          <span>{name}</span>
        </Tooltip>
      </a>
    );
  }

  getPodsLength(stone: Stone) {
    return stoneStore.getChildPods(stone).length;
  }

  getEnhanceStatefulSetLength(stone: Stone) {
    return stoneStore.getChildEnhanceStatefulset(stone).length;
  }

  hasPodIssues(stone: Stone) {
    return stoneStore.getChildPods(stone).map(pod => {
      return pod.hasIssues()
    }).filter(bool => bool === true).length !== 0;
  }

  render() {
    return (
      <>
        <KubeObjectListLayout
          className="Stones" store={stoneStore}
          dependentStores={[podsStore, nodesStore, eventStore, enhanceStatefulSetStore]}
          sortingCallbacks={{
            [sortBy.name]: (stone: Stone) => stone.getName(),
            [sortBy.namespace]: (stone: Stone) => stone.getNs(),
            [sortBy.age]: (stone: Stone) => stone.getAge(false),
            [sortBy.statefulSets]: (stone: Stone) => this.getEnhanceStatefulSetLength(stone),
            [sortBy.strategy]: (stone: Stone) => stone.getStrategy(),
            [sortBy.pods]: (stone: Stone) => this.getPodsLength(stone),
          }}
          searchFilters={[
            (stone: Stone) => stone.getSearchFields(),
          ]}
          renderHeaderTitle={<Trans>Stones</Trans>}
          renderTableHeader={[
            { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
            { className: "warning" },
            { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
            { title: <Trans>Pods</Trans>, className: "pods", sortBy: sortBy.pods },
            { title: <Trans>Strategy</Trans>, className: "strategy", sortBy: sortBy.strategy },
            { title: <Trans>StatefulSets</Trans>, className: "statefulSets", sortBy: sortBy.statefulSets },
            { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          ]}
          renderTableContents={(stone: Stone) => [
            this.renderStoneName(stone),
            this.hasPodIssues(stone) && <Icon material="warning" className={"StoneWarningIcon"} />,
            stone.getNs(),
            this.getPodsLength(stone),
            stone.getStrategy(),
            this.getEnhanceStatefulSetLength(stone),
            stone.getAge(),
          ]}
          renderItemMenu={(item: Stone) => {
            return <StoneMenu object={item} />
          }}
        />
        <ConfigStoneDialog />
      </>
    )
  }
}

export function StoneMenu(props: KubeObjectMenuProps<Stone>) {

  const { object, toolbar } = props

  return (
    <KubeObjectMenu {...props} >
      <MenuItem onClick={() => ConfigStoneDialog.open(object)}>
        <Icon material="sync_alt" title={_i18n._(t`Config`)} interactive={toolbar} />
        <span className="title"><Trans>Config</Trans></span>
      </MenuItem>
    </KubeObjectMenu>
  )
}

apiManager.registerViews(stoneApi, {
  Menu: StoneMenu,
})
