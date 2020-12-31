import "./tekton-overview.scss"

import React from "react";
import { observable, when } from "mobx";
import { observer } from "mobx-react";
import { OverviewStatuses } from "./tekton-overview-statuses";
import { RouteComponentProps } from "react-router";
import { ITektonsOverviewRouteParams } from "../+tekton";
import { pipelineRunStore } from "../+tekton-pipelinerun/pipelinerun.store";
import { taskRunStore } from "../+tekton-taskrun";
import { taskStore } from "../+tekton-task/task.store";
import { pipelineStore } from "../+tekton-pipeline/pipeline.store";
import { pipelineResourceStore } from "../+tekton-pipelineresource/pipelineresource.store";
import { Spinner } from "../spinner";
import { PipelineRunTopTable } from "../+tekton-pipelinerun/pipeline-run-top-table"

interface Props extends RouteComponentProps<ITektonsOverviewRouteParams> {
}

@observer
export class TektonsOverview extends React.Component<Props> {
    @observable isReady = false;
    @observable isUnmounting = false;

    async componentDidMount() {
        const stores = [
            pipelineRunStore,
            taskRunStore,
            taskStore,
            pipelineStore,
            pipelineResourceStore,
        ];
        this.isReady = stores.every(store => store.isLoaded);
        if (!this.isReady) {
          await Promise.all(stores.map(store => store.loadAll()));
          this.isReady = true;
        }
        const unsubscribeList = stores.map(store => store.subscribe());
        await when(() => this.isUnmounting);
        unsubscribeList.forEach(dispose => dispose());
    }

    componentWillUnmount() {
        this.isUnmounting = true;
    }

    renderContents() {
        if (!this.isReady) {
            return <Spinner center />
        }
        return (
            <>
                <OverviewStatuses />
                <PipelineRunTopTable
                    compact
                    hideFilters
                    className="box grow"

                />
            </>
        )
    }

    render() {
        return (
            <div className="TektonOverview flex column gaps">
                {this.renderContents()}
            </div>
        )
    }
}