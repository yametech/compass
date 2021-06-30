import { t, Trans } from "@lingui/macro";
import { Grid, Paper } from "@material-ui/core";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { ActionMeta } from "react-select/src/types";
import { ConfigMapsKeySelect } from "../+config-maps/config-maps-key-select";
import { ConfigMapsSelect } from "../+config-maps/config-maps-select";
import { SecretKeySelect } from "../+config-secrets/secret-key-select";
import { SecretsSelect } from "../+config-secrets/secrets-select";
import { NamespaceSelect } from "../+namespaces/namespace-select";
import { _i18n } from "../../i18n";
import { stopPropagation } from "../../utils";
import { Icon } from "../icon";
import { Input } from "../input";
import { SubTitle } from "../layout/sub-title";
import { Select } from "../select";
import { environment, Environment } from "./common";

interface Props<T = any> extends Partial<Props> {
  value?: T;
  themeName?: "dark" | "light" | "outlined";

  onChange?(value: T, meta?: ActionMeta<any>): void;
}

@observer
export class EnvironmentDetails extends React.Component<Props> {

  // @observable value: Environment[] = this.props.value || environment;
  @observable namespace: string = "";

  @computed get value(): Environment[] {
    return this.props.value || environment;
  }

  get selectOptions() {
    return [
      // "Custom",
      "Normal",
      // "ConfigMaps",
      // "Secrets",
      // "Other"
    ]
  }

  add = () => {
    this.value.push({
      type: "Normal",
      envConfig: {}
    });
  }

  remove = (index: number) => {
    this.value.splice(index, 1);
  }

  rCustom(index: number) {
    return (
      <>
        <SubTitle title={<Trans>Environment</Trans>}/>
        <Input
          required={true}
          placeholder={_i18n._(t`Environment`)}
          value={this.value[index].envConfig.name}
          onChange={value => this.value[index].envConfig.name = value}
        />
        <SubTitle title={<Trans>Value</Trans>}/>
        <Input
          required={true}
          placeholder={_i18n._(t`Value`)}
          value={this.value[index].envConfig.value}
          onChange={value => this.value[index].envConfig.value = value}
        />
      </>
    )
  }

  rConfigMaps(index: number) {
    return (
      <div>
        <SubTitle title={<Trans>Environment</Trans>}/>
        <Input
          required={true}
          placeholder={_i18n._(t`Environment`)}
          value={this.value[index].envConfig.name}
          onChange={value => this.value[index].envConfig.name = value}
        />
        <br/>
        <Grid container spacing={5} alignItems="center" direction="row">
          <Grid item xs zeroMinWidth>
            <SubTitle title={<Trans>ConfigMap Namespace</Trans>}/>
            <NamespaceSelect
              required autoFocus
              value={this.namespace}
              onChange={value => this.namespace = value.value}
            />
          </Grid>
          <Grid item xs zeroMinWidth>
            <SubTitle title={<Trans>ConfigMap Name</Trans>}/>
            <ConfigMapsSelect
              required autoFocus
              value={this.value[index].envConfig.configName}
              namespace={this.namespace}
              onChange={value => this.value[index].envConfig.configName = value.value}
            />
          </Grid>
        </Grid>
        <SubTitle title={<Trans>ConfigMap Key</Trans>}/>
        <ConfigMapsKeySelect
          required autoFocus
          value={this.value[index].envConfig.configKey}
          name={this.value[index].envConfig.configName}
          onChange={value => this.value[index].envConfig.configKey = value.value}
        />
      </div>
    )
  }

