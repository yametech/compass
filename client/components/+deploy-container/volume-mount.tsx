import {ActionMeta} from "react-select/src/types";
import {observer} from "mobx-react";
import React from "react";
import {Icon} from "../icon";
import {_i18n} from "../../i18n";
import {t, Trans} from "@lingui/macro";
import {Input} from "../input";
import {computed, observable} from "mobx";
import { NamespaceSelect } from "../+namespaces/namespace-select";
import { ConfigMapsSelect } from "../+config-maps/config-maps-select";
import { ConfigMapsKeySelect } from "../+config-maps/config-maps-key-select";
import { SecretKeySelect } from "../+config-secrets/secret-key-select";
import { SecretsSelect } from "../+config-secrets/secrets-select";
import {VolumeMounts, volumeMount, volumeMounts} from "./common";
import {Grid,Paper} from "@material-ui/core";
import {stopPropagation} from "../../utils";
import {SubTitle} from "../layout/sub-title";
import { Select } from "../select";

interface ArgsProps<T = any> extends Partial<ArgsProps> {
  value?: T;
  themeName?: "dark" | "light" | "outlined";

  onChange?(value: T, meta?: ActionMeta<any>): void;
}

@observer
export class VolumeMountDetails extends React.Component<ArgsProps> {

  // @observable value: VolumeMounts = this.props.value || volumeMounts;
  @observable namespace: string = "";
  @computed get value(): VolumeMounts {
    return this.props.value || volumeMounts;
  }

  get selectOptions() {
    return [
      "VolumeClaim",
      "ConfigMaps",
      "Secrets"
    ]
  }

  add = () => {
    this.value.items.push(volumeMount);
  }

  remove = (index: number) => {
    this.value.items.splice(index, 1);
  }

