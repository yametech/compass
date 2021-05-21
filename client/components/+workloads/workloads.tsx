import "./workloads.scss"

import * as React from "react";
import store from "store";
import { observer } from "mobx-react";
import { Redirect, Route, Switch } from "react-router";
import { RouteComponentProps } from "react-router-dom";
import { Trans } from "@lingui/macro";
import { MainLayout, TabRoute } from "../layout/main-layout";
import { WorkloadsOverview } from "../+workloads-overview/overview";
import {
  injectorURL,
  injectorsRoute,
  enhanceStatefulSetsURL,
  enhanceStatefulsetsRoute,
  stonesURL,
  stonesRoute,
  cronJobsRoute,
  cronJobsURL,
  daemonSetsRoute,
  daemonSetsURL,
  deploymentsRoute,
  deploymentsURL,
  jobsRoute,
  jobsURL,
  overviewRoute,
  overviewURL,
  podsRoute,
  podsURL,
  statefulSetsRoute,
  statefulSetsURL,
  workloadsURL,
  deployRoute,
  deployURL
} from "./workloads.route";
import { namespaceStore } from "../+namespaces/namespace.store";
import { Pods } from "../+workloads-pods";
import { Deployments } from "../+workloads-deployments";
import { DaemonSets } from "../+workloads-daemonsets";
import { EnhanceStatefulSets } from "../+workloads-enhancestatefulsets";
import { Jobs } from "../+workloads-jobs";
import { CronJobs } from "../+workloads-cronjobs";
import { Stones } from "../+workloads-stones";
import { Deploys } from "../+workloads-deploy";
import { StatefulSets } from "../+workloads-statefulsets";
import { Injectors } from "../+workloads-injectors";

interface Props extends RouteComponentProps {
}

@observer
export class Workloads extends React.Component<Props> {
  static get tabRoutes(): TabRoute[] {
    const query = namespaceStore.getContextParams();
    const userConfig = store.get('u_config')
    const isClusterAdmin = userConfig ? userConfig.isClusterAdmin : false
    let items = [
      {
        title: <Trans>Overview</Trans>,
        component: WorkloadsOverview,
        url: overviewURL({ query }),
        path: overviewRoute.path
      },
      {
        title: <Trans>Deploy</Trans>,
        component: Deploys,
        url: deployURL({ query }),
        path: deployRoute.path
      },
      {
        title: <Trans>Stones</Trans>,
        component: Stones,
        url: stonesURL({ query }),
        path: stonesRoute.path
      },
      {
        title: <Trans>StatefulSets*</Trans>,
        component: EnhanceStatefulSets,
        url: enhanceStatefulSetsURL({ query }),
        path: enhanceStatefulsetsRoute.path
      },
      {
        title: <Trans>Pods</Trans>,
        component: Pods,
        url: podsURL({ query }),
        path: podsRoute.path
      },
    ]

    if (isClusterAdmin) {
      items.push(
        {
          title: <Trans>Injectors</Trans>,
          component: Injectors,
          url: injectorURL({ query }),
          path: injectorsRoute.path
        },
        {
          title: <Trans>Deployments</Trans>,
          component: Deployments,
          url: deploymentsURL({ query }),
          path: deploymentsRoute.path,
        },
        {
          title: <Trans>DaemonSets</Trans>,
          component: DaemonSets,
          url: daemonSetsURL({ query }),
          path: daemonSetsRoute.path,
        },
        {
          title: <Trans>StatefulSets</Trans>,
          component: StatefulSets,
          url: statefulSetsURL({ query }),
          path: statefulSetsRoute.path,
        },
        {
          title: <Trans>Jobs</Trans>,
          component: Jobs,
          url: jobsURL({ query }),
          path: jobsRoute.path,
        },
        {
          title: <Trans>CronJobs</Trans>,
          component: CronJobs,
          url: cronJobsURL({ query }),
          path: cronJobsRoute.path,
        },
      )
    }

    return items
  };

  render() {
    const tabRoutes = Workloads.tabRoutes;
    return (
      <MainLayout className="Workloads" tabs={tabRoutes}>
        <Switch>
          {tabRoutes.map((route, index) => <Route key={index} {...route} />)}
          <Redirect to={workloadsURL({ query: namespaceStore.getContextParams() })} />
        </Switch>
      </MainLayout>
    )
  }
}