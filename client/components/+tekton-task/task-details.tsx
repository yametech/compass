import React from "react";
import {KubeObjectDetailsProps} from "../kube-object";
import {Task, taskApi} from "../../api/endpoints";
import {observer} from "mobx-react";
import {KubeObjectMeta} from "../kube-object/kube-object-meta";
import {apiManager} from "../../api/api-manager";
import {Trans} from "@lingui/macro";
import {DrawerItem, DrawerTitle} from "../drawer";
import {KubeEventDetails} from "../+events/kube-event-details";
import {PipelineParamsDetails} from "./pipeline-params-details";
import {TaskResourcesDetails} from "./task-resource-details";

interface Props extends KubeObjectDetailsProps<Task> {
}

@observer
export class TaskDetails extends React.Component<Props> {

  render() {
    const {object: task} = this.props;
    if (!task) {
      return null;
    }

    return (
      <div className="PipelineResourceDetails">
        <KubeObjectMeta object={task}/>

        <PipelineParamsDetails pipelineParamsSets={task.spec.params || []} />
        <TaskResourcesDetails taskResourceSets={task.spec.resources?.inputs || []} name={"Task Resource Inputs"} />
        <TaskResourcesDetails taskResourceSets={task.spec.resources?.outputs || []} name={"Task Resource Outputs"} />

        <DrawerTitle title={<Trans>Steps</Trans>}/>
        {task.spec.steps?.map((item: any) => {
          return (
            <div>
              {Object.entries(item).map(([name, value]) => (
                <DrawerItem key={name} name={name}>
                  {JSON.stringify(value)}
                </DrawerItem>
              ))}
              <br/>
            </div>
          );
        })}

        <DrawerTitle title={<Trans>Volumes</Trans>}/>
        {task.spec.volumes?.map((item: any) => {
          return (
            <div>
              {Object.entries(item).map(([name, value]) => (
                <DrawerItem key={name} name={name}>
                  {JSON.stringify(value)}
                </DrawerItem>
              ))}
              <br/>
            </div>
          );
        })}

        <KubeEventDetails object={task}/>
      </div>
    );
  }
}

apiManager.registerViews(taskApi, {
  Details: TaskDetails,
});
