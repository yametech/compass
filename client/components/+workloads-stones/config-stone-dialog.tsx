import "./config-stone-dialog.scss";

import React from "react";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { observable } from "mobx";
import { Stone } from "../../api/endpoints";
import { Wizard, WizardStep } from "../wizard";
import { t, Trans } from "@lingui/macro";
import { SubTitle } from "../layout/sub-title";
import { _i18n } from "../../i18n";
import { Notifications } from "../notifications";
import { Select } from "../select";
import { stoneStore } from "./stones.store";
import { Input } from "../input";
import { isNumber } from "../input/input.validators";
import { apiManager } from "../../../client/api/api-manager";

interface Props extends Partial<DialogProps> {
}

interface Coordinate {
  group: string
  replicas: number
  zoneset: {
    rack: string
    host: string
  }[]
}

@observer
export class ConfigStoneDialog extends React.Component<Props> {

  @observable static isOpen = false;
  @observable static data: Stone = null;
  @observable strategy: string = "";
  @observable containers: any[] = [];
  @observable coordinates: Coordinate[] = [];

  static open(object: Stone) {
    ConfigStoneDialog.isOpen = true;
    ConfigStoneDialog.data = object;
  }

  static close() {
    ConfigStoneDialog.isOpen = false;
  }

  close = () => {
    ConfigStoneDialog.close();
  }

  updateStone = async () => {

    this.stone.spec.strategy = this.strategy;
    this.stone.spec.coordinates = this.coordinates;
    this.stone.spec.template.spec.containers = this.containers;
    await apiManager.getApi(this.stone.selfLink).update(
      { name: this.stone.getName(), namespace: this.stone.getNs() }, { ...this.stone }
    ).then(() => {
      Notifications.ok(
        <>Stone {this.stone.getName()} save succeeded</>
      );
    }).catch((err) => {
      Notifications.error(<>Stone {this.stone.getName()} save error: {err}</>);
    }).finally(() => {
      this.close();
    })
  }

  get options() {
    return [
      "Alpha",
      "Beta",
      "Omega",
      "Release"
    ]
  }

  get stone(): Stone {
    return ConfigStoneDialog.data
  }

  onOpen = async () => {
    try {
      this.strategy = this.stone.spec.strategy;
    } catch (e) {
      this.strategy = "";
    }

    try {
      this.coordinates = this.stone.spec.coordinates
    } catch (e) {
      this.coordinates = [];
    }

    try {
      this.containers = this.stone.spec.template.spec.containers
    } catch (e) {
      this.containers = [];
    }
  }

  render() {
    const { ...dialogProps } = this.props;
    const header = <h5><Trans>Update Stone</Trans></h5>;
    return (
      <Dialog
        {...dialogProps}
        className="ConfigStoneDialog"
        isOpen={ConfigStoneDialog.isOpen}
        onOpen={this.onOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flow column" nextLabel={<Trans>Config Stone</Trans>} next={this.updateStone}>
            <SubTitle title={<Trans>Strategy</Trans>} />
            <Select
              value={this.strategy}
              options={this.options}
              themeName="light"
              className="box grow"
              onChange={value => this.strategy = value.value}
            />
            <br />
            {this?.containers?.map((item, index) => {
              return (
                <>
                  <SubTitle title={_i18n._(t`Image`) + '-' + index} />
                  <Input
                    required={true}
                    placeholder={_i18n._(t`Request Images`)}
                    value={this.containers[index].image}
                    onChange={value => this.containers[index].image = value}
                  />
                </>
              )
            })}

            <br />
            {this?.coordinates?.map((item, index) => {
              return (
                <>
                  <SubTitle title={_i18n._(t`Group`) + '-' + this.coordinates[index].group} />
                  <Input
                    required={true}
                    placeholder={_i18n._(t`Request Replicas`)}
                    type="number"
                    validators={isNumber}
                    min={0}
                    value={String(this.coordinates[index].replicas)}
                    onChange={value => this.coordinates[index].replicas = Number(value)}
                  />
                </>
              )
            })}
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}