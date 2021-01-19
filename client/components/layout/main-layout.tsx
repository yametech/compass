import "./main-layout.scss";

import * as React from "react";
import { observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { matchPath, RouteProps, NavLink } from "react-router-dom";
import { Trans } from "@lingui/macro";
import { createStorage, cssNames, isElectron } from "../../utils";
import { Tab, Tabs } from "../tabs";
import { Icon } from "../icon";
import { Sidebar } from "./sidebar";
import { configStore } from "../../config.store";
import { ErrorBoundary } from "../error-boundary";
import { Dock } from "../dock";
import { MenuItem } from "../menu";
import { MenuActions } from "../menu/menu-actions";
import { navigate, navigation } from "../../navigation";
import { i18nStore } from "../../i18n";
import { themeStore } from "../../theme.store";
import { namespaceStore } from "../+namespaces/namespace.store";
import { eventRoute, eventsURL } from "../+events";
import {withRouter,RouteComponentProps } from 'react-router';
import {kubeWatchApi } from '../../api/kube-watch-api'
import store from 'store'
import {Notifications} from "../notifications";
import { Tooltip, Badge } from '@material-ui/core';


export interface TabRoute extends RouteProps {
  title: React.ReactNode;
  url: string;
}

interface Props extends RouteComponentProps{
  className?: any;
  tabs?: TabRoute[];
  footer?: React.ReactNode;
  headerClass?: string;
  contentClass?: string;
  footerClass?: string;
}
interface State{

}

@observer
export class Layout extends React.Component<Props,State> {
  public storage = createStorage("main_layout", { pinnedSidebar: true });

  @observable isPinned = this.storage.get().pinnedSidebar;
  @observable isAccessible = true;
  
  

  @disposeOnUnmount syncPinnedStateWithStorage = reaction(
    () => this.isPinned,
    isPinned => this.storage.merge({ pinnedSidebar: isPinned })
  );

  toggleSidebar = () => {
    this.isPinned = !this.isPinned;
    this.isAccessible = false;
    setTimeout(() => this.isAccessible = true, 250);
  }

  changeTheme(){
    if(themeStore.activeThemeId === 'kontena-light'){
      themeStore.setTheme('kontena-dark')
    }
    if(themeStore.activeThemeId === 'kontena-dark'){
      themeStore.setTheme('kontena-light')
    }
  }

  loginout = () => {
    configStore.reset()
    kubeWatchApi.reset()
    window.localStorage.removeItem('lens_dock')
    window.localStorage.removeItem('lens_edit_resource_store')
    window.localStorage.removeItem('u_config')
    window.location.replace('/login')
  }

  changeLanguage = () => {
    const { setLocale, activeLang } = i18nStore;
    if(activeLang == 'zh-cn'){
      setLocale('en')
    }
    if(activeLang == 'en'){
      setLocale('zh-cn')
    }
  }

  ifLogin():any{
    const userConfig = store.get('u_config')
    if(!userConfig){
      Notifications.error('Token Expired');
      setTimeout(()=>{
          this.loginout()
      },1000)
      return null
    }
  }

  renderUserMenu(){
    const userConfig = store.get('u_config')
    let userName = userConfig?userConfig.userName:''
    const query = namespaceStore.getContextParams();
    let eventUrl = eventsURL({ query });
    // let routePath = eventRoute.path;
    // const { pathname } = navigation.location;
    // let isActive = !!matchPath(pathname, {
    //   path: routePath || eventUrl
    // });
    return (
      <div className="header-right">
          <NavLink to={eventUrl}>
            <Tooltip arrow title="Events">
              <Badge color="secondary" variant="dot">
                <Icon material="access_time" style={{ fontSize: 23 }} />
              </Badge>
            </Tooltip>
          </NavLink>
          {/* <Divider orientation="vertical" /> |*/}
          <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span>{userName}</span>
          <MenuActions>
            <MenuItem onClick={this.changeTheme}>
                <Icon material="brightness_medium" />
                <span className="title"><Trans>Theme</Trans></span>
            </MenuItem>
            <MenuItem onClick={this.changeLanguage}>
                <Icon material="g_translate" />
                <span className="title"><Trans>Language</Trans></span>
            </MenuItem>
            <MenuItem onClick={this.loginout}>
                <Icon material="exit_to_app" />
                <span className="title"><Trans>Logout</Trans></span>
            </MenuItem>
          </MenuActions>
      </div>
    )
  }


  render() {
    const { className, contentClass, headerClass, tabs, footer, footerClass, children } = this.props;
    const { clusterName, lensVersion, kubectlAccess } = configStore.config;
    const { pathname } = navigation.location;
    const { languages, setLocale, activeLang } = i18nStore;
    this.ifLogin()
    return (
      <div className={cssNames("MainLayout", className, themeStore.activeTheme.type)}>
        <header className={cssNames("flex gaps align-center", headerClass)}>
          <div className="box grow flex align-center">
            <div className="header-left">{clusterName && <span>{clusterName}</span>}</div>
            {this.renderUserMenu()}
          </div>
        </header>

        <aside className={cssNames("flex column", { pinned: this.isPinned, accessible: this.isAccessible })}>
          <Sidebar
            className="box grow"
            isPinned={this.isPinned}
            toggle={this.toggleSidebar}
          />
        </aside>

        {tabs && (
          <Tabs center onChange={url => navigate(url)}>
            {tabs.map(({ title, path, url, ...routeProps }) => {
              const isActive = !!matchPath(pathname, { path, ...routeProps });
              return <Tab key={url} label={title} value={url} active={isActive}/>
            })}
          </Tabs>
        )}

        <main className={contentClass}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>

        <footer className={footerClass}>
          {footer === undefined ? <Dock/> : footer}
        </footer>
      </div>
    );
  }
}

export const MainLayout =  withRouter(Layout);
