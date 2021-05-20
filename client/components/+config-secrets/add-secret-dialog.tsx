import "./add-secret-dialog.scss"

import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { _i18n } from "../../i18n";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Input } from "../input";
import { isUrl, systemName } from "../input/input.validators";
import { Secret, secretsApi, SecretType, tektonConfigApi } from "../../api/endpoints";
import { SubTitle } from "../layout/sub-title";
import { NamespaceSelect } from "../+namespaces/namespace-select";
import { Select, SelectOption } from "../select";
import { Icon } from "../icon";
import { IKubeObjectMetadata } from "../../api/kube-object";
import { base64 } from "../../utils";
import { Notifications } from "../notifications";
import upperFirst from "lodash/upperFirst";
import { Checkbox } from "../checkbox";
import { configStore } from "../../config.store";
import { namespaceStore } from "../+namespaces/namespace.store";

interface Props extends Partial<DialogProps> {
  className: string
}

interface DockerConfig {
  username: string,
  password: string,
  email?: string,
}

interface DockerConfigAuth {
  [params: string]: DockerConfig
}

interface ISecretTemplateField {
  key?: string;
  value?: string;
  required?: boolean;
  ".dockerconfigjson"?: string;
}

interface ISecretTemplate {
  [field: string]: ISecretTemplateField[];

  annotations?: ISecretTemplateField[];
  labels?: ISecretTemplateField[];
  data?: ISecretTemplateField[];
}

type ISecretField = keyof ISecretTemplate;

@observer
export class AddSecretDialog extends React.Component<Props> {

  static defaultProps = { className: "Secrets" }

  @observable static isOpen = false;
  @observable dockerConfigAddress: string = "";
  @observable dockerConfig: DockerConfig = { username: "", password: "", email: "" };
  @observable isOpsSecret = false;

  static open() {
    AddSecretDialog.isOpen = true;
  }

  static close() {
    AddSecretDialog.isOpen = false;
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
    if (this.isOpsSecret) {
      return Object.keys(this.opsSecretTemplate) as SecretType[];
    }
    return Object.keys(this.secretTemplate) as SecretType[];
  }

  @observable secret = this.secretTemplate;
  @observable name = "";
  @observable namespace = "";
  @observable type = SecretType.Opaque;
  @observable userNotVisible = false;

  reset = () => {
    this.name = "";
    this.secret = this.secretTemplate;
  }

  close = () => {
    AddSecretDialog.close();
    this.reset();
  }

  onOpen = async () => {

    const { className } = this.props;

    if (this.props.className == "TektonConfig") {
      this.isOpsSecret = true;
      this.type = SecretType.BasicAuth;
      this.secret = this.opsSecretTemplate;

      let ns = configStore.getDefaultNamespace();
      if (className == "TektonConfig") {
        ns = configStore.getOpsNamespace();
      }

      let iNamespace = namespaceStore.getByName(ns);
      if (iNamespace == undefined) {
        iNamespace = await namespaceStore.create({ name: configStore.getOpsNamespace() });
      }
      this.namespace = iNamespace.getName();
    }

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

  createSecret = async () => {
    const { name, namespace, type } = this;
    const { className } = this.props;
    const { data = [], annotations = [] } = this.secret[type];

    let labels = this.userNotVisible ? new Map<string, string>().set("hide", "1") : new Map<string, string>()
    if (className == "TektonConfig") {
      labels.set("tekton", "1")
    }

    const secret: Partial<Secret> = {
      type: type,
      data: this.getDataFromFields(data, val => val ? base64.encode(val) : ""),
      metadata: {
        name: name,
        namespace: namespace,
        annotations: this.getDataFromFields(annotations),
        labels: Object.fromEntries(labels),
      } as IKubeObjectMetadata
    }

    try {
      const api = className == "TektonConfig" ? tektonConfigApi : secretsApi;
      await api.create({ namespace, name }, secret);

      Notifications.ok(<>Secret {name} save succeeded</>);
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
            small
            tooltip={_i18n._(t`Add Field`)}
            material="edit"
            onClick={() => this.addField(field)}
          />
        </SubTitle>
        <div className="secret-fields">
          {fields.map((item, index) => {
            const { key = "", value = "", required } = item;
            return (
              <>
                <div key={index} className="secret-field flex gaps auto align-center">
                  <Input
                    className="key"
                    placeholder={_i18n._(t`Name`)}
                    title={key}
                    tabIndex={required ? -1 : 0}
                    readOnly={required}
                    value={key} onChange={v => item.key = v}
                  />
                  <Input
                    multiLine maxRows={5}
                    required={required}
                    className="value"
                    placeholder={_i18n._(t`Value`)}
                    value={value} onChange={v => item.value = v}
                  />
                  <Icon
                    small
                    // disabled={required}
                    tooltip={required ? <Trans>Required Field</Trans> : <Trans>Remove Field</Trans>}
                    className="remove-icon"
                    material="clear"
                    onClick={() => this.removeField(field, index)}
                  />
                </div>
                <br />
              </>
            )
          })}
        </div>
      </>
    )
  }

  renderDockerConfigFields() {
    return (
      <div>
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
            <div key={index} className="secret-field flex gaps auto align-center">
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
                multiLine maxRows={5}
                required={required}
                className="value"
                placeholder={_i18n._(t`Value`)}
                value={item.value} onChange={v => item.value = v}
              />
            </div>
          )
        })}
      </div>
    )
  }

  isOpsSecretOperator() {
    if (!this.isOpsSecret) {
      this.renderFields("data")
    }
  }

  render() {
    const { ...dialogProps } = this.props;
    const { namespace, name, type } = this;
    const { isClusterAdmin } = configStore;
    const header = <h5><Trans>Create Secret</Trans></h5>;
    return (
      <Dialog
        {...dialogProps}
        className="AddSecretDialog"
        isOpen={AddSecretDialog.isOpen}
        onOpen={this.onOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flow column" nextLabel={<Trans>Create</Trans>} next={this.createSecret}>
            {
              !this.isOpsSecret ?
                <div className="secret-userNotVisible">
                  {isClusterAdmin ?
                    <>
                      <SubTitle title={"UserNotVisible"} />
                      <Checkbox
                        theme="light"
                        value={this.userNotVisible}
                        onChange={(value: boolean) => this.userNotVisible = value}
                      />
                    </> : null
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
                  required={true}
                  isDisabled={this.isOpsSecret}
                  themeName="light"
                  value={namespace}
                  onChange={({ value }) => this.namespace = value}
                />
              </div>
              <div className="secret-type">
                <SubTitle title={<Trans>Secret type</Trans>} />
                <Select
                  required={true}
                  themeName="light"
                  options={this.types}
                  value={type} onChange={({ value }: SelectOption) => this.type = value}
                />
              </div>
            </div>
            {this.renderFields("annotations")}
            {this.renderFields("labels")}
            {!this.isOpsSecret ?
              this.type == SecretType.DockerConfigJson ? this.renderDockerConfigFields() : this.isOpsSecretOperator() : null}
            {this.isOpsSecret ? this.renderData("data") : null}
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}
