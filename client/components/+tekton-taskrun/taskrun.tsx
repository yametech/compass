import "./taskrun.scss";

import React, { Fragment } from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { Trans } from "@lingui/macro";
import { TaskRun, taskRunApi } from "../../api/endpoints";
import { taskRunStore } from "./taskrun.store";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object";
import { KubeObjectListLayout } from "../kube-object";
import { apiManager } from "../../api/api-manager";
import { TooltipContent } from "../tooltip";
import { StatusBrick } from "../status-brick";
import { cssNames } from "../../utils";

enum sortBy {
  name = "name",
  namespace = "namespace",
  ownernamespace = "ownernamespace",
  pods = "pods",
  age = "age",
}

interface Props extends RouteComponentProps { }

@observer
export class TaskRuns extends React.Component<Props> {
  renderSteps(taskRun: TaskRun) {
    return taskRun.getSteps().map((stepState) => {
      const { name, container } = stepState;

      status = "waiting";

      if (stepState.waiting) {
        status = "waiting";
      }
      if (stepState.running) {
        status = "running";
      }
      if (stepState.terminated) {
        status = "terminated";
      }

      const tooltip = (
        <TooltipContent tableView>
          <Fragment>
            <div className="title">
              Name - <span className="text-secondary">{name}</span>
            </div>
            <div className="title">
              Container - <span className="text-secondary">{container}</span>
            </div>
            {stepState.waiting ? (
              <>
                <div className="title">
                  Message -{" "}
                  <span className="text-secondary">
                    {stepState.waiting.message}
                  </span>
                </div>
                <div className="title">
                  Reason -{" "}
                  <span className="text-secondary">
                    {stepState.waiting.reason}
                  </span>
                </div>
              </>
            ) : null}
            {stepState.running ? (
              <>
                <div className="title">
                  StartedAt -{" "}
                  <span className="text-secondary">
                    {stepState.running.startedAt}
                  </span>
                </div>
              </>
            ) : null}
            {stepState.terminated ? (
              <>
                <div className="title">
                  ContainerID -{" "}
                  <span className="text-secondary">
                    {stepState.terminated.containerID}
                  </span>
                </div>
                <div className="title">
                  Reason -{" "}
                  <span className="text-secondary">
                    {stepState.terminated.reason}
                  </span>
                </div>
                <div className="title">
                  Message -{" "}
                  <span className="text-secondary">
                    {stepState.terminated.message}
                  </span>
                </div>
                <div className="title">
                  StartedAt -{" "}
                  <span className="text-secondary">
                    {stepState.terminated.startedAt}
                  </span>
                </div>
                <div className="title">
                  FinishedAt -{" "}
                  <span className="text-secondary">
                    {stepState.terminated.finishedAt}
                  </span>
                </div>
              </>
            ) : null}
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

  render() {
    return (
      <KubeObjectListLayout
        className="TaskRuns"
        store={taskRunStore}
        sortingCallbacks={{
          [sortBy.name]: (taskRun: TaskRun) => taskRun.getName(),
          [sortBy.namespace]: (taskRun: TaskRun) => taskRun.getNs(),
          [sortBy.ownernamespace]: (taskRun: TaskRun) => taskRun.getOwnerNamespace(),
          [sortBy.age]: (taskRun: TaskRun) => taskRun.getAge(false),
        }}
        searchFilters={[(taskRun: TaskRun) => taskRun.getSearchFields()]}
        renderHeaderTitle={<Trans>TaskRun</Trans>}
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
          {
            title: <Trans>OwnerNamespace</Trans>,
            className: "ownernamespace",
            sortBy: sortBy.ownernamespace,
          },
          { title: <Trans>Steps</Trans>, className: "steps" },
          { title: <Trans>Timeout</Trans>, className: "timeout" },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(taskRun: TaskRun) => [
          taskRun.getName(),
          taskRun.getNs(),
          taskRun.getOwnerNamespace(),
          this.renderSteps(taskRun),
          taskRun.spec.timeout,
          taskRun.getAge(),
        ]}
        renderItemMenu={(item: TaskRun) => {
          return <TaskRunMenu object={item} />;
        }}
      />
    );
  }
}

export function TaskRunMenu(props: KubeObjectMenuProps<TaskRun>) {
  return <KubeObjectMenu {...props} />;
}

apiManager.registerViews(taskRunApi, { Menu: TaskRunMenu });
