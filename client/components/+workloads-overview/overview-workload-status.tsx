import "./overview-workload-status.scss";

import React from "react";
import capitalize from "lodash/capitalize";
import { findDOMNode } from 'react-dom';
import { observable } from "mobx";
import { observer } from "mobx-react";
import { PieChart } from "../chart";
import { cssVar } from "../../utils";
import { ChartData } from "chart.js";
import { themeStore } from "../../theme.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { deploymentStore } from "../+workloads-deployments/deployments.store";
import { daemonSetStore } from "../+workloads-daemonsets/daemonsets.store";
import { statefulSetStore } from "../+workloads-statefulsets/statefulset.store";
import { jobStore } from "../+workloads-jobs/job.store";
import { cronJobStore } from "../+workloads-cronjobs/cronjob.store";
import { namespaceStore } from "../+namespaces/namespace.store";
import { enhanceStatefulSetStore } from "../+workloads-enhancestatefulsets/enhancestatefulset.store"
import { stoneStore } from "../+workloads-stones/stones.store"
import { Link } from "react-router-dom";

interface Props {
  type: string,
  url: string,
  status?: {
    [key: string]: number;
  };
}

@observer
export class OverviewWorkloadStatus extends React.Component<Props> {
  @observable elem: HTMLElement

  componentDidMount() {
    this.elem = findDOMNode(this) as HTMLElement
  }

  getStatusColor(status: string) {
    return cssVar(this.elem).get(`--workload-status-${status.toLowerCase()}`).toString();
  }

  renderChart(status: object) {
    if (!this.elem) return null
    console.log('OverviewStatuses');
    const statuses = Object.entries(status)
    const chartData: Partial<ChartData> = {
      labels: [] as string[],
      datasets: [{
        data: [1],
        backgroundColor: [themeStore.activeTheme.colors.pieChartDefaultColor],
        label: "Empty"
      }]
    }
    if (statuses.some(([key, val]) => val > 0)) {
      const dataset: any = {
        data: [],
        backgroundColor: [],
        label: "Status",
      }
      statuses.forEach(([key, val]) => {
        if (val !== 0) {
          dataset.data.push(val)
          dataset.backgroundColor.push(this.getStatusColor(key))
          chartData.labels.push(capitalize(key) + ": " + val)
        }
      })
      chartData.datasets[0] = dataset
    }
    const options = {
      elements: {
        arc: {
          borderWidth: 0,
        },
      },
    }
    return (
      <PieChart data={chartData} options={options} />
    )
  }

  render() {
    const { type, url } = this.props
    const { contextNs } = namespaceStore;

    let stringToStore = {
      pods: podsStore,
      deployments: deploymentStore,
      statefulSets: statefulSetStore,
      daemonSets: daemonSetStore,
      jobs: jobStore,
      cronJobs: cronJobStore,
      'StatefulSets*': enhanceStatefulSetStore,
      stones: stoneStore,
    } as any;
    
    const item = stringToStore[type].getAllByNs(contextNs);
    let status = stringToStore[type].getStatuses(item) as object;

    return (
      <div className="OverviewWorkloadStatus">
        <div className="flex column align-center box grow">
          <div className="title">
            <Link to={url}>{`${type.charAt(0).toUpperCase()}${type.substring(1)}`} ({item.length})</Link>
          </div>
          {this.renderChart(status)}
        </div>
      </div>
    )
  }
}
