import "./overview-statuses.scss"

import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { OverviewWorkloadStatus } from "./overview-workload-status";
import { cronJobsURL, daemonSetsURL, deploymentsURL, jobsURL, podsURL, statefulSetsURL, enhanceStatefulSetsURL, stonesURL } from "../+workloads";
import { PageFiltersList } from "../item-object-list/page-filters-list";
import { NamespaceSelectFilter } from "../+namespaces/namespace-select";

interface Props {
  isClusterAdmin: boolean
}
@observer
export class OverviewStatuses extends React.Component<Props> {
  render() {
    return (
      <div className="OverviewStatuses">
        <div className="header flex gaps align-center">
          <h5 className="box grow"><Trans>Overview</Trans></h5>
          <NamespaceSelectFilter />
        </div>
        <PageFiltersList />
        <div className="workloads">
          <div className="workload">
            <OverviewWorkloadStatus type="pods" url={podsURL()} />
          </div>
          <div className="workload">
            <OverviewWorkloadStatus type="stones" url={stonesURL()} />
          </div>
          <div className="workload">
            <OverviewWorkloadStatus type="StatefulSets*" url={enhanceStatefulSetsURL()} />
          </div>
          {this.props.isClusterAdmin ?
            <>
              <div className="workload">
                <OverviewWorkloadStatus type="deployments" url={deploymentsURL()} />
              </div>
              <div className="workload">
                <OverviewWorkloadStatus type="statefulSets" url={statefulSetsURL()} />
              </div>
              <div className="workload">
                <OverviewWorkloadStatus type="daemonSets" url={daemonSetsURL()} />
              </div>
              <div className="workload">
                <OverviewWorkloadStatus type="jobs" url={jobsURL()} />
              </div>
              <div className="workload">
                <OverviewWorkloadStatus type="cronJobs" url={cronJobsURL()} />
              </div>
            </> : null
          }
        </div>
      </div>
    )
  }
}
