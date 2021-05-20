import "./config-secret-dialog.scss"

import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { _i18n } from "../../i18n";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Input } from "../input";
import { isUrl, systemName } from "../input/input.validators";
import { Secret, SecretType, tektonConfigApi, secretsApi } from "../../api/endpoints";
import { SubTitle } from "../layout/sub-title";
import { NamespaceSelect } from "../+namespaces/namespace-select";
import { Select, SelectOption } from "../select";
import { Icon } from "../icon";
import { Grid } from "@material-ui/core";
import { IKubeObjectMetadata } from "../../api/kube-object";
import { base64 } from "../../utils";
import { Notifications } from "../notifications";
import upperFirst from "lodash/upperFirst";
import { Checkbox } from "../checkbox";
import { configStore } from "../../config.store";
import { namespaceStore } from "../+namespaces/namespace.store";
import { apiManager } from "../../../client/api/api-manager";

interface Props extends Partial<DialogProps> {
  className: string
}

export interface DockerConfig {
  username: string,
  password: string,
  email?: string,
}

export interface DockerConfigAuth {
  [params: string]: DockerConfig
}

export interface ISecretTemplateField {
  key?: string;
  value?: string;
  required?: boolean;
  ".dockerconfigjson"?: string;
}

export interface ISecretTemplate {
  [field: string]: ISecretTemplateField[];

  annotations?: ISecretTemplateField[];
  labels?: ISecretTemplateField[];
  data?: ISecretTemplateField[];
}

export type ISecretField = keyof ISecretTemplate;

@observer
export class ConfigSecretDialog extends React.Component<Props> {

  @observable static isOpen = false;
  @observable static secret: Secret;
  @observable iSecretTemplate: ISecretTemplate;
  @observable dockerConfigAddress: string = "";
  @observable dockerConfig: DockerConfig = {
    username: "",
    password: "",
    email: "",
  };

  static open(secret: Secret) {
    ConfigSecretDialog.isOpen = true;
    ConfigSecretDialog.secret = secret;
  }

  static close() {
    ConfigSecretDialog.isOpen = false;
  }

  private secretTemplate: { [p: string]: ISecretTemplate } = {
    [SecretType.Opaque]: {},
    [SecretType.ServiceAccountToken]: {
      annotations: [
        { key: "kubernetes.io/service-account.name", required: true },
        { key: "kubernetes.io/service-account.uid", required: true }
      ],
    },
    [SecretType.DockerConfigJson]: {},
    [SecretType.CephProvisioner]: {},
    [SecretType.BasicAuth]: {},
    [SecretType.SSHAuth]: {},
  }

  private opsSecretTemplate: { [p: string]: ISecretTemplate } = {
    [SecretType.BasicAuth]: {
      data: [
        { key: "username", required: true },
        { key: "password", required: true }
      ]
    },
    [SecretType.SSHAuth]: {
      data: [
        { key: "ssh-privatekey", value: "", required: true },
      ]
    },
  }

  get types() {
    if (this.isTektonConfig) {
      return Object.keys(this.opsSecretTemplate) as SecretType[];
    }
    return Object.keys(this.secretTemplate) as SecretType[];
  }

  @observable secret = this.secretTemplate;
  @observable name = "";
  @observable namespace = "default";
  @observable type = SecretType.Opaque;
  @observable userNotVisible = false;
  @observable isTektonConfig = false;

  reset = () => {
    this.secret = null;
    this.name = "";
    this.namespace = "default";
    this.isTektonConfig = false;
  }

  close = () => {
    ConfigSecretDialog.close();
  }

