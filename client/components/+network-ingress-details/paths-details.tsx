import {observer} from "mobx-react";
import React from "react";
import {computed, observable} from "mobx";
import {SubTitle} from "../layout/sub-title";
import {_i18n} from "../../i18n";
import {ActionMeta} from "react-select/src/types";
import {path, Path} from "./common";
import {Icon} from "../icon";
import {t, Trans} from "@lingui/macro";
import {BackendDetails} from "./backend-details";
import {Input} from "../input";
import {stopPropagation} from "../../utils";
import {Grid, Paper} from "@material-ui/core";

interface Props<T = any> extends Partial<Props> {
  value?: T;
  themeName?: "dark" | "light" | "outlined";

  onChange?(value: T, meta?: ActionMeta<any>): void;
}

@observer
export class PathsDetails extends React.Component<Props> {

  // @observable value: Path[] = this.props.value || [];
  @computed get value(): Path[] {
    return this.props.value || [];
  }

  add = () => {
    this.value.push(path);
  }

  remove = (index: number) => {
    this.value.splice(index, 1);
  }

  rResult(index: number) {
    return (
      <>
        <Paper elevation={3} style={{padding: 25}}>
          <Grid container spacing={5} alignItems="center" direction="row">
            <Grid item xs={11} zeroMinWidth>
              <SubTitle title={"Path"}/>
              <Input
                required={true}
                value={this.value[index].path}
                onChange={value => this.value[index].path = value}
              />
              <BackendDetails
                value={this.value[index].backend}
                onChange={value => this.value[index].backend = value}/>
            </Grid>
            <Grid item xs style={{textAlign: "center"}} zeroMinWidth>
              <Icon
                style={{margin: "0.8vw, 0.9vh"}}
                small
                ripple="secondary"
                tooltip={_i18n._(t`Remove`)}
                className="remove-icon"
                material="clear"
                onClick={(event) => {
                  this.remove(index);
                  stopPropagation(event);
                }}
              />
            </Grid>
          </Grid>
        </Paper>
        <br/>
      </>
    )
  }

  render() {
    return (
      <>
        <SubTitle
          title={
            <>
              <Trans>HTTP.paths</Trans>
              &nbsp;&nbsp;
              <Icon material="add_circle" className="add_circle" onClick={event => {
                stopPropagation(event);
                this.add()
              }} small/>
            </>
          }>
        </SubTitle>
        <br/>
        <div className="Results">
          {this.value.map((item, index) => {
            return this.rResult(index)
          })}
        </div>
      </>
    )
  }
}