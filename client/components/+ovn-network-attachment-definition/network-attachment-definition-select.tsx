import React from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { Select, SelectOption, SelectProps } from "../select";
import { cssNames, noop } from "../../utils";
import { Icon } from "../icon";
import { networkAttachmentDefinitionStore } from "./network-attachment-definition.store";
import { _i18n } from "../../i18n";

interface Props extends SelectProps {
  showIcons?: boolean;
  showClusterOption?: boolean; // show cluster option on the top (default: false)
  clusterOptionLabel?: React.ReactNode; // label for cluster option (default: "Cluster"
  name?: string;
  namespace: string;
  customizeOptions?(nsOptions: SelectOption[]): SelectOption[];
}

const defaultProps: Partial<Props> = {
  showIcons: true,
  showClusterOption: false,
  name: "",
  namespace: "",

  get clusterOptionLabel() {
    return _i18n._(t`NetworkAttachmentDefinition`);
  },
};

@observer
export class NetworkAttachmentDefinitionSelect extends React.Component<Props> {
  static defaultProps = defaultProps as object;
  private unsubscribe = noop;

  async componentDidMount() {
    if (!networkAttachmentDefinitionStore.isLoaded) await networkAttachmentDefinitionStore.loadAll();
    this.unsubscribe = networkAttachmentDefinitionStore.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  @computed get options(): SelectOption[] {
    const { customizeOptions, showClusterOption, clusterOptionLabel, name, namespace } = this.props;
    let options: SelectOption[];
    if (name != '') {
      options = networkAttachmentDefinitionStore.getAllByNs(namespace).filter(
        item => item.getName() == name).map(item => ({ value: item.getName() }));
    }
    else {
      options = networkAttachmentDefinitionStore.getAllByNs(namespace).map(item => ({ value: item.getName() }));
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
        className={cssNames("NetworkAttachmentSelect", className)}
        // menuClass="NetworkAttachmentSelect"
        formatOptionLabel={this.formatOptionLabel}
        options={this.options}
        {...selectProps}
      />
    );
  }
}
