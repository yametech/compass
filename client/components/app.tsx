import "./app.scss";
import React from "react";
import store from 'store'
import { render } from "react-dom";
import { Redirect, Route, Router, Switch } from "react-router";
import { observer } from "mobx-react";
import { I18nProvider } from '@lingui/react'
import { _i18n, i18nStore } from "../i18n";
import { browserHistory } from "../navigation";
import { Notifications } from "./notifications";
import { NotFound } from "./+404";
import { configStore } from "../config.store";
import { UserManagement } from "./+user-management";
import { ConfirmDialog } from "./confirm-dialog";
import { usersManagementRoute } from "./+user-management";
import { clusterRoute, clusterURL } from "./+cluster";
import { KubeConfigDialog } from "./kubeconfig-dialog";
import { Nodes, nodesRoute } from "./+nodes";
import { Workloads, workloadsRoute, workloadsURL } from "./+workloads";
import { Tenant, tenantRoute } from "./+tenant-manage";
import { Namespaces, namespacesRoute } from "./+namespaces";
import { Network, networkRoute } from "./+network";
import { Storage, storageRoute } from "./+storage";
import { Cluster } from "./+cluster/cluster";
import { Config, configRoute } from "./+config";
import { Events } from "./+events";
import { Login } from "./+login";
import { Tekton, tektonRoute } from "./+tekton";
import { Istio, istioRoute } from "./+istio"
import { SDN, ovnRoute } from "./+sdn";
import { eventRoute } from "./+events";
import { ErrorBoundary } from "./error-boundary";
import { Apps, appsRoute } from "./+apps";
import { KubeObjectDetails } from "./kube-object";
import { AddRoleBindingDialog } from "./+user-management-roles-bindings";
import { PodLogsDialog } from "./+workloads-pods/pod-logs-dialog";
import { DeploymentScaleDialog } from "./+workloads-deployments/deployment-scale-dialog";
import { CustomResources } from "./+custom-resources/custom-resources";
import { crdRoute } from "./+custom-resources";

@observer
class App extends React.Component {
  static rootElem = document.getElementById('app');

  static async init() {
    await i18nStore.init();
    // await configStore.load();

    // render app
    render(<App />, App.rootElem);
  };

  render() {
    let homeUrl = ''
    const userConfig = store.get('u_config')
    if (userConfig) {
      configStore.setConfig(userConfig)
      let admin = userConfig.isClusterAdmin
      homeUrl = admin == 'true' ? clusterURL() : workloadsURL();
    }
    else {
      homeUrl = '/login'
    }
    return (
      <div>

        <I18nProvider i18n={_i18n}>
          <Router history={browserHistory}>
            <ErrorBoundary>
              <Switch>
                <Route component={Cluster} {...clusterRoute} />
                <Route component={Nodes} {...nodesRoute} />
                <Route component={Workloads} {...workloadsRoute} />
                <Route component={Config} {...configRoute} />
                <Route component={Network} {...networkRoute} />
                <Route component={Storage} {...storageRoute} />
                <Route component={Namespaces} {...namespacesRoute} />
                <Route component={Events} {...eventRoute} />
                <Route component={Tekton} {...tektonRoute} />
                <Route component={Istio} {...istioRoute} />
                <Route component={SDN} {...ovnRoute} />
                <Route component={CustomResources} {...crdRoute} />
                <Route component={UserManagement} {...usersManagementRoute} />
                <Route component={Apps} {...appsRoute} />
                <Route component={Tenant} {...tenantRoute} />
                <Redirect exact from="/" to={homeUrl} />
                <Route component={Login} path="/login" />
                <Route path="*" component={NotFound} />

              </Switch>
              <KubeObjectDetails />
              <Notifications />
              <ConfirmDialog />
              <KubeConfigDialog />
              <AddRoleBindingDialog />
              <PodLogsDialog />
              <DeploymentScaleDialog />
            </ErrorBoundary>
          </Router>
        </I18nProvider>
      </div>

    )
  }
}

// run app
App.init();