  onOpen = async () => {
    Object.assign(this, ConfigSecretDialog.secret);
    this.name = ConfigSecretDialog.secret.getName();
    this.namespace = ConfigSecretDialog.secret.getNs();

    if (this.props.className == "TektonConfig") {
      this.isTektonConfig = true;
      this.secret = this.opsSecretTemplate;
      this.type = ConfigSecretDialog.secret.type;

      let iNamespace = namespaceStore.getByName(configStore.getOpsNamespace());
      if (iNamespace == undefined) {
        iNamespace = await namespaceStore.create({ name: configStore.getOpsNamespace() });
        this.namespace = iNamespace.getName();
      }
    }

    // reset data
    if (this.secret[this.type].data == undefined && this.type != SecretType.DockerConfigJson) {
      this.secret[this.type].data = [];
    }

    if (this.type == SecretType.DockerConfigJson) {

      const obj = JSON.parse(
        base64.decode(
          Object.assign(ConfigSecretDialog.secret.data)[".dockerconfigjson"]
        )
      )
      const auth = obj["auths"]

      Object.keys(auth).map(key => {
        this.dockerConfigAddress = key
        this.dockerConfig.username = auth[key]["username"] || "";
        this.dockerConfig.password = auth[key]["password"] || "";
        this.dockerConfig.email = auth[key]["email"] || "";
      })
    } else {
      Object.keys(ConfigSecretDialog.secret.data).map(key => {
        let setSuccess: boolean = false;
        this.secret[this.type].data.map(item => {
          if (item.key == key) {
            item.value = base64.decode(ConfigSecretDialog.secret.data[key]);
            setSuccess = true;
          }
        })
        if (!setSuccess) {
          this.secret[this.type].data.push(
            { key: key, value: base64.decode(ConfigSecretDialog.secret.data[key]), required: true }
          )
        }
      })
    }

    // reset annotations
    if (this.secret[this.type].annotations == undefined) {
      this.secret[this.type].annotations = [];
    }

    ConfigSecretDialog.secret.getAnnotations().map(item => {
      const splitR = item.split("=", 2)
      let setSuccess: boolean = false;
      this.secret[this.type].annotations.map(item => {
        if (item.key == splitR[0]) {
          item.value = splitR[1];
          setSuccess = true;
        }
      })
      if (!setSuccess) {
        this.secret[this.type].annotations.push(
          { key: splitR[0], value: splitR[1], required: true }
        )
      }
    })

    // reset labels
    if (this.secret[this.type].labels == undefined) {
      this.secret[this.type].labels = [];
    }

    ConfigSecretDialog.secret.getLabels().map(item => {
      const splitR = item.split("=", 2)
      let setSuccess: boolean = false;
      this.secret[this.type].labels.map(item => {
        if (item.key == splitR[0]) {
          item.value = splitR[1];
          setSuccess = true;
        }
      })

      if (!setSuccess) {
        this.secret[this.type].labels.push(
          { key: splitR[0], value: splitR[1], required: true }
        )
      }

    })
  }

  private getDataFromFields = (fields: ISecretTemplateField[] = [], processValue?: (val: string) => string) => {

    if (this.type == SecretType.DockerConfigJson) {

      let auth: DockerConfigAuth = {}
      auth[this.dockerConfigAddress] = this.dockerConfig;
      let secretTemplate: ISecretTemplateField = {
        ".dockerconfigjson": base64.encode(JSON.stringify(auth))
      }
      return secretTemplate
    }

    return fields.reduce<any>((data, field) => {
      const { key, value } = field;
      if (key) {
        data[key] = processValue ? processValue(value) : value;
      }
      return data;
    }, {});

  }

  updateSecret = async () => {
    let { name, namespace, type } = this;
    const { className } = this.props;
    const { data = [], labels = [], annotations = [] } = this.secret[type];

    ConfigSecretDialog.secret.metadata.annotations = this.getDataFromFields(annotations);
    ConfigSecretDialog.secret.metadata.labels = this.getDataFromFields(labels);
    ConfigSecretDialog.secret.setData(this.getDataFromFields(data, val => val ? base64.encode(val) : ""));

    try {
      const api = className == "TektonConfig" ? tektonConfigApi : secretsApi;
      await api.update({ name: name, namespace: namespace }, { ...ConfigSecretDialog.secret });
      Notifications.ok(
        <div>Secret {name} save succeeded</div>
      );
      this.close();
    } catch (err) {
      Notifications.error(err);
    }
  }

  addField = (field: ISecretField) => {
    const fields = this.secret[this.type][field] || [];
    fields.push({ key: "", value: "" });
    this.secret[this.type][field] = fields;
  }

  removeField = (field: ISecretField, index: number) => {
    const fields = this.secret[this.type][field] || [];
    fields.splice(index, 1);
  }

