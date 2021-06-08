import "./pipelinerun.scss";

import React, { Fragment } from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { Trans } from "@lingui/macro";
import { advanceSecondsToHms, PipelineRun, pipelineRunApi } from "../../api/endpoints";
import { pipelineRunStore } from "./pipelinerun.store";
import { pipelineStore } from "../+tekton-pipeline/pipeline.store";
import { KubeObjectListLayout, KubeObjectMenu, KubeObjectMenuProps } from "../kube-object";
import { ApiManager, apiManager } from "../../api/api-manager";
import { observable } from "mobx";
import { taskRunStore } from "../+tekton-taskrun";
import { TooltipContent } from "../tooltip";
import { StatusBrick } from "../status-brick";
import { cssNames, stopPropagation } from "../../utils";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { Notifications } from "../notifications";
import { PipelineRunIcon } from "./pipeline-run-icon";
import { podsStore } from "../+workloads-pods/pods.store";
import Tooltip from "@material-ui/core/Tooltip";
import { PipelineRunVisualDialog } from "./pipelinerun-visual-dialog";
import { tektonGraphStore } from "../+tekton-graph/tekton-graph.store";
import { KubeEventIcon } from "../+events/kube-event-icon";
import { eventStore } from "../+events/event.store";
import { TaskRunLogsDialog } from "../+tekton-taskrun/task-run-logs-dialog";
import { configStore } from "../../config.store";
import { PipelineStatus } from "../+constant/tekton-constants";

enum sortBy {
  name = "name",
  namespace = "namespace",
  ownernamespace = "ownernamespace",
  reason = "reason",
  age = "age",
}

interface Props extends RouteComponentProps { }

@observer
export class PipelineRuns extends React.Component<Props> {
  @observable isHiddenPipelineGraph: boolean = true;
  @observable graph: any = null;
  @observable pipelineRun: any;
  @observable G6Render: boolean = false; //是否能实例化G6

  renderTasks(pipelineRun: PipelineRun) {
    let names: string[];
    try {
      names = pipelineRunStore.getTaskRunName(pipelineRun);
    } catch {
      names = [];
    }

    if (names.length > 0) {
      // TODO:
      return names.map((item: string) => {
        const taskRun = taskRunStore.getByName(item);
        if (taskRun === undefined) {
          return;
        }
        if (
          taskRun.status?.podName === "" ||
          taskRun.status?.podName === undefined
        ) {
          return;
        }
        //TODO：TypeError: Cannot read property '0' of undefined case page panic
        let status = taskRun?.status?.conditions[0]?.reason;

        if (status === undefined) {
          status = "pending";
        }
        status = status.toLowerCase().toString();
        const name = taskRun.getName();
        const tooltip = (
          <TooltipContent tableView>
            <Fragment>
              <div className="title">
                Name - <span className="text-secondary">{name}</span>
              </div>
              <div className="title">
                LastTransitionTime -{" "}
                <span className="text-secondary">
                  {taskRun?.status?.conditions[0]?.lastTransitionTime}
                </span>
              </div>
              <div className="title">
                Massage -{" "}
                <span className="text-secondary">
                  {taskRun?.status?.conditions[0]?.message}
                </span>
              </div>
              <div className="title">
                Reason -{" "}
                <span className="text-secondary">
                  {taskRun?.status?.conditions[0]?.reason}
                </span>
              </div>
            </Fragment>
          </TooltipContent>
        );
        return (
          <Fragment key={name}>
            <StatusBrick className={cssNames(status)} tooltip={tooltip} />
          </Fragment>
        );
      });
    }
  }

  renderTime(time: string) {
    return (
      <TooltipContent className="PipelineRunTooltip">{time}</TooltipContent>
    );
  }

  renderPipelineName(pipelineRun: PipelineRun) {
    const name = pipelineRun.getName();
    return (
      <a
        onClick={(event) => {
          stopPropagation(event);
          this.G6Render = true;
          PipelineRunVisualDialog.open(pipelineRun);
        }}
      >
        <Tooltip title={name} placement="top-start">
          <span>{name}</span>
        </Tooltip>
      </a>
    );
  }

  renderPipelineDuration(
    startTime: string | number,
    completionTime: string | number
  ) {
    if (completionTime == "" || completionTime == undefined) {
      return;
    }
    const st = new Date(startTime).getTime();
    const ct = new Date(completionTime).getTime();
    let duration = Math.floor((ct - st) / 1000);
    return advanceSecondsToHms(duration);
  }

