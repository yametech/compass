import "./stone-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { observable, reaction, toJS } from "mobx";
import { Trans } from "@lingui/macro";
import { Badge } from "../badge";
import { DrawerItem } from "../drawer";
import { PodDetailsStatuses } from "../+workloads-pods/pod-details-statuses";
import { KubeEventDetails } from "../+events/kube-event-details";
import { podsStore } from "../+workloads-pods/pods.store";
import { stoneStore } from "./stones.store";
import { KubeObjectDetailsProps } from "../kube-object";
import { IPodMetrics, Stone, stoneApi } from "../../api/endpoints";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { apiManager } from "../../api/api-manager";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { BookTabs } from '../tabs'

interface Props extends KubeObjectDetailsProps<Stone> {
}

@observer
export class StoneDetails extends React.Component<Props> {

  @disposeOnUnmount
  clean = reaction(() => this.props.object, () => {
    stoneStore.reset();
  });

  componentDidMount() {
    if (!podsStore.isLoaded) {
      podsStore.loadAll();
    }
  }

  componentWillUnmount() {
    stoneStore.reset();
  }

  render() {
    const { object: stone } = this.props;
    if (!stone) return null
    const images = stone.getImages()
    const selectors = stone.getSelectors()
    const nodeSelector = stone.getNodeSelectors()
    const childPods = stoneStore.getChildPods(stone)
    const metrics = stoneStore.metrics
    const statefulsets = stoneStore.getChildEnhanceStatefulset(stone);
    return (
      <div className="StoneDetails">
        <BookTabs>
          <div className="Home">
            {podsStore.isLoaded && (
              <ResourceMetrics
                loader={() => stoneStore.loadMetrics(stone)}
                tabs={podMetricTabs} object={stone} params={{ metrics }}
              >
                <PodCharts />
              </ResourceMetrics>
            )}
            <KubeObjectMeta object={stone} />
            {selectors.length > 0 &&
              <DrawerItem name={<Trans>Selector</Trans>} labelsOnly>
                {
                  selectors.map(label => <Badge key={label} label={label} />)
                }
              </DrawerItem>
            }
            {nodeSelector.length > 0 &&
              <DrawerItem name={<Trans>Node Selector</Trans>} labelsOnly>
                {
                  nodeSelector.map(label => (
                    <Badge key={label} label={label} />
                  ))
                }
              </DrawerItem>
            }
            {images.length > 0 &&
              <DrawerItem name={<Trans>Images</Trans>}>
                {
                  images.map(image => <p key={image}>{image}</p>)
                }
              </DrawerItem>
            }
            <DrawerItem name={<Trans>Pod Status</Trans>} className="pod-status">
              <PodDetailsStatuses pods={childPods} />
            </DrawerItem>
            <ResourceMetricsText metrics={metrics} />
          </div>
          <div className="Pods">
            <PodDetailsList pods={childPods} owner={stone} />
          </div>
          <div className="Event">
            <KubeEventDetails object={stone} />

            {statefulsets.length > 0 &&
              <>
                {statefulsets.map((statefulset, index) => <KubeEventDetails key={`state${index}`} object={statefulset} title={"Event:statefulset-" + statefulset.getName()} />)}
              </>
            }

            {childPods.length > 0 &&
              <>
                {childPods.map((pod, index) => <KubeEventDetails key={`child${index}`} object={pod} title={"Event:pod-" + pod.getName()} />)}
              </>
            }
          </div>
        </BookTabs>
      </div>
    )
  }
}

apiManager.registerViews(stoneApi, {
  Details: StoneDetails
})