  rSecrets(index: number) {
    return (
      <div>
        <SubTitle title={<Trans>Environment</Trans>}/>
        <Input
          required={true}
          placeholder={_i18n._(t`Environment`)}
          value={this.value[index].envConfig.name}
          onChange={value => this.value[index].envConfig.name = value}
        />
        <br/>
        <Grid container spacing={5} alignItems="center" direction="row">
          <Grid item xs zeroMinWidth>
            <SubTitle title={<Trans>Secret Namespace</Trans>}/>
            <NamespaceSelect
              required autoFocus
              value={this.namespace}
              onChange={value => this.namespace = value.value}
            />
          </Grid>
          <Grid item xs zeroMinWidth>
            <SubTitle title={<Trans>Secret Name</Trans>}/>
            <SecretsSelect
              required autoFocus
              value={this.value[index].envConfig.secretName}
              namespace={this.namespace}
              onChange={value => this.value[index].envConfig.secretName = value.value}
            />
          </Grid>
        </Grid>
        <SubTitle title={<Trans>Secret Key</Trans>}/>
        <SecretKeySelect
          required autoFocus
          value={this.value[index].envConfig.secretKey}
          name={this.value[index].envConfig.secretName}
          onChange={value => this.value[index].envConfig.secretKey = value.value}
        />
      </div>
    )
  }

  rOther(index: number) {
    return (
      <div>
        <SubTitle title={<Trans>Command</Trans>}/>
        <Input
          required={true}
          placeholder={_i18n._(t`Command`)}
          multiLine={true}
          maxRows={5}
          value={this.value[index].envConfig.enterCommand}
          onChange={value => this.value[index].envConfig.enterCommand = value}
        />
      </div>
    )
  }

  rNormal(index: number) {
    return (
      <>
        <Grid container spacing={2} alignItems={"center"} direction={"row"} zeroMinWidth>
          <Grid item xs={12} direction={"row"} zeroMinWidth>
            <Grid container spacing={5} direction={"row"} zeroMinWidth>
              <Grid item xs zeroMinWidth>
                <Input
                  className="item"
                  placeholder={_i18n._(t`Name`)}
                  title={this.value[index].envConfig.name}
                  value={this.value[index].envConfig.name}
                  onChange={(value) => {
                    this.value[index].envConfig.name = value;
                  }}
                />
              </Grid>
              <Grid item xs zeroMinWidth>
                <Input
                  className="item"
                  placeholder={_i18n._(t`Value`)}
                  title={this.value[index].envConfig.value}
                  value={this.value[index].envConfig.value}
                  onChange={(value) => {
                    this.value[index].envConfig.value = value;
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          {/* <Grid item xs zeroMinWidth>
            <Icon
              small
              tooltip={_i18n._(t`Remove`)}
              className="remove-icon"
              material="clear"
              ripple="secondary"
              onClick={(event) => {
                this.remove(index);
                stopPropagation(event)
              }}
            />
          </Grid> */}
        </Grid>
      </>
    )
  }


  render() {
    return (
      <>
        <SubTitle
          title={
            <>
              <Trans>Environment</Trans>
              &nbsp;&nbsp;
              <Icon material={"add_circle"} className={"add_circle"} onClick={event => {
                stopPropagation(event);
                this.add()
              }} />
            </>
          }>
        </SubTitle>

        <div className="Environment">
          {this.value.map((item: any, index: number) => {
            return (
              <>
                <br/>
                <Paper elevation={3} style={{padding: 25}}>
                  <Grid container spacing={2} alignItems="center" direction="row" zeroMinWidth>
                    <Grid item xs={11} zeroMinWidth>
                      <div key={index}>
                        <SubTitle title={<Trans>Environment Type</Trans>}/>
                        <Select
                          options={this.selectOptions}
                          value={this.value[index].type}
                          onChange={v => {
                            this.value[index].type = v.value
                          }}
                        />
                        <br/>
                        {this.value[index].type == "Custom" ? this.rCustom(index) : null}
                        {this.value[index].type == "ConfigMaps" ? this.rConfigMaps(index) : null}
                        {this.value[index].type == "Secrets" ? this.rSecrets(index) : null}
                        {this.value[index].type == "Other" ? this.rOther(index) : null}
                        {this.value[index].type == "Normal" ? this.rNormal(index) : null}
                      </div>
                    </Grid>
                    <Grid item xs zeroMinWidth style={{textAlign: "center"}}>
                      <Icon
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
          })}
        </div>
      </>
    )
  }
}