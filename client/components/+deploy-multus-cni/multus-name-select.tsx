import "./multus-cni-select.scss"

import React from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { Select, SelectOption, SelectProps } from "../select";
import { cssNames, noop } from "../../utils";
import { Icon } from "../icon";
import { _i18n } from "../../i18n";
import { FilterIcon } from "../item-object-list/filter-icon";
import { FilterType } from "../item-object-list/page-filters.store";
import { themeStore } from "../../theme.store";
import { networkAttachmentDefinitionStore } from "../+sdn-multus-network-attachment-definition/network-attachment-definition.store"

interface Props extends SelectProps {
    namespace?: string
    showIcons?: boolean;
    showClusterOption?: boolean; // show cluster option on the top (default: false)
    clusterOptionLabel?: React.ReactNode; // label for cluster option (default: "Cluster")
    required?: boolean;
    customizeOptions?(nsOptions: SelectOption[]): SelectOption[];
}

const defaultProps: Partial<Props> = {
    namespace: "",
    required: false,
    showIcons: true,
    showClusterOption: false,
    get clusterOptionLabel() {
        return _i18n._(t`Cluster`);
    },
};

@observer
export class MultusCniNameSelect extends React.Component<Props> {
    static defaultProps = defaultProps as object;
    // private unsubscribe = noop;

    componentDidMount() {
        networkAttachmentDefinitionStore.loadAll();
        // this.unsubscribe = networkAttachmentDefinitionStore.subscribe();
    }

    // componentWillUnmount() {
    //     this.unsubscribe();
    // }

    @computed get options(): SelectOption[] {
        const { customizeOptions, showClusterOption, clusterOptionLabel } = this.props;
        let options: SelectOption[] = networkAttachmentDefinitionStore.getAllByNs(this.props.namespace).map(n => ({ value: n.getName() }));
        if (options.length === 0) {
            return options;
        }
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
        const { className, showIcons, showClusterOption, clusterOptionLabel, customizeOptions, required, ...selectProps } = this.props;
        return (
            <>
                <Select
                    className={cssNames("MultusCniNameSelect", className)}
                    menuClass="MultusCniNameSelectMenu"
                    required={required}
                    formatOptionLabel={this.formatOptionLabel}
                    options={this.options}
                    themeName={themeStore.activeThemeId === "kontena-dark" ? "dark" : "light"}
                    {...selectProps}
                />
            </>

        );
    }
}
