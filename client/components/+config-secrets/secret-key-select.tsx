import React from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { Select, SelectOption, SelectProps } from "../select";
import { cssNames, noop } from "../../utils";
import { Icon } from "../icon";
import { _i18n } from "../../i18n";
import { secretsStore } from "./secrets.store";

interface Props extends SelectProps {
  showIcons?: boolean;
  showClusterOption?: boolean; // show cluster option on the top (default: false)
  clusterOptionLabel?: React.ReactNode; // label for cluster option (default: "Cluster")

  name?: string;

  customizeOptions?(nsOptions: SelectOption[]): SelectOption[];
}

const defaultProps: Partial<Props> = {
  showIcons: true,
  showClusterOption: false,
  name: '',
  get clusterOptionLabel() {
    return _i18n._(t`Secret`);
  },
};

@observer
export class SecretKeySelect extends React.Component<Props> {
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
    const { customizeOptions, showClusterOption, clusterOptionLabel, name } = this.props;
    let options: SelectOption[];
    if (name != '') {
      try {
        let item = secretsStore.items.find(item => item.getName() == name);
        options = Object.keys(item.data).map(item => ({ value: item }));
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
        className={cssNames("SecretKeySelect", className)}
        menuClass="SecretKeySelect"
        formatOptionLabel={this.formatOptionLabel}
        options={this.options}
        {...selectProps}
      />
    );
  }
}
