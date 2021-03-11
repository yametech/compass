import React from "react";
import {computed} from "mobx";
import {observer} from "mobx-react";
import {t} from "@lingui/macro";
import {Select, SelectOption, SelectProps} from "../select";
import {cssNames, noop} from "../../utils";
import {Icon} from "../icon";
import {tenantUserStore} from "./user.store";
import {_i18n} from "../../i18n";

interface Props extends SelectProps {
  tenantId?: string;
  showIcons?: boolean;
  showClusterOption?: boolean; // show cluster option on the top (default: false)
  clusterOptionLabel?: React.ReactNode; // label for cluster option (default: "Cluster")
  customizeOptions?(nsOptions: SelectOption[]): SelectOption[];
}

const defaultProps: Partial<Props> = {
  tenantId: "",
  showIcons: true,
  showClusterOption: false,
  get clusterOptionLabel() {
    return _i18n._(t`Department`);
  },
};

@observer
export class BaseUserSelect extends React.Component<Props> {
  static defaultProps = defaultProps as object;
  private unsubscribe = noop;

  async componentDidMount() {
    if (!tenantUserStore.isLoaded) await tenantUserStore.loadAll();
    this.unsubscribe = tenantUserStore.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  @computed get options(): SelectOption[] {
    const {customizeOptions, showClusterOption, clusterOptionLabel, tenantId} = this.props;
    let options: SelectOption[] = tenantUserStore.items.filter(item=>{
      if (tenantId === "" || tenantId === item.spec.tenant_id){
        return true
      }
      return false
    }).map(item => ({value: item.getName()}));
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
        className={cssNames("BaseUserSelect", className)}
        menuClass="BaseUserSelect"
        formatOptionLabel={this.formatOptionLabel}
        options={this.options}
        {...selectProps}
      />
    );
  }
}