  VolumeClaimForm = (index: number) => {
    return (
      <Grid container spacing={2} alignItems={"center"} direction={"row"} zeroMinWidth>
        <Grid item xs={12} direction={"row"} zeroMinWidth>
          <Grid container spacing={5} direction={"row"} zeroMinWidth>
            <Grid item xs zeroMinWidth>
              <SubTitle title={<Trans>MountPath</Trans>}/>
              <Input
                required={true}
                placeholder={_i18n._(t`eg: /data`)}
                value={this.value.items[index].mountConfig.mountPath}
                onChange={
                  value => this.value.items[index].mountConfig.mountPath = value
                }
              />
            </Grid>
            <Grid item xs zeroMinWidth>
            <SubTitle title={<Trans>Name</Trans>}/>
              <Input
                required={true}
                placeholder={_i18n._(t`eg: volumeClaims name`)}
                value={this.value.items[index].mountConfig.name}
                onChange={value => this.value.items[index].mountConfig.name = value}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }

  ConfigMapsForm = (index: number) => {
    return (
      <Grid container spacing={2} alignItems={"center"} direction={"row"} zeroMinWidth>
        <Grid item xs={12} direction={"row"} zeroMinWidth>
          <Grid container spacing={5} alignItems="center" direction="row">
            <Grid item xs zeroMinWidth>
              <SubTitle title={<Trans>MountPath</Trans>}/>
              <Input
                required={true}
                placeholder={_i18n._(t`eg: /data`)}
                value={this.value.items[index].mountConfig.mountPath}
                onChange={
                  value => this.value.items[index].mountConfig.mountPath = value
                }
              />
            </Grid>
            <Grid item xs zeroMinWidth>
              <SubTitle title={<Trans>ConfigMap Namespace</Trans>}/>
              <NamespaceSelect
                required autoFocus
                value={this.namespace}
                onChange={value => this.namespace = value.value}
              />
            </Grid>
          </Grid>
          <Grid container spacing={5} alignItems="center" direction="row">
            <Grid item xs zeroMinWidth>
              <SubTitle title={<Trans>ConfigMap Name</Trans>}/>
              <ConfigMapsSelect
                required autoFocus
                value={this.value.items[index].mountConfig.configName}
                namespace={this.namespace}
                onChange={value => this.value.items[index].mountConfig.configName = value.value}
              />
            </Grid>
            <Grid item xs zeroMinWidth>
              <SubTitle title={<Trans>ConfigMap Key</Trans>}/>
              <ConfigMapsKeySelect
                required autoFocus
                value={this.value.items[index].mountConfig.configKey}
                name={this.value.items[index].mountConfig.configName}
                onChange={value => this.value.items[index].mountConfig.configKey = value.value}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }

  SecretsForm = (index: number) => {
    return (
      <Grid container spacing={2} alignItems={"center"} direction={"row"} zeroMinWidth>
        <Grid item xs={12} direction={"row"} zeroMinWidth>
          <Grid container spacing={5} alignItems="center" direction="row">
            <Grid item xs zeroMinWidth>
              <SubTitle title={<Trans>MountPath</Trans>}/>
              <Input
                required={true}
                placeholder={_i18n._(t`eg: /data`)}
                value={this.value.items[index].mountConfig.mountPath}
                onChange={
                  value => this.value.items[index].mountConfig.mountPath = value
                }
              />
            </Grid>
            <Grid item xs zeroMinWidth>
              <SubTitle title={<Trans>Secret Namespace</Trans>}/>
              <NamespaceSelect
                required autoFocus
                value={this.namespace}
                onChange={value => this.namespace = value.value}
              />
            </Grid>
          </Grid>
          <Grid container spacing={5} alignItems="center" direction="row">
            <Grid item xs zeroMinWidth>
              <SubTitle title={<Trans>Secret Name</Trans>}/>
              <SecretsSelect
                required autoFocus
                value={this.value.items[index].mountConfig.secretName}
                namespace={this.namespace}
                onChange={value => this.value.items[index].mountConfig.secretName = value.value}
              />
            </Grid>
            <Grid item xs zeroMinWidth>
              <SubTitle title={<Trans>Secret Key</Trans>}/>
              <SecretKeySelect
                required autoFocus
                value={this.value.items[index].mountConfig.secretKey}
                name={this.value.items[index].mountConfig.secretName}
                onChange={value => this.value.items[index].mountConfig.secretKey = value.value}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }

  rVolumeMounts(index: number) {
    return (
      <>
        {index !==0 && <br/>}
        <Paper elevation={3} style={{padding: 25}}>
          <Grid container spacing={2} alignItems={"center"} direction={"row"} zeroMinWidth>
            <Grid item xs={11} direction={"row"} zeroMinWidth>
              <Grid container spacing={1} direction={"row"} zeroMinWidth>
              <SubTitle title={<Trans>VolumeMounts Type</Trans>}/>
                <Select
                  options={this.selectOptions}
                  value={this.value.items[index].mountType}
                  onChange={v => {
                    this.value.items[index].mountType = v.value
                  }}
                />
                <br/>
                <br/>
                <br/>
                {this.value.items[index].mountType === 'VolumeClaim' && this.VolumeClaimForm(index)}
                {this.value.items[index].mountType === 'ConfigMaps' && this.ConfigMapsForm(index)}
                {this.value.items[index].mountType === 'Secrets' && this.SecretsForm(index)}
              </Grid>
            </Grid>
            <Grid item xs zeroMinWidth>
              <Icon
                small
                tooltip={<Trans>Remove VolumeMounts</Trans>}
                className="remove-icon"
                material="clear"
                ripple="secondary"
                onClick={(event) => {
                  this.remove(index);
                  stopPropagation(event)
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </>
    )
  }

  render() {
    return (
      <>
        <SubTitle title={
          <>
            <Trans>VolumeMounts</Trans>
            &nbsp;&nbsp;
            <Icon material={"add_circle"} className={"add_circle"} onClick={event => {
              this.add();
              stopPropagation(event)
            }} />
          </>
        }/>
        {this.value.items.map((item: any, index: number) => {
          return this.rVolumeMounts(index)
        })}
      </>
    )
  }
}