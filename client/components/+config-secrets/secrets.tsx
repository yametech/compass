import "./secrets.scss"

import * as React from "react";
import { observer } from "mobx-react";
import { Trans, t } from "@lingui/macro";
import { RouteComponentProps } from "react-router";
import { Secret, secretsApi } from "../../api/endpoints";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object";
import { AddSecretDialog } from "./add-secret-dialog";
import { ISecretsRouteParams } from "./secrets.route";
import { KubeObjectListLayout } from "../kube-object";
import { Badge } from "../badge";
import { secretsStore, tektonConfigStore } from "./secrets.store";
import { apiManager } from "../../api/api-manager";
import { ConfigSecretDialog } from "./config-secret-dialog";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { _i18n } from "../../i18n";
import { observable } from "mobx";
import { namespaceStore } from "../+namespaces/namespace.store";
import { useEffect, useState } from "react";
import { Notifications } from "../notifications";
import { apiBase } from "../../api";
import { Link } from "react-router-dom";
import { stopPropagation } from "../../utils";
import Tooltip from "@material-ui/core/Tooltip";

enum sortBy {
  name = "name",
  namespace = "namespace",
  labels = "labels",
  keys = "keys",
  type = "type",
  age = "age",
}

interface Props extends RouteComponentProps<ISecretsRouteParams> {
}

@observer
export class Secrets extends React.Component<Props> {

  @observable className: string = "Secrets"
  @observable addRemoveButtons = {}

  renderSecretName(secret: Secret) {
    const name = secret.getName();
    return (
      <Link onClick={(event) => { stopPropagation(event); ConfigSecretDialog.open(secret) }} to={null}>
        <Tooltip title={name} placement="top-start">
          <span>{name}</span>
        </Tooltip>
      </Link>
    );
  }

  render() {
    const store = this.className == "Secrets" ? secretsStore : tektonConfigStore;
    return (
      <>
        <KubeObjectListLayout
          className={this.className}
          store={store}
          dependentStores={[namespaceStore]}
          sortingCallbacks={{
            [sortBy.name]: (item: Secret) => item.getName(),
            [sortBy.namespace]: (item: Secret) => item.getNs(),
            [sortBy.labels]: (item: Secret) => item.getLabels(),
            [sortBy.keys]: (item: Secret) => item.getKeys(),
            [sortBy.type]: (item: Secret) => item.type,
            [sortBy.age]: (item: Secret) => item.getAge(false),
          }}
          searchFilters={[
            (item: Secret) => item.getSearchFields(),
            (item: Secret) => item.getKeys(),
          ]}
          renderHeaderTitle={_i18n._(this.className)}
          renderTableHeader={[
            { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
            { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
            { title: <Trans>Labels</Trans>, className: "labels", sortBy: sortBy.labels },
            { title: <Trans>Keys</Trans>, className: "keys", sortBy: sortBy.keys },
            { title: <Trans>Type</Trans>, className: "type", sortBy: sortBy.type },
            { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          ]}
          renderTableContents={(secret: Secret) => [
            this.renderSecretName(secret),
            secret.getNs(),
            secret.getLabels().map(label => <Badge key={label} label={label} />),
            secret.getKeys().join(", "),
            secret.type,
            secret.getAge(),
          ]}
          renderItemMenu={(item: Secret) => {
            return <SecretMenu object={item} className={this.className} />
          }}
          addRemoveButtons={{
            onAdd: () => AddSecretDialog.open(),
            addTooltip: <Trans>Create new Secret</Trans>
          }}
        />
        <AddSecretDialog className={this.className} />
        <ConfigSecretDialog className={this.className} />
      </>
    );
  }
}

export function SecretMenu(props: KubeObjectMenuProps<Secret>) {
  const { object, toolbar, className } = props;

  const [mount, setMount] = useState("Mount");
  const [mountIcon, setMountIcon] = useState("add");

  useEffect(() => {
    const labels = object.getLabel("mount");
    if (labels == undefined) {
      setMount("Mount");
      setMountIcon("add");
    } else {
      setMount("Unmount");
      setMountIcon("remove");
    }
  });

  const patchAddToServiceAccount = async () => {
    const data = {
      namespace: object.getNs(),
      name: object.getName(),
    };
    try {
      await apiBase.post("/serviceaccount/patch/add", { data })
      Notifications.ok(<> patch add to serviceAccount succeeded</>);
    } catch (err) {
      Notifications.error(err);
    }
  };

  const patchRemoveFromServiceAccount = async () => {
    const data = {
      namespace: object.getNs(),
      name: object.getName(),
    };
    try {
      await apiBase.post("/serviceaccount/patch/remove", { data })
      Notifications.ok(<> patch remove to serviceAccount succeeded</>);
    } catch (err) {
      Notifications.error(err);
    }
  }

  const mountAction = () => {
    let newLabels = new Map<string, string>();
    if (mount == "Unmount") {
      try {
        object.removeLable("mount")
        tektonConfigStore.update(object, { ...object })
        patchRemoveFromServiceAccount()
        setMount("Mount");
        setMountIcon("add");
      } catch (err) {
        Notifications.error(err);
      }
    } else {
      try {
        object.addLabel("mount", "1");
        tektonConfigStore.update(object, { ...object })
        patchAddToServiceAccount()
        setMount("Unmount");
        setMountIcon("remove");
      } catch (err) {
        Notifications.error(err);
      }

    }
    Notifications.ok("operation completed");
  }

  return (
    <>
      <KubeObjectMenu {...props} >
        {
          className == "TektonConfig" ?
            <MenuItem onClick={mountAction}>
              <Icon material={mountIcon} title={_i18n._(t`Mount`)} interactive={toolbar} />
              <span className="title">{_i18n._(mount)}</span>
            </MenuItem> : null
        }
        <MenuItem onClick={() => ConfigSecretDialog.open(object)}>
          <Icon material="sync_alt" title={_i18n._(t`Secret`)} interactive={toolbar} />
          <span className="title"><Trans>Config</Trans></span>
        </MenuItem>
      </KubeObjectMenu>
    </>
  )
}

apiManager.registerViews(secretsApi, { Menu: SecretMenu, })

