import "./pod-details.scss"

import * as React from "react";
import kebabCase from "lodash/kebabCase";
import { disposeOnUnmount, observer } from "mobx-react";
import { Link } from "react-router-dom";
import { autorun, observable, reaction, toJS } from "mobx";
import { Trans } from "@lingui/macro";
import { IPodMetrics, nodesApi, Pod, podsApi, pvcApi } from "../../api/endpoints";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { autobind, cssNames, interval } from "../../utils";
import { PodDetailsContainer } from "./pod-details-container";
import { PodDetailsAffinities } from "./pod-details-affinities";
import { PodDetailsTolerations } from "./pod-details-tolerations";
import { Icon } from "../icon";
import { KubeEventDetails } from "../+events/kube-event-details";
import { PodDetailsSecrets } from "./pod-details-secrets";
import { ResourceMetrics } from "../resource-metrics";
import { podsStore } from "./pods.store";
import { getDetailsUrl } from "../../navigation";
import { KubeObjectDetailsProps } from "../kube-object";
import { getItemMetrics } from "../../api/endpoints/metrics.api";
import { PodCharts, podMetricTabs } from "./pod-charts";
import { lookupApiLink } from "../../api/kube-api";
import { apiManager } from "../../api/api-manager";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { BookTabs } from '../tabs'

interface Props extends KubeObjectDetailsProps<Pod> {
}

@observer
export class PodDetails extends React.Component<Props> {
  @observable containerMetrics: IPodMetrics;

  private watcher = interval(60, () => this.loadMetrics());

  componentDidMount() {
    disposeOnUnmount(this, [
      autorun(() => {
        this.containerMetrics = null;
        this.loadMetrics();
      }),
      reaction(() => this.props.object, () => {
        podsStore.reset();
      })
    ]);
    this.watcher.start();
  }

  componentWillUnmount() {
    podsStore.reset();
  }

  @autobind()
  async loadMetrics() {
    const { object: pod } = this.props;
    this.containerMetrics = await podsStore.loadContainerMetrics(pod);
  }

  render() {
    const { object: pod } = this.props;
    if (!pod) return null;
    const { status, spec } = pod;
    const { conditions, podIP } = status;
    const { nodeName } = spec;
    const ownerRefs = pod.getOwnerRefs();
    const nodeSelector = pod.getNodeSelectors();
    const volumes = pod.getVolumes();
    const labels = pod.getLabels();
    const metrics = podsStore.metrics;
    return (
      <div className="PodDetails">
        <BookTabs>
          <div className="Home">
            <ResourceMetrics
              loader={() => podsStore.loadMetrics(pod)}
              tabs={podMetricTabs} object={pod} params={{ metrics }}
            >
              <PodCharts/>
            </ResourceMetrics>
            <KubeObjectMeta object={pod}/>
            <DrawerItem name={<Trans>Status</Trans>}>
              <span className={cssNames("status", kebabCase(pod.getStatusMessage()))}>{pod.getStatusMessage()}</span>
            </DrawerItem>
            <DrawerItem name={<Trans>Node</Trans>}>
              {nodeName && (
                <Link to={getDetailsUrl(nodesApi.getUrl({ name: nodeName }))}>
                  {nodeName}
                </Link>
              )}
            </DrawerItem>
            <DrawerItem name={<Trans>Pod IP</Trans>}>
              {podIP}
            </DrawerItem>
            <DrawerItem name={<Trans>Priority Class</Trans>}>
              {pod.getPriorityClassName()}
            </DrawerItem>
            <DrawerItem name={<Trans>QoS Class</Trans>}>
              {pod.getQosClass()}
            </DrawerItem>
            {conditions &&
            <DrawerItem name={<Trans>Conditions</Trans>} className="conditions" labelsOnly>
              {
                conditions.map(condition => {
                  const { type, status, lastTransitionTime } = condition;
                  return (
                    <Badge
                      key={type}
                      label={type}
                      className={cssNames({ disabled: status === "False" })}
                      tooltip={<Trans>Last transition time: {lastTransitionTime}</Trans>}
                    />
                  )
                })
              }
            </DrawerItem>
            }
            {nodeSelector.length > 0 &&
            <DrawerItem name={<Trans>Node Selector</Trans>}>
              {
                nodeSelector.map(label => (
                  <Badge key={label} label={label}/>
                ))
              }
            </DrawerItem>
            }
            {ownerRefs.length > 0 &&
            <DrawerItem name={<Trans>Controlled By</Trans>}>
              {
                ownerRefs.map(ref => {
                  const { name, kind } = ref;
                  const ownerDetailsUrl = getDetailsUrl(lookupApiLink(ref, pod));
                  return (
                    <p key={name}>
                      {kind} <Link to={ownerDetailsUrl}>{name}</Link>
                    </p>
                  );
                })
              }
            </DrawerItem>
            }
            <PodDetailsTolerations workload={pod}/>
            <PodDetailsAffinities workload={pod}/>

            {pod.getSecrets().length > 0 && (
              <DrawerItem name={<Trans>Secrets</Trans>}>
                <PodDetailsSecrets pod={pod}/>
              </DrawerItem>
            )}
          </div>
          <div className="Init Containers">
            {pod.getInitContainers() && pod.getInitContainers().length > 0 &&
            <DrawerTitle title={<Trans>Init Containers</Trans>}/>
            }
            {
              pod.getInitContainers() && pod.getInitContainers().map(container => {
                return <PodDetailsContainer key={container.name} pod={pod} container={container}/>
              })
            }
          </div>
          <div className="Containers">
            <DrawerTitle title={<Trans>Containers</Trans>}/>
            {
              pod.getContainers().map(container => {
                const { name } = container;
                const metrics = getItemMetrics(toJS(this.containerMetrics), name);
                return (
                  <PodDetailsContainer
                    key={name}
                    pod={pod}
                    container={container}
                    metrics={metrics}
                  />
                )
              })
            }
          </div>
          <div className="Volumes">
            {volumes.length > 0 && (
              <>
                <DrawerTitle title={<Trans>Volumes</Trans>}/>
                {volumes.map(volume => {
                  const claimName = volume.persistentVolumeClaim ? volume.persistentVolumeClaim.claimName : null;
                  return (
                    <div key={volume.name} className="volume">
                      <div className="title flex gaps">
                        <Icon small material="storage"/>
                        <span>{volume.name}</span>
                      </div>
                      <DrawerItem name={<Trans>Type</Trans>}>
                        {Object.keys(volume)[1]}
                      </DrawerItem>
                      {claimName && (
                        <DrawerItem name={<Trans>Claim Name</Trans>}>
                          <Link  to={getDetailsUrl(pvcApi.getUrl({name: claimName, namespace: pod.getNs()}))}>
                            {claimName}
                          </Link>
                        </DrawerItem>
                      )}
                    </div>
                  )
                })}
              </>
            )}
          </div>
          <div className="Events">
            <KubeEventDetails object={pod}/>
          </div>
        </BookTabs>
      </div>
    )
  }
}

apiManager.registerViews(podsApi, {
  Details: PodDetails
})