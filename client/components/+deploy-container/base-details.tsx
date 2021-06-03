import { observer } from "mobx-react";
import React from "react";
import { computed, observable } from "mobx";
import { Select } from "../select";
import { SubTitle } from "../layout/sub-title";
import { Input } from "../input";
import { _i18n } from "../../i18n";
import { isNumber } from "../input/input.validators";
import { ActionMeta } from "react-select/src/types";
import { base, Base } from "./common";
import { SecretsSelect } from "../+config-secrets/secrets-select";
import { NamespaceSelect } from "../+namespaces/namespace-select";
import { t, Trans } from "@lingui/macro";
import { Grid } from "@material-ui/core";

interface Props<T = any> extends Partial<Props> {
  value?: T;

  themeName?: "dark" | "light" | "outlined";
  divider?: true;

  onChange?(value: T, meta?: ActionMeta<any>): void;
}

@observer
export class BaseDetails extends React.Component<Props> {

  // @observable value: Base = this.props.value || base;
  @observable namespace: string = '';
  @computed get value(): Base {
    return this.props.value || base;
  }


  get selectOptions() {
    return [
      "IfNotPresent",
      "Always",
      "Never",
    ];
  }

  get selectImageAddressOptions() {
    return [
      "public",
      "private",
    ]
  }

  rImageFrom() {
    return (
      <>
        {this.value.imageFrom ?
          <>
            <SubTitle title={<Trans>Image Address</Trans>} />
            <Input
              required={true}
              placeholder={_i18n._(t`Image Address`)}
              value={this.value.image}
              onChange={v => this.value.image = v}
            />
          </> : null}
        {this.value.imageFrom == "private" ?
          <>
            <br />
            <Grid container spacing={5} alignItems="center" direction="row">
              <Grid item xs zeroMinWidth>
                <SubTitle title={<Trans>Private Secret Namespace</Trans>} />
                <NamespaceSelect
                  placeholder={_i18n._(t`Secret Namespace`)}
                  themeName="light"
                  className="box grow"
                  value={this.value.imagePullSecretNamespace}
                  onChange={(value) => {
                    this.value.imagePullSecretNamespace = value.value
                  }}
                />
              </Grid>
              {this.value.imagePullSecretNamespace ?
                <Grid item xs zeroMinWidth>
                  <SubTitle title={<Trans>Private Secret</Trans>} />
                  <SecretsSelect
                    required autoFocus
                    value={this.value.imagePullSecret}
                    namespace={this.value.imagePullSecretNamespace}
                    onChange={value => this.value.imagePullSecret = value.value}
                  />
                </Grid> : null
              }
            </Grid>
          </> : null}
      </>
    )
  }

  rLimit() {
    return (
      <>
        <br />
        <Grid container spacing={5} alignItems="center" direction="row">
          <Grid item xs zeroMinWidth>
            <SubTitle title={<Trans>Limit CPU</Trans>} />
            <Input
              required={true}
              placeholder={_i18n._(t`Limit CPU`)}
              type="number"
              validators={isNumber}
              value={this.value.resource.limits.cpu}
              onChange={value => this.value.resource.limits.cpu = value}
            />
          </Grid>
          <Grid item xs zeroMinWidth>
            <SubTitle title={<Trans>Limit Memory</Trans>} />
            <Input
              required={true}
              placeholder={_i18n._(t`Limit Memory`)}
              type="number"
              validators={isNumber}
              value={this.value.resource.limits.memory}
              onChange={value => this.value.resource.limits.memory = value}
            />
          </Grid>
        </Grid>
      </>
    )
  }

  rRequired() {
    return (
      <>
        <br />
        <Grid container spacing={5} alignItems="center" direction="row">
          <Grid item xs zeroMinWidth>
            <SubTitle title={<Trans>Required CPU</Trans>} />
            <Input
              required={true}
              placeholder={_i18n._(t`Required CPU`)}
              type="number"
              validators={isNumber}
              value={this.value.resource.requests.cpu}
              onChange={value => this.value.resource.requests.cpu = value}
            />
          </Grid>
          <Grid item xs zeroMinWidth>
            <SubTitle title={<Trans>Required Memory</Trans>} />
            <Input
              required={true}
              placeholder={_i18n._(t`Require Memory`)}
              type="number"
              validators={isNumber}
              value={this.value.resource.requests.memory}
              onChange={value => this.value.resource.requests.memory = value}
            />
          </Grid>
        </Grid>
      </>
    )
  }

  render() {

    return (
      <div>
        <SubTitle title={<Trans>Container Name</Trans>} />
        <Input
          required={true}
          placeholder={_i18n._(t`Container Name`)}
          value={this.value.name}
          onChange={v => this.value.name = v}
        />
        <br />
        <Grid
          container
          spacing={5}
          alignItems={"center"}
          direction={"row"}
        >
          <Grid item xs zeroMinWidth>
            <SubTitle title={<Trans>Image From</Trans>} />
            <Select
              themeName={"light"}
              options={this.selectImageAddressOptions}
              value={this.value.imageFrom}
              onChange={v => {
                this.value.imageFrom = v.value;
              }}
            />
          </Grid>
          <Grid item xs zeroMinWidth>
            <SubTitle title={<Trans>Image Pull Policy</Trans>} />
            <Select
              required={true}
              options={this.selectOptions}
              value={this.value.imagePullPolicy}
              onChange={value => this.value.imagePullPolicy = value.value}
            />
          </Grid>
        </Grid>
        {this.value.imageFrom != "" ? this.rImageFrom() : null}
        {this.rLimit()}
        {this.rRequired()}
      </div>
    )
  }
}