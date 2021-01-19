import React from "react";
import {computed} from "mobx";
import {observer} from "mobx-react";
import {t, Trans} from "@lingui/macro";
import {Select, SelectOption, SelectProps} from "../select";
import {cssNames, noop} from "../../utils";
import {Icon} from "../icon";
import {tenantRoleStore} from "./role.store";
import {_i18n} from "../../i18n";

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
export class BaseRoleSelect extends React.Component<Props> {
  static defaultProps = defaultProps as object;
  private unsubscribe = noop;

  async componentDidMount() {
    if (!tenantRoleStore.isLoaded) await tenantRoleStore.loadAll();
    this.unsubscribe = tenantRoleStore.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  @computed get options(): SelectOption[] {
    const {customizeOptions, showClusterOption, clusterOptionLabel} = this.props;
    let options: SelectOption[] = tenantRoleStore.items.map(item => ({value: item.getName()}));
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
        className={cssNames("BaseRoleSelect", className)}
        menuClass="BaseRoleSelectMenu"
        formatOptionLabel={this.formatOptionLabel}
        options={this.options}
        {...selectProps}
      />
    );
  }
}
