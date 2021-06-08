import "./task.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { Trans } from "@lingui/macro";
import { taskApi, Task } from "../../api/endpoints";
import { taskStore } from "./task.store";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object";
import { KubeObjectListLayout } from "../kube-object";
import { apiManager } from "../../api/api-manager";
import { Link } from "react-router-dom";
import Tooltip from "@material-ui/core/Tooltip";
import { ConfigTaskDialog } from "./config-task-dialog";
import { stopPropagation } from "../../utils";
import { MenuItem } from "../menu";
import { AddTektonStoreDialog } from "../+tekton-store";
import { Icon } from "../icon";

enum sortBy {
  name = "name",
  namespace = "namespace",
  ownernamespace = "ownernamespace",
  pods = "pods",
  age = "age",
}

interface Props extends RouteComponentProps { }

@observer
export class Tasks extends React.Component<Props> {
  renderTaskName(task: Task) {
    const name = task.getName();
    return (
      <Link
        onClick={(event) => {
          stopPropagation(event);
          ConfigTaskDialog.open(task);
        }}
        to={null}
      >
        <Tooltip title={name} placement="top-start">
          <span>{name}</span>
        </Tooltip>
      </Link>
    );
  }

  render() {
    return (
      <>
        <KubeObjectListLayout
          className="Tasks"
          store={taskStore}
          sortingCallbacks={{
            [sortBy.name]: (task: Task) => task.getName(),
            [sortBy.namespace]: (task: Task) => task.getNs(),
            [sortBy.age]: (task: Task) => task.getAge(false),
          }}
          searchFilters={[(task: Task) => task.getSearchFields()]}
          renderHeaderTitle={<Trans>Tasks</Trans>}
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
            { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          ]}
          renderTableContents={(task: Task) => [
            this.renderTaskName(task),
            task.getNs(),
            task.getAge(),
          ]}
          renderItemMenu={(item: Task) => {
            return <TaskMenu object={item} />;
          }}
        />
        <ConfigTaskDialog />
        <AddTektonStoreDialog />
      </>
    );
  }
}

export function TaskMenu(props: KubeObjectMenuProps<Task>) {
  const { object, toolbar } = props;
  return (
    <KubeObjectMenu {...props}>
      <MenuItem
        onClick={() => {
          const resourcePipeline = "task";
          AddTektonStoreDialog.open(JSON.stringify(object), resourcePipeline);
        }}
      >
        <Icon material="cloud_upload" title={"Upload"} interactive={toolbar} />
        <span className="title">
          <Trans>UploadStore</Trans>
        </span>
      </MenuItem>
    </KubeObjectMenu>
  );
}

apiManager.registerViews(taskApi, { Menu: TaskMenu });
