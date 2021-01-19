import "./sidebar.scss";

import * as React from "react";
import { computed, observable, reaction } from "mobx";
import { observer } from "mobx-react";
import { matchPath, NavLink } from "react-router-dom";
import { Trans } from "@lingui/macro";
import { createStorage, cssNames } from "../../utils";
import { Icon } from "../icon";
import { workloadsRoute, workloadsURL } from "../+workloads";
import { namespacesURL } from "../+namespaces";
import { nodesURL } from "../+nodes";
import { usersManagementRoute, usersManagementURL } from "../+user-management";
import { networkRoute, networkURL } from "../+network";
import { storageRoute, storageURL } from "../+storage";
import { clusterURL } from "../+cluster";
import { tektonURL, tektonRoute, Tekton } from "../+tekton";
import { Istio, istioRoute, istioGatewayURL } from "../+istio";
import { ovnURL, ovnRoute, Ovn } from "../+ovn";
import { Config, configRoute, configURL } from "../+config";
import { eventRoute, eventsURL } from "../+events";
import { tenantRoute, tenantURL, Tenant } from "../+tenant";
import { Apps, appsRoute, appsURL } from "../+apps";
import { namespaceStore } from "../+namespaces/namespace.store";
import { TabRoute } from "./main-layout";
import { Workloads } from "../+workloads";
import { UserManagement } from "../+user-management";
import { Storage } from "../+storage";
import { Network } from "../+network";
import { crdStore } from "../+custom-resources";
import { CrdList, crdResourcesRoute, crdRoute, crdURL } from "../+custom-resources";
import { CustomResources } from "../+custom-resources/custom-resources";
import { navigation } from "../../navigation";
import store from 'store'

const SidebarContext = React.createContext<SidebarContextValue>({ pinned: false });
type SidebarContextValue = {
  pinned: boolean;
};

interface Props {
  className?: string;
  isPinned: boolean;

  toggle(): void;
}

@observer
export class Sidebar extends React.Component<Props> {
  renderCustomResources() {
    return Object.entries(crdStore.groups).map(([group, crds]) => {
      const submenus = crds.map(crd => {
        return {
          title: crd.getResourceKind(),
          component: CrdList,
          url: crd.getResourceUrl(),
          path: crdResourcesRoute.path,
        }
      })
      return (
        <SidebarNavItem
          key={group}
          id={group}
          className="sub-menu-parent"
          url={crdURL({ query: { groups: group } })}
          subMenus={submenus}
          text={group}
        />
      )
    })
  }

