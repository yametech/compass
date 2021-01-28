import React from "react";
import {computed} from "mobx";
import {observer} from "mobx-react";
import {t, Trans} from "@lingui/macro";
import {Select, SelectOption, SelectProps} from "../select";
import {cssNames, noop} from "../../utils";
import {Icon} from "../icon";
import {secretsStore} from "./secrets.store";
import {_i18n} from "../../i18n";

interface Props extends SelectProps {
    showIcons?: boolean;
    showClusterOption?: boolean; // show cluster option on the top (default: false)
    clusterOptionLabel?: React.ReactNode; // label for cluster option (default: "Cluster")

    namespace?: string;

    customizeOptions?(nsOptions: SelectOption[]): SelectOption[];
}

const defaultProps: Partial<Props> = {
    showIcons: true,
    showClusterOption: false,
    namespace: '',
    get clusterOptionLabel() {
        return _i18n._(t`Secret`);
    },
};

@observer
export class SecretsSelect extends React.Component<Props> {
    static defaultProps = defaultProps as object;
    private unsubscribe = noop;

    async componentDidMount() {
        if (!secretsStore.isLoaded) await secretsStore.loadAll();
        this.unsubscribe = secretsStore.subscribe();
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    @computed get options(): SelectOption[] {
        const {customizeOptions, showClusterOption, clusterOptionLabel, namespace} = this.props;
        let options: SelectOption[];
        if (namespace != '') {
            options = secretsStore.items.filter(
                item => item.getNs() == namespace).map(item => ({value: item.getName()}));
        }
        else{
            options = secretsStore.items.map(item => ({value: item.getName()}));
        }
        options = customizeOptions ? customizeOptions(options) : options;
        if (showClusterOption) {
            options.unshift({value: null, label: clusterOptionLabel});
        }
        return options;
    }

    formatOptionLabel = (option: SelectOption) => {
        const {showIcons} = this.props;
        const {value, label} = option;
        return label || (
            <>
                {showIcons && <Icon small material="layers" className="primary" />}
                {value}
            </>
        );
    }

    render() {
        const {className, showIcons, showClusterOption, clusterOptionLabel, customizeOptions, ...selectProps} = this.props;
        return (
            <Select
                className={cssNames("SecretsSelect", className)}
                menuClass="SecretsSelect"
                formatOptionLabel={this.formatOptionLabel}
                options={this.options}
                {...selectProps}
            />
        );
    }
}
