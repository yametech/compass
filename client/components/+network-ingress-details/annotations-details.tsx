import {observer} from "mobx-react";
import React from "react";
import {computed, observable} from "mobx";
import {SubTitle} from "../layout/sub-title";
import {_i18n} from "../../i18n";
import {ActionMeta} from "react-select/src/types";
import {annotation, Annotation} from "./common";
import {Icon} from "../icon";
import {t, Trans} from "@lingui/macro";
import {AnnotationsSelect} from "./annotations-select";
import {Input} from "../input";
import {stopPropagation} from "../../utils";
import {Grid, Paper} from "@material-ui/core";

interface Props<T = any> extends Partial<Props> {
  value?: T;
  themeName?: "dark" | "light" | "outlined";

  onChange?(value: T, meta?: ActionMeta<any>): void;
}

@observer
export class AnnotationsDetails extends React.Component<Props> {

  @computed get value(): Annotation[] {
    return this.props.value || [];
  }

  add = () => {
    this.value.push(annotation);
  }

  remove = (index: number) => {
    this.value.splice(index, 1);
  }

  rResult(index: number) {
    return (
      <>
        <Grid container spacing={1} alignItems="center" direction="row">
          <Grid item xs={11} direction={"row"} zeroMinWidth>
            <Grid container spacing={4} direction={"row"} zeroMinWidth>
              <Grid item xs zeroMinWidth>
                <AnnotationsSelect
                  value={this.value[index].name}
                  onChange={value => {
                    this.value[index].name = value.value
                  }}
                />
              </Grid>
              <Grid item xs zeroMinWidth>
                <Input
                  required={true}
                  value={this.value[index].type}
                  onChange={value => this.value[index].type = value}
                />
              </Grid>
            </Grid>
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
        <br/>
      </>
    )
  }

  render() {
    const name = Object.keys(this.value);
    return (
      <>
        <SubTitle
          title={
            <>
              <Trans>Annotations</Trans>
              &nbsp;&nbsp;
              <Icon material="add_circle" className="add_circle" onClick={event => {
                stopPropagation(event);
                this.add()
              }} small/>
            </>
          }>
        </SubTitle>
        <div className="Results">
          {this.value.map((item, index) => {
            return this.rResult(index)
          })}
        </div>
      </>
    )
  }
}