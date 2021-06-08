// import "./namespace-select.scss";

import React from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { Select, SelectOption, SelectProps } from "../select";
import { cssNames, noop } from "../../utils";
import { Icon } from "../icon";
import { taskStore } from "../+tekton-task/task.store";
import { _i18n } from "../../i18n";
import { configStore } from "../../config.store";

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
export class TaskSelect extends React.Component<Props> {
  static defaultProps = defaultProps as object;
  private unsubscribe = noop;

  componentDidMount() {
    taskStore.getAllByNs(configStore.getOpsNamespace());
    this.unsubscribe = taskStore.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  @computed get options(): SelectOption[] {
    const {
      customizeOptions,
      showClusterOption,
      clusterOptionLabel,
    } = this.props;
    //maybe fliter  ops ns
    let options: SelectOption[] = taskStore.getAllByNs(configStore.getOpsNamespace()).map((task) => ({
      value: task.getName(),
    }));

    options = customizeOptions ? customizeOptions(options) : options;
    if (showClusterOption) {
      options.unshift({ value: null, label: clusterOptionLabel });
    }
    return options;
  }

  formatOptionLabel = (option: SelectOption) => {
    const { showIcons } = this.props;
    const { value, label } = option;
    return (
      label || (
        <>
          {showIcons && <Icon small material="layers" className="primary" />}
          {value}
        </>
      )
    );
  };

  render() {
    const {
      className,
      showIcons,
      showClusterOption,
      clusterOptionLabel,
      customizeOptions,
      ...selectProps
    } = this.props;
    return (
      <Select
        className={cssNames("NamespaceSelect", className)}
        menuClass="NamespaceSelectMenu"
        formatOptionLabel={this.formatOptionLabel}
        options={this.options}
        {...selectProps}
      />
    );
  }
}
