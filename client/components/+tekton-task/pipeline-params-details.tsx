import "./pipeline-params-details.scss"

import React from "react";
import {observer} from "mobx-react";
import {Trans} from "@lingui/macro";
import {PipelineParams} from "../../api/endpoints";
import {DrawerTitle} from "../drawer";
import {Table, TableCell, TableHead, TableRow} from "../table";

interface Props {
  pipelineParamsSets: PipelineParams[];
}

@observer
export class PipelineParamsDetails extends React.Component<Props> {

  render() {
    const {pipelineParamsSets} = this.props;
    if (!pipelineParamsSets.length) return null;
    return (
      <div className="PipelineParamsSets flex column">
        <DrawerTitle title={<Trans>Pipeline Params</Trans>}/>
        <Table
          className="box grow"
        >
          <TableHead>
            <TableCell className="name"><Trans>Name</Trans></TableCell>
            <TableCell className="type">Type</TableCell>
            <TableCell className="default"><Trans>Default</Trans></TableCell>
            <TableCell className="description"><Trans>Description</Trans></TableCell>
          </TableHead>
          {
            pipelineParamsSets.map(pipelineParams => {
              return (
                <TableRow
                  nowrap
                >
                  <TableCell className="name">{pipelineParams.name}</TableCell>
                  <TableCell className="type">{pipelineParams.type}</TableCell>
                  <TableCell className="defualt">{pipelineParams.default}</TableCell>
                  <TableCell className="description">{pipelineParams.description}</TableCell>
                </TableRow>
              )
            })
          }
        </Table>
      </div>
    );
  }
}
