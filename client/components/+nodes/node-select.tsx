
import "./node-select.scss"

import React from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { Select, SelectOption, SelectProps } from "../select";
import { cssNames, noop } from "../../utils";
import { Icon } from "../icon";
import { nodesStore } from "./nodes.store";
import { _i18n } from "../../i18n";
import { FilterIcon } from "../item-object-list/filter-icon";
import { FilterType } from "../item-object-list/page-filters.store";

interface Props extends SelectProps {
    showIcons?: boolean;
    showClusterOption?: boolean; // show cluster option on the top (default: false)
    clusterOptionLabel?: React.ReactNode; // label for cluster option (default: "Cluster")
    customizeOptions?(nsOptions: SelectOption[]): SelectOption[];
}

const defaultProps: Partial<Props> = {
    showIcons: true,
    showClusterOption: false,
    get clusterOptionLabel() {
        return _i18n._(t`Cluster`);
    },
};

@observer
export class NodeSelect extends React.Component<Props> {
    static defaultProps = defaultProps as object;
    private unsubscribe = noop;

    async componentDidMount() {
        if (!nodesStore.isLoaded) await nodesStore.loadAll();
        this.unsubscribe = nodesStore.subscribe();
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    @computed get options(): SelectOption[] {
        const { customizeOptions, showClusterOption, clusterOptionLabel } = this.props;
        let options: SelectOption[] = nodesStore.items.map(node => ({ value: node.getName() }));
        options = customizeOptions ? customizeOptions(options) : options;
        if (showClusterOption) {
            options.unshift({ value: null, label: clusterOptionLabel });
        }
        return options;
    }

    formatOptionLabel = (option: SelectOption) => {
        const { showIcons } = this.props;
        const { value, label } = option;
        return label || (
            <>
                {showIcons && <Icon small material="layers" className="primary" />}
                {value}
            </>
        );
    }

    render() {
        const { className, showIcons, showClusterOption, clusterOptionLabel, customizeOptions, ...selectProps } = this.props;
        return (
            <Select
                className={cssNames("NodeSelect", className)}
                menuClass="NodeSelectMenu"
                formatOptionLabel={this.formatOptionLabel}
                options={this.options}
                {...selectProps}
            />
        );
    }
}