  renderFields(field: ISecretField) {
    const fields = this.secret[this.type][field] || [];
    return (
      <>
        <SubTitle compact className="fields-title" title={upperFirst(field.toString())}>
          <Icon
            tooltip={_i18n._(t`Add Field`)}
            material="add_circle"
            className="add_circle"
            onClick={() => this.addField(field)}
          />
        </SubTitle>
        <div className="secret-fields">
          {fields.map((item, index) => {
            const { key = "", value = "", required } = item;
            return (
              <div key={index}>
                <Grid container spacing={2} alignItems="center" direction="row">
                  <Grid item xs={11} direction={"row"} zeroMinWidth>
                    <Grid container spacing={2} direction={"row"} zeroMinWidth>
                      <Grid item xs zeroMinWidth>
                        <Input
                          className="key"
                          placeholder={_i18n._(t`Name`)}
                          title={key}
                          tabIndex={required ? -1 : 0}
                          readOnly={required}
                          value={key} onChange={v => item.key = v}
                        />
                      </Grid>
                      <Grid item xs zeroMinWidth>
                        <Input
                          multiLine maxRows={5}
                          required={required}
                          className="value"
                          placeholder={_i18n._(t`Value`)}
                          value={value} onChange={v => item.value = v}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs zeroMinWidth>
                    <Icon
                      small
                      tooltip={required ? <Trans>Required Field</Trans> : <Trans>Remove Field</Trans>}
                      className="remove-icon"
                      material="clear"
                      ripple="secondary"
                      onClick={() => this.removeField(field, index)}
                    />
                  </Grid>
                </Grid>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  renderDockerConfigFields() {
    return (
      <div>
        <br />
        <SubTitle title={<Trans>Address</Trans>} />
        <Input
          required={true}
          placeholder={_i18n._("Address")}
          validators={isUrl}
          value={this.dockerConfigAddress}
          onChange={value => this.dockerConfigAddress = value}
        />
        <SubTitle title={<Trans>User</Trans>} />
        <Input
          required={true}
          placeholder={_i18n._("User")}
          value={this.dockerConfig.username}
          onChange={value => this.dockerConfig.username = value}
        />
        <SubTitle title={<Trans>Password</Trans>} />
        <Input
          placeholder={_i18n._("Password")}
          required={true}
          type={"password"}
          value={this.dockerConfig.password}
          onChange={value => this.dockerConfig.password = value}
        />
        <SubTitle title={<Trans>Email</Trans>} />
        <Input
          placeholder={_i18n._("Email")}
          value={this.dockerConfig.email}
          onChange={value => this.dockerConfig.email = value}
        />
      </div>
    )
  }

  renderData = (field: ISecretField) => {
    const fields = this.secret[this.type][field] || [];

    return (
      <div className="secret-fields">
        <SubTitle compact className="fields-title" title={upperFirst(field.toString())} />
        {fields.map((item, index) => {
          const { key = "", value = "", required } = item;
          return (
            <div key={index} style={{ marginTop: 8 }} className="secret-field flex gaps auto align-center">
              <Input
                disabled={true}
                className="key"
                placeholder={_i18n._(t`Name`)}
                title={key}
                tabIndex={required ? -1 : 0}
                readOnly={required}
                value={key} onChange={v => item.key = v}
              />
              <Input
                type={index == 1 ? "password" : ""}
                required={required}
                className="value"
                placeholder={_i18n._(t`Value`)}
                value={value} onChange={v => item.value = v}
              />
            </div>
          )
        })}
      </div>
    )
  }

  render() {
    const { className, ...dialogProps } = this.props;
    let { namespace, name, type } = this;
    const { isClusterAdmin } = configStore;
    const header = <h5><Trans>Update Secret</Trans></h5>;

    return (
      <Dialog
        {...dialogProps}
        className="ConfigSecretDialog"
        onOpen={this.onOpen}
        isOpen={ConfigSecretDialog.isOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flow column" nextLabel={<Trans>Update</Trans>} next={this.updateSecret}>
            {
              !this.isTektonConfig ?
                <div className="secret-userNotVisible">
                  {isClusterAdmin && className == "OpsSecrets" ?
                    <div>
                      <SubTitle title={"UserNotVisible"} />
                      <Checkbox
                        theme="light"
                        value={this.userNotVisible}
                        onChange={(value: boolean) => this.userNotVisible = value}
                      />
                    </div> : null
                  }
                </div> : null
            }
            <div className="secret-name">
              <SubTitle title={"Secret name"} />
              <Input
                autoFocus required
                placeholder={_i18n._(t`Name`)}
                validators={systemName}
                value={name} onChange={v => this.name = v}
              />
            </div>

            <div className="flex auto gaps">
              <div className="secret-namespace">
                <SubTitle title={<Trans>Namespace</Trans>} />
                <NamespaceSelect
                  isDisabled={this.isTektonConfig}
                  themeName="light"
                  value={namespace}
                  onChange={({ value }) => this.namespace = value}
                />
              </div>

              <div className="secret-type">
                <SubTitle title={<Trans>Secret type</Trans>} />
                <Select
                  themeName="light"
                  options={this.types}
                  value={type} onChange={({ value }: SelectOption) => this.type = value}
                />
              </div>

            </div>
            {this.renderFields("annotations")}
            {this.renderFields("labels")}

            {!this.isTektonConfig ?
              this.type == SecretType.DockerConfigJson ? this.renderDockerConfigFields() : this.renderFields("data") : null}
            {this.isTektonConfig ? this.renderData("data") : null}

          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}