  render() {
    const { toggle, isPinned, className } = this.props;
    const userConfig = store.get('u_config')
    const isClusterAdmin = userConfig ? userConfig.isClusterAdmin : false
    const query = namespaceStore.getContextParams();
    return (
      <SidebarContext.Provider value={{ pinned: isPinned }}>
        <div className={cssNames("Sidebar flex column", className, { pinned: isPinned })}>
          <div className="header flex align-center">
            <NavLink exact to="/workloads" className="box grow">
              <Icon svg="compass" className="logo-icon" />
              <div className="logo-text">Compass</div>
            </NavLink>
            <Icon
              className="pin-icon"
              material={isPinned ? "keyboard_arrow_left" : "keyboard_arrow_right"}
              onClick={toggle}
              tooltip={isPinned ? <Trans>Compact view</Trans> : <Trans>Extended view</Trans>}
              focusable={false}
            />
          </div>
          <div className="sidebar-nav flex column box grow-fixed">
            <SidebarNavItem
              isHidden={!isClusterAdmin}
              id="cluster"
              url={clusterURL()}
              text={<Trans>Cluster</Trans>}
              icon={<Icon svg="kube" />}
            />
            <SidebarNavItem
              isHidden={!isClusterAdmin}
              id="nodes"
              url={nodesURL()}
              text={<Trans>Nodes</Trans>}
              icon={<Icon svg="nodes" />}
            />
            <SidebarNavItem
              id="workloads"
              url={workloadsURL({ query })}
              routePath={workloadsRoute.path}
              subMenus={Workloads.tabRoutes}
              text={<Trans>Workloads</Trans>}
              icon={<Icon svg="workloads" />}
            />
            <SidebarNavItem
              id="tekton"
              url={tektonURL({ query })}
              routePath={tektonRoute.path}
              subMenus={Tekton.tabRoutes}
              icon={<Icon material="palette" />}
              text={<Trans>Tekton</Trans>}
            />
            <SidebarNavItem
              id="istio"
              url={istioGatewayURL({ query })}
              routePath={istioRoute.path}
              subMenus={Istio.tabRoutes}
              icon={<Icon material="dialpad" />}
              text={<Trans>ServiceMesh</Trans>}
            />
            <SidebarNavItem
              id="config"
              url={configURL({ query })}
              routePath={configRoute.path}
              subMenus={Config.tabRoutes}
              text={<Trans>Configuration</Trans>}
              icon={<Icon material="list" />}
            />
            <SidebarNavItem
              id="networks"
              url={networkURL({ query })}
              routePath={networkRoute.path}
              subMenus={Network.tabRoutes}
              text={<Trans>Network</Trans>}
              icon={<Icon material="device_hub" />}
            />
            <SidebarNavItem
              id="storage"
              url={storageURL({ query })}
              routePath={storageRoute.path}
              subMenus={Storage.tabRoutes}
              icon={<Icon svg="storage" />}
              text={<Trans>Storage</Trans>}
            />
            {/* <SidebarNavItem
              id="events"
              url={eventsURL({ query })}
              routePath={eventRoute.path}
              icon={<Icon material="access_time" />}
              text={<Trans>Events</Trans>}
            /> */}
            <SidebarNavItem
              isHidden={!isClusterAdmin}
              id="namespaces"
              url={namespacesURL()}
              icon={<Icon material="layers" />}
              text={<Trans>Namespaces</Trans>}
            />
            <SidebarNavItem
              isHidden={!isClusterAdmin}
              id="ovn"
              url={ovnURL({ query })}
              routePath={ovnRoute.path}
              subMenus={Ovn.tabRoutes}
              icon={<Icon material="wifi_tethering" />}
              text={<Trans>OVN Config</Trans>}
            />
            <SidebarNavItem
              isHidden={!isClusterAdmin}
              id="tenant"
              url={tenantURL({ query })}
              routePath={tenantRoute.path}
              subMenus={Tenant.tabRoutes}
              text={<Trans>Tenant</Trans>}
              icon={<Icon material="people" />}
            />
            <SidebarNavItem
              id="apps"
              isHidden={!isClusterAdmin}
              url={appsURL({ query })}
              subMenus={Apps.tabRoutes}
              routePath={appsRoute.path}
              icon={<Icon material="apps" />}
              text={<Trans>Apps</Trans>}
            />
            <SidebarNavItem
              isHidden={!isClusterAdmin}
              id="users"
              url={usersManagementURL({ query })}
              routePath={usersManagementRoute.path}
              subMenus={UserManagement.tabRoutes}
              icon={<Icon material="security" />}
              text={<Trans>Access Control</Trans>}
            />
            <SidebarNavItem
              isHidden={!isClusterAdmin}
              id="custom-resources"
              url={crdURL()}
              subMenus={CustomResources.tabRoutes}
              routePath={crdRoute.path}
              icon={<Icon material="extension" />}
              text={<Trans>Custom Resources</Trans>}
            >
              {this.renderCustomResources()}
            </SidebarNavItem>
          </div>
        </div>
      </SidebarContext.Provider>
    )
  }
}

interface SidebarNavItemProps {
  id: string;
  url: string;
  text: React.ReactNode | string;
  className?: string;
  icon?: React.ReactNode;
  isHidden?: boolean;
  routePath?: string | string[];
  subMenus?: TabRoute[];
}

const navItemStorage = createStorage<[string, boolean][]>("sidebar_menu_item", []);
const navItemState = observable.map<string, boolean>(navItemStorage.get());
reaction(() => [...navItemState], value => navItemStorage.set(value));

@observer
class SidebarNavItem extends React.Component<SidebarNavItemProps> {
  static contextType = SidebarContext;
  public context: SidebarContextValue;

  @computed get isExpanded() {
    return navItemState.get(this.props.id);
  }

  toggleSubMenu = () => {
    navItemState.set(this.props.id, !this.isExpanded);
  }

  isActive = () => {
    const { routePath, url } = this.props;
    const { pathname } = navigation.location;
    return !!matchPath(pathname, {
      path: routePath || url
    });
  }

  render() {
    const { isHidden, subMenus = [], icon, text, url, children, className } = this.props;
    if (isHidden) {
      return null;
    }
    const extendedView = (subMenus.length > 0 || children) && this.context.pinned;
    if (extendedView) {
      const isActive = this.isActive();
      return (
        <div className={cssNames("SidebarNavItem", className)}>
          <div className={cssNames("nav-item", { active: isActive })} onClick={this.toggleSubMenu}>
            {icon}
            <span className="link-text">{text}</span>
            <Icon
              className="expand-icon"
              material={this.isExpanded ? "keyboard_arrow_up" : "keyboard_arrow_down"}
            />
          </div>
          <ul className={cssNames("sub-menu", { active: isActive })}>
            {subMenus.map(({ title, url }) => (
              <NavLink key={url} to={url} className={cssNames({ visible: this.isExpanded })}>
                {title}
              </NavLink>
            ))}
            {React.Children.toArray(children).map((child: React.ReactElement<any>) => {
              return React.cloneElement(child, {
                className: cssNames(child.props.className, { visible: this.isExpanded })
              });
            })}
          </ul>
        </div>
      )
    }
    return (
      <NavLink className={cssNames("SidebarNavItem", className)} to={url} isActive={this.isActive}>
        {icon}
        <span className="link-text">{text}</span>
      </NavLink>
    )
  }
}
