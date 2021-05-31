import {ActionMeta} from "react-select/src/types";
import {observer} from "mobx-react";
import React from "react";
import {SubTitle} from "../layout/sub-title";
import {Icon} from "../icon";
import {_i18n} from "../../i18n";
import {t, Trans} from "@lingui/macro";
import {Input} from "../input";
import {computed, observable} from "mobx";
import {Stack} from "../../api/endpoints";
import {Select} from "../select";
import {stopPropagation} from "../../utils";
import {createMuiTheme, Grid, Paper} from "@material-ui/core";
import {ThemeProvider} from "@material-ui/core/styles";

const theme = createMuiTheme({
  overrides: {
    MuiExpansionPanelDetails: {
      root: {
        display: "gird",
      },
    },
    MuiPaper: {
      root: {
        color: "",
      },
    },
  },
});

export const stack: Stack = {
  address: "",
  verification: "Certificate",
  token: "",
  user: "",
  password: ""
}

interface Props<T = any> extends Partial<Props> {
  value?: T;
  themeName?: "dark" | "light" | "outlined";
  name?: string

  onChange?(value: T, meta?: ActionMeta<any>): void;
}

@observer
export class StackDetails extends React.Component<Props> {

  static defaultProps: {
    name: "Git"
  }
  // @observable value: Stack[] = this.props.value || [];

  @computed get value(): Stack[] {
    return this.props.value || [];
}

  add = () => {
    this.value.push(stack);
  }

  remove = (index: number) => {
    this.value.splice(index, 1);
  }

  get Options() {
    return [
      "Certificate",
      "Account"
    ]
  }

  rStack(index: number) {
    return (
      <>
        <br/>
        <Paper elevation={3} style={{padding: 25}}>
          <Grid container spacing={2} alignItems="center" direction="row">
            <Grid item xs={11} zeroMinWidth>
              <SubTitle title={<Trans>Address</Trans>}/>
              <Input
                className="item"
                placeholder={_i18n._(t`Address`)}
                title={this.value[index].address}
                value={this.value[index].address}
                onChange={value => {
                  this.value[index].address = value
                }}
              />
              <SubTitle title={<Trans>Verification</Trans>}/>
              <Select
                options={this.Options}
                value={this.value[index].verification}
                onChange={value => this.value[index].verification = value.value}
              />
              {this.value[index].verification == "Certificate" ?
                <>
                  <SubTitle title={<Trans>Token</Trans>}/>
                  <Input
                    className="item"
                    placeholder={_i18n._(t`Token`)}
                    title={this.value[index].token}
                    value={this.value[index].token}
                    onChange={value => {
                      this.value[index].token = value
                    }}
                  />
                  <br/>
                </> : null}
              {this.value[index].verification == "Account" ?
                <>
                  <SubTitle title={<Trans>User</Trans>}/>
                  <Input
                    className="item"
                    placeholder={_i18n._(t`User`)}
                    title={this.value[index].user}
                    value={this.value[index].user}
                    onChange={value => {
                      this.value[index].user = value
                    }}
                  />
                  <SubTitle title={<Trans>Password</Trans>}/>
                  <Input
                    className="item"
                    type="password"
                    placeholder={_i18n._(t`Password`)}
                    title={this.value[index].password}
                    value={this.value[index].password}
                    onChange={value => {
                      this.value[index].password = value
                    }}
                  />
                  <br/>
                </> : null}
            </Grid>
            <Grid item xs zeroMinWidth style={{textAlign: "center"}}>
              <Icon
                style={{margin: "0.8vw, 0.9vh"}}
                small
                tooltip={_i18n._(t`Remove Environment`)}
                className="remove-icon"
                material="clear"
                ripple="secondary"
                onClick={(e) => {
                  this.remove(index);
                  e.stopPropagation();
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </>
    )
  }

  render() {

    const {name} = this.props
    return (
      <ThemeProvider theme={theme}>
        <SubTitle
          title={
            <>
              {_i18n._(name)}
              &nbsp;&nbsp;
              <Icon material={"add_circle"} className={"add_circle"} onClick={event => {
                stopPropagation(event);
                this.add()
              }} />
            </>
          }>
        </SubTitle>
        {this.value.map((item, index) => {
          return this.rStack(index)
        })}
      </ThemeProvider>
    )
  }

}