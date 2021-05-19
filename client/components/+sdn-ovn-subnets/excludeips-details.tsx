import { ActionMeta } from "react-select/src/types";
import { observer } from "mobx-react";
import React from "react";
import { SubTitle } from "../layout/sub-title";
import { Icon } from "../icon";
import { _i18n } from "../../i18n";
import { t, Trans } from "@lingui/macro";
import { Input } from "../input";
import { computed, observable } from "mobx";
import { Grid } from "@material-ui/core";
import { stopPropagation } from "../../utils";

interface Props<T = any> extends Partial<Props> {
  value?: T;
  themeName?: "dark" | "light" | "outlined";
  divider?: true;

  onChange?(value: T, meta?: ActionMeta<any>): void;
}

@observer
export class ExcludeIPsDetails extends React.Component<Props> {

  // @observable value: string[] = this.props.value || [];
  @computed get value(): string[] {
    return this.props.value || [];
  }

  add = () => {
    this.value.push("");
  }

  remove = (index: number) => {
    this.value.splice(index, 1);
  }

  render() {

    return (
      <div>
        <SubTitle
          title={
            <>
              <Trans>Exclude IP</Trans>
              &nbsp;&nbsp;
              <Icon material={"add_circle"} className={"add_circle"} onClick={event => {
                stopPropagation(event);
                this.add()
              }} />
            </>
          }>
        </SubTitle>
        <div className="excludeIPs">
          {this.value.map((item, index) => {
            return (
              <div key={index}>
                <Grid container spacing={2} alignItems="center" direction="row">
                  <Grid item xs={11} zeroMinWidth>
                    <Input
                      className="item"
                      placeholder={_i18n._(t`IP`)}
                      title={this.value[index]}
                      value={this.value[index]}
                      onChange={value => {
                        this.value[index] = value
                      }}
                    />
                  </Grid>
                  <Grid item xs zeroMinWidth>
                    <Icon
                      small
                      tooltip={<Trans>Remove IP</Trans>}
                      className="remove-icon"
                      material="clear"
                      ripple="secondary"
                      onClick={(e) => {
                        this.remove(index);
                        e.stopPropagation()
                      }}
                    />
                  </Grid>
                </Grid>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}