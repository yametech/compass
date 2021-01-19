import "./namespace-allow-storageclass-select.scss"

import React from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { Select, SelectOption, SelectProps } from "../select";
import { cssNames, noop } from "../../utils";
import { Icon } from "../icon";
import { _i18n } from "../../i18n";
import { namespaceStore } from "./namespace.store";

interface Props extends SelectProps {
  showIcons?: boolean;
  showClusterOption?: boolean; // show cluster option on the top (default: false)
  clusterOptionLabel?: React.ReactNode; // label for cluster option (default: "Cluster")

  namespaceName?: string;
  customizeOptions?(nsOptions: SelectOption[]): SelectOption[];
}

const defaultProps: Partial<Props> = {
  showIcons: true,
  showClusterOption: false,
  namespaceName: '',
  get clusterOptionLabel() {
    return _i18n._(t`StorageClass`);
  },
};

@observer
export class NamespaceAllowStorageClassSelect extends React.Component<Props> {
  static defaultProps = defaultProps as object;
  private unsubscribe = noop;

  async componentDidMount() {
    if (!namespaceStore.isLoaded) await namespaceStore.loadAll();
    this.unsubscribe = namespaceStore.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  @computed get options(): SelectOption[] {
    const { customizeOptions, showClusterOption, clusterOptionLabel, namespaceName } = this.props;
    let options: SelectOption[];
    if (namespaceName != '') {

      try {
        options = namespaceStore.items.find(item => item.getName() === namespaceName)
          .getAnnotations().filter(item => item.startsWith("fuxi.kubernetes.io/default_storage_limit"))
          .map(item => (
            { value: JSON.parse(item.split('=')[1])[0] }
          ))
      } catch (err) {
        options = [];
      }
    } else {
      options = [];
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
        className={cssNames("NamespaceAllowStorageClassSelect", className)}
        menuClass="NamespaceAllowStorageClassSelect"
        formatOptionLabel={this.formatOptionLabel}
        options={this.options}
        {...selectProps}
      />
    );
  }
}

