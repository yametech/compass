import React from 'react'
import axios from 'axios'
import store from 'store'
import {observable} from "mobx";
import {observer} from "mobx-react";
import {t, Trans} from "@lingui/macro";
import Alert from "@material-ui/lab/Alert";
import {SubTitle} from '../layout/sub-title'
import {cssNames} from "../../utils";
import {systemName} from "../input/input.validators";
import {configStore} from "../../config.store";
import {themeStore} from "../../theme.store";
import {Notifications} from "../notifications";
import {withRouter, RouteComponentProps} from 'react-router';
import {crdStore} from '../+custom-resources'
import {_i18n} from "../../i18n";
import {Input} from '../input'
import {Button} from '../button'
import './login.scss'
import {Paper, Slide} from "@material-ui/core";

interface Props extends RouteComponentProps {
  history: any
}

@observer
class LoginComponet extends React.Component<Props> {

  @observable username = ''
  @observable password = ''
  @observable loading = false

  onKeyDown = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13) {
      this.onFinish()
    }
  }

  onFinish = () => {
    if (!this.username || !this.password) {
      Notifications.error('Please enter account or password')
      return
    }
    this.loading = true
    axios.post('/user-login', {username: this.username, password: this.password})
    .then((res: any) => {
      configStore.isLoaded = true
      configStore.setConfig(res.data)
      store.set('u_config', res.data)
      crdStore.loadAll()
      Notifications.ok('Login Success')
      this.loading = true
      setTimeout(() => {
        if (res.data.isClusterAdmin === true) {
          this.props.history.push('/cluster')
        } else {
          this.props.history.push('/workloads')
        }
        this.loading = false
      }, 500)
    }).catch(err => {
      if (err && err.response) {
        Notifications.error(err.response.data)
      }
      this.loading = false
    })
  };

  render() {

    const logoImg = "data:image/png;base64,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"

    return (
      <div className={cssNames("login-main", themeStore.activeTheme.type)}>

        <Slide direction={"down"} in={this.loading} style={{ marginTop: "12px"}}>
          <Paper elevation={8} style={{ paddingLeft: "2vw", paddingTop: "1vh", width: "14vw", height:"4vh", flexWrap: 'wrap' }}>
              Loading......
            </Paper>
        </Slide>

        <div className="login-header">
          <div className="login-title">
            <img src={logoImg}/>
            <div className="text">Compass</div>
          </div>
          <div className="login-sub-title">Compass Cloud Platform</div>
        </div>

        <div className="login-content">
          <div>
            <SubTitle title={<Trans>Username</Trans>}/>
            <Input
              maxLength={30}
              placeholder={_i18n._(t`Input your username`)}
              value={this.username}
              iconleft="person"
              validators={systemName}
              onChange={v => this.username = v}
            />
            <SubTitle title={<Trans>Password</Trans>}/>
            <Input
              maxLength={30}
              placeholder={_i18n._(t`Input your password`)}
              value={this.password}
              iconleft="lock"
              onChange={v => this.password = v}
              onKeyDown={e => this.onKeyDown(e)}
              type="password"
            />
            <Button className="login-btn-submit" primary waiting={this.loading} onClick={this.onFinish}>
              Submit
            </Button>
          </div>

        </div>
        <div className="footer">
          <Alert style={{marginTop: '20px', padding: "2px 70px 2px"}} severity="warning">Only supports Chrome
            browser</Alert>
        </div>
      </div>
    );
  }
}

export const Login = withRouter(LoginComponet);