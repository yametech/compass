import "./overview.scss"

import React from "react";
import store from "store";
import { observable, when } from "mobx";
import { observer } from "mobx-react";
import { OverviewStatuses } from "./overview-statuses";
import { RouteComponentProps } from "react-router";
import { IWorkloadsOverviewRouteParams } from "../+workloads";
import { eventStore } from "../+events/event.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { deploymentStore } from "../+workloads-deployments/deployments.store";
import { daemonSetStore } from "../+workloads-daemonsets/daemonsets.store";
import { statefulSetStore } from "../+workloads-statefulsets/statefulset.store";
import { replicaSetStore } from "../+workloads-replicasets/replicasets.store";
import { enhanceStatefulSetStore } from "../+workloads-enhancestatefulsets/enhancestatefulset.store"
import { stoneStore } from "../+workloads-stones/stones.store"
import { jobStore } from "../+workloads-jobs/job.store";
import { cronJobStore } from "../+workloads-cronjobs/cronjob.store";
import { Spinner } from "../spinner";
import { Events } from "../+events";

interface Props extends RouteComponentProps<IWorkloadsOverviewRouteParams> {
}

@observer
export class WorkloadsOverview extends React.Component<Props> {
  @observable isReady = false;
  @observable isUnmounting = false;
  @observable isClusterAdmin = false;

  async componentDidMount() {
    const userConifg = store.get('u_config');
    this.isClusterAdmin = userConifg ? userConifg.isClusterAdmin : false;
    let stores: any[] = [
      podsStore,
      replicaSetStore,
      eventStore,
      enhanceStatefulSetStore,
      stoneStore,
    ];
    if (this.isClusterAdmin) {
      stores = stores.concat([deploymentStore, daemonSetStore, statefulSetStore, jobStore, cronJobStore]);
    }
    this.isReady = stores.every(store => store.isLoaded);
    if (!this.isReady) {
      await Promise.all(stores.map(store => store.loadAll()));
      this.isReady = true;
    }
    const unsubscribeList = stores.map(store => store.subscribe());
    await when(() => this.isUnmounting);
    unsubscribeList.forEach(dispose => dispose());
  }

  componentWillUnmount() {
    this.isUnmounting = true;
  }

  renderContents() {
    if (!this.isReady) {
      return <Spinner center />
    }
    return (
      <>
        <OverviewStatuses isClusterAdmin={this.isClusterAdmin} />
        <Events
          compact
          hideFilters
          className="box grow"
        />
      </>
    )
  }

  render() {
    return (
      <div className="WorkloadsOverview flex column gaps">
        {this.renderContents()}
      </div>
    )
  }
}