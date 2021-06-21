import React from "react";
import {observer} from "mobx-react";
import {Trans} from "@lingui/macro";
import {TaskResource} from "../../api/endpoints";
import {DrawerTitle} from "../drawer";
import {Table, TableCell, TableHead, TableRow} from "../table";
import {_i18n} from "../../i18n";

interface Props {
  taskResourceSets: TaskResource[];
  name?: string;
}

@observer
export class TaskResourcesDetails extends React.Component<Props> {

  static defaultProps = {
    name: "TaskResources"
  }

  render() {
    const {taskResourceSets, name} = this.props;
    if (!taskResourceSets.length) return null;
    return (
      <div className="TaskResourceSets flex column">
        <DrawerTitle title={_i18n._(name)}/>
        <Table
          className="box grow"
        >
          <TableHead>
            <TableCell className="name"><Trans>Name</Trans></TableCell>
            <TableCell className="resourceType">ResourceType</TableCell>
            <TableCell className="targetPath"><Trans>TargetPath</Trans></TableCell>
            <TableCell className="description"><Trans>Description</Trans></TableCell>
          </TableHead>
          {
            taskResourceSets.map(taskResource => {
              return (
                <TableRow
                  nowrap
                >
                  <TableCell className="name">{taskResource.name}</TableCell>
                  <TableCell className="resourceType">{taskResource.type}</TableCell>
                  <TableCell className="targetPath">{taskResource.targetPath}</TableCell>
                  <TableCell className="description">{taskResource.description}</TableCell>
                </TableRow>
              )
            })
          }
        </Table>
      </div>
    );
  }
}
