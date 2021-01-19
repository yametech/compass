import React from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { Select, SelectOption, SelectProps } from "../select";
import { cssNames, noop } from "../../utils";
import { Icon } from "../icon";
import { storageClassStore } from "./storage-class.store";
import { _i18n } from "../../i18n";

interface Props extends SelectProps {
    showIcons?: boolean;
    showClusterOption?: boolean; // show cluster option on the top (default: false)
    clusterOptionLabel?: React.ReactNode; // label for cluster option (default: "Cluster"
    name?: string;
    customizeOptions?(nsOptions: SelectOption[]): SelectOption[];
}

const defaultProps: Partial<Props> = {
    showIcons: true,
    showClusterOption: false,
    name: "",

    get clusterOptionLabel() {
        return _i18n._(t`StorageClass`);
    },
};

@observer
export class StorageClassSelect extends React.Component<Props> {
    static defaultProps = defaultProps as object;
    private unsubscribe = noop;

    async componentDidMount() {
        if (!storageClassStore.isLoaded) await storageClassStore.loadAll();
        this.unsubscribe = storageClassStore.subscribe();
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    @computed get options(): SelectOption[] {
        const { customizeOptions, showClusterOption, clusterOptionLabel, name } = this.props;
        let options: SelectOption[];
        console.log("storageClass", storageClassStore.items.map(item => ({ value: item.getName() })))
        if (name != '') {
            options = storageClassStore.items.filter(
                item => item.getName() == name).map(item => ({ value: item.getName() }));
        }
        else {
            options = storageClassStore.items.map(item => ({ value: item.getName() }));
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
        const { className, showIcons, showClusterOption, clusterOptionLabel, customizeOptions, ...selectProps } = this.props;
        return (
            <Select
                className={cssNames("StorageClass", className)}
                menuClass="StorageClass"
                formatOptionLabel={this.formatOptionLabel}
                options={this.options}
                {...selectProps}
            />
        );
    }
}
