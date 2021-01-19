import React from "react";
import {computed} from "mobx";
import {observer} from "mobx-react";
import {t, Trans} from "@lingui/macro";
import {Select, SelectOption, SelectProps} from "../select";
import {cssNames, noop} from "../../utils";
import {Icon} from "../icon";
import {_i18n} from "../../i18n";
import {serviceStore} from "./services.store";

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
export class ServicesSelect extends React.Component<Props> {
  static defaultProps = defaultProps as object;
  private unsubscribe = noop;

  async componentDidMount() {
    if (!serviceStore.isLoaded) await serviceStore.loadAll();
    this.unsubscribe = serviceStore.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  @computed get options(): SelectOption[] {
    const {customizeOptions, showClusterOption, clusterOptionLabel, namespace} = this.props;
    let options: SelectOption[];
    if (namespace != '') {
      options = serviceStore.items.filter(
        item => item.getNs() == namespace).map(item => ({value: item.getName()}));
    }
    else{
      options = serviceStore.items.map(item => ({value: item.getName()}));
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
      <div>
        {showIcons && <Icon small material="layers" className="primary" />}
        {value}
      </div>
    );
  }

  render() {
    const {className, showIcons, showClusterOption, clusterOptionLabel, customizeOptions, ...selectProps} = this.props;
    return (
      <Select
        className={cssNames("ServicesSelect", className)}
        menuClass="SecretsSelect"
        formatOptionLabel={this.formatOptionLabel}
        options={this.options}
        {...selectProps}
      />
    );
  }
}