  renderPipelineStatus(pipelineRun: PipelineRun) {
    let status = pipelineRun?.status?.conditions[0]?.reason;
    if (status !== undefined) {
      if (
        status === PipelineStatus.Succeeded ||
        status === PipelineStatus.Completed
      ) {
        return (
          <Icon
            small={true}
            material="check_circle"
            className="pipelineRun-Succeeded"
          />
        );
      }
      if (
        status === PipelineStatus.Running ||
        status == PipelineStatus.Started
      ) {
        return (
          <Icon material="loop" small={true} className="pipelineRun-Running" />
        );
      }
      if (status === PipelineStatus.PipelineRunCancelled) {
        return (
          <Icon
            material="cancel"
            small={true}
            className="pipelineRun-Cancelled"
          />
        );
      } else {
        return (
          <Icon
            material="error_outline"
            small={true}
            className="pipelineRun-Failed"
          />
        );
      }
    }
  }

  render() {
    return (
      <>
        <KubeObjectListLayout
          className="PipelineRuns"
          store={pipelineRunStore}
          dependentStores={[
            pipelineStore,
            taskRunStore,
            tektonGraphStore,
            podsStore,
            eventStore,
          ]}
          sortingCallbacks={{
            [sortBy.name]: (pipelineRun: PipelineRun) => pipelineRun.getName(),
            [sortBy.namespace]: (pipelineRun: PipelineRun) =>
              pipelineRun.getNs(),
            [sortBy.reason]: (pipelineRun: PipelineRun) =>
              pipelineRun.getErrorReason(),
            [sortBy.age]: (pipelineRun: PipelineRun) =>
              pipelineRun.getAge(false),
          }}
          searchFilters={[
            (pipelineRun: PipelineRun) => pipelineRun.getSearchFields(),
          ]}
          renderHeaderTitle={<Trans>PipelineRuns</Trans>}
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
            { title: "", className: "event" },
            { title: "", className: "reason" },
            { title: <Trans>Tasks</Trans>, className: "tasks" },
            {
              title: <Trans>Created</Trans>,
              className: "age",
              sortBy: sortBy.age,
            },
            { title: <Trans>Duration</Trans>, className: "Duration" },
            { title: "Status", className: "status" },
          ]}
          renderTableContents={(pipelineRun: PipelineRun) => [
            this.renderPipelineName(pipelineRun),
            pipelineRun.getNs(),
            <KubeEventIcon
              namespace={configStore.getOpsNamespace()}
              object={pipelineRun}
            />,
            pipelineRun.hasIssues() && (
              <PipelineRunIcon object={pipelineRun.status.conditions[0]} />
            ),
            this.renderTasks(pipelineRun),
            `${pipelineRun.getAge()}  ago`,
            pipelineRun.getDuration() ?? "",
            this.renderPipelineStatus(pipelineRun),
          ]}
          renderItemMenu={(item: PipelineRun) => {
            return <PipelineRunMenu object={item} />;
          }}
        />
        <PipelineRunVisualDialog
          G6Render={this.G6Render}
          stopRender={() => {
            this.G6Render = false;
          }}
        />
        <TaskRunLogsDialog />
      </>
    );
  }
}

export function PipelineRunMenu(props: KubeObjectMenuProps<PipelineRun>) {
  const { object, toolbar } = props;
  return (
    <KubeObjectMenu {...props}>
      <MenuItem
        onClick={() => {
          object.spec.status = "PipelineRunCancelled";
          try {
            apiManager.getApi(object.selfLink).update(
              { name: object.getName(), namespace: object.getNs() },
              { ...object },
            );
            Notifications.ok(
              <>PipelineRun {object.getName()} cancel succeeded</>
            );
          } catch (err) {
            Notifications.error(err);
          }
        }}
      >
        <Icon material="cancel" title={"cancel"} interactive={toolbar} />
        <span className="title">
          <Trans>Cancel</Trans>
        </span>
      </MenuItem>

      <MenuItem
        onClick={async () => {
          const pipelineRun = object;
          try {
            await pipelineRunApi.post({ path: pipelineRun.selfLink + "/rerun" })

            Notifications.ok(
              <>PipelineRun: {pipelineRun.getName()} rerun succeeded</>
            );

          } catch (err) {
            Notifications.error(err);
          }
        }}
      >
        <Icon material="autorenew" title={"rerun"} interactive={toolbar} />
        <span className="title">
          <Trans>Rerun</Trans>
        </span>
      </MenuItem>

    </KubeObjectMenu>
  );
}

apiManager.registerViews(pipelineRunApi, { Menu: PipelineRunMenu });
