import {ActionMeta} from "react-select/src/types";
import {observer} from "mobx-react";
import React from "react";
import {Icon} from "../icon";
import {_i18n} from "../../i18n";
import {t, Trans} from "@lingui/macro";
import {Input} from "../input";
import {computed, observable} from "mobx";
import {VolumeMounts, volumeMount, volumeMounts} from "./common";
import {Grid,Paper} from "@material-ui/core";
import {stopPropagation} from "../../utils";
import {SubTitle} from "../layout/sub-title";
import { Select } from "../select";

interface ArgsProps<T = any> extends Partial<ArgsProps> {
  value?: T;
  themeName?: "dark" | "light" | "outlined";

  onChange?(value: T, meta?: ActionMeta<any>): void;
}

@observer
export class VolumeMountDetails extends React.Component<ArgsProps> {

  // @observable value: VolumeMounts = this.props.value || volumeMounts;
  @computed get value(): VolumeMounts {
    return this.props.value || volumeMounts;
  }

  get selectOptions() {
    return [
      "VolumeClaim",
      "ConfigMaps",
      "Secrets"
    ]
  }

  add = () => {
    this.value.items.push(volumeMount);
  }

  remove = (index: number) => {
    this.value.items.splice(index, 1);
  }

  rVolumeMounts(index: number) {
    return (
      <>
        {index !==0 && <br/>}
        <Paper elevation={3} style={{padding: 25}}>
          <Grid container spacing={2} alignItems={"center"} direction={"row"} zeroMinWidth>
            <Grid item xs={11} direction={"row"} zeroMinWidth>
              <Grid container spacing={1} direction={"row"} zeroMinWidth>
                <Select
                  options={this.selectOptions}
                  value={this.value.items[index].mountType}
                  onChange={v => {
                    this.value.items[index].mountType = v.value
                  }}
                />
                <br/>
                <br/>
                <br/>
                <Grid container spacing={2} alignItems={"center"} direction={"row"} zeroMinWidth>
                  <Grid item xs={12} direction={"row"} zeroMinWidth>
                    <Grid container spacing={5} direction={"row"} zeroMinWidth>
                      <Grid item xs zeroMinWidth>
                        <Input
                          required={true}
                          placeholder={_i18n._(t`MountPath eg: /data`)}
                          value={this.value.items[index].mountPath}
                          onChange={
                            value => this.value.items[index].mountPath = value
                          }
                        />
                      </Grid>
                      <Grid item xs zeroMinWidth>
                        <Input
                          required={true}
                          placeholder={_i18n._(t`Name eg: volumeClaims name`)}
                          value={this.value.items[index].name}
                          onChange={value => this.value.items[index].name = value}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs zeroMinWidth>
              <Icon
                small
                tooltip={<Trans>Remove VolumeMounts</Trans>}
                className="remove-icon"
                material="clear"
                ripple="secondary"
                onClick={(event) => {
                  this.remove(index);
                  stopPropagation(event)
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </>
    )
  }

  render() {
    return (
      <>
        <SubTitle title={
          <>
            <Trans>VolumeMounts</Trans>
            &nbsp;&nbsp;
            <Icon material={"add_circle"} className={"add_circle"} onClick={event => {
              this.add();
              stopPropagation(event)
            }} />
          </>
        }/>
        {this.value.items.map((item: any, index: number) => {
          return this.rVolumeMounts(index)
        })}
      </>
    )
  }
}