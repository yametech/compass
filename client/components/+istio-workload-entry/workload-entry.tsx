
import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { Trans } from "@lingui/macro";
import { workloadEntryApi, WorkloadEntry } from "../../api/endpoints";
import { workloadEntryStore } from "./workload-entry.store";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object";
import { KubeObjectListLayout } from "../kube-object";
import { apiManager } from "../../api/api-manager";
import { MenuItem } from "../menu";
import { WorkloadEntryDialog } from "./add-workload-entry-dialog"

enum sortBy {
    name = "name",
    namespace = "namespace",
    ownernamespace = "ownernamespace",
    pods = "pods",
    age = "age",
}

interface Props extends RouteComponentProps { }

@observer
export class WorkloadEntrys extends React.Component<Props> {

    render() {
        return (
            <>
                <KubeObjectListLayout
                    isClusterScoped
                    className="WorkloadEntrys"
                    store={workloadEntryStore}
                    sortingCallbacks={{
                        [sortBy.name]: (we: WorkloadEntry) => we.getName(),
                        [sortBy.namespace]: (we: WorkloadEntry) => we.getNs(),
                        [sortBy.ownernamespace]: (we: WorkloadEntry) => we.getOwnerNamespace(),
                        [sortBy.age]: (we: WorkloadEntry) => we.getAge(false),
                    }}
                    searchFilters={[(we: WorkloadEntry) => we.getSearchFields()]}
                    renderHeaderTitle={<Trans>WorkloadEntrys</Trans>}
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
                        { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
                    ]}
                    renderTableContents={(we: WorkloadEntry) => [
                        we.getName(),
                        we.getNs(),
                        we.getOwnerNamespace(),
                        we.getAge(),
                    ]}
                    renderItemMenu={(item: WorkloadEntry) => {
                        return <WorkloadEntryMenu object={item} />;
                    }}
                    addRemoveButtons={{
                        addTooltip: <Trans>Gateway</Trans>,
                        onAdd: () => {
                            WorkloadEntryDialog.open();
                        },
                    }}
                />
                <WorkloadEntryDialog />
            </>
        );
    }
}

export function WorkloadEntryMenu(props: KubeObjectMenuProps<WorkloadEntry>) {
    const { object, toolbar } = props;
    return (
        <KubeObjectMenu {...props}>
            <MenuItem
                onClick={() => {
                    //donot something
                }}
            >
            </MenuItem>
        </KubeObjectMenu>
    );
}

apiManager.registerViews(workloadEntryApi, { Menu: WorkloadEntryMenu });
