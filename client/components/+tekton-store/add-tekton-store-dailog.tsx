import "./add-tekton-store-dailog.scss";

import { observer } from "mobx-react";
import React from "react";
import { Dialog, DialogProps } from "../dialog";
import { observable } from "mobx";
import { Wizard, WizardStep } from "../wizard";
import { t, Trans } from "@lingui/macro";
import { SubTitle } from "../layout/sub-title";
import { Input } from "../input";
import { _i18n } from "../../i18n";
import { Notifications } from "../notifications";
import { tektonStore } from "./taskstore.store";
import { tektonStoreNamespace } from "../+constant";
import store from "store";
import {
  tektonStoreApi,
  TektonStore,
  Task,
  Pipeline,
  PipelineTask,
  TaskRef,
} from "../../api/endpoints";
import { apiManager } from "../../../client/api/api-manager";

interface Props extends DialogProps { }

export interface PipelineEntity {
  pipelineData: string;
  taskData: string;
  graphData: string;
}

export enum ResourceType {
  Task = "task",
  Pipeline = "pipeline",
}


@observer
export class AddTektonStoreDialog extends React.Component<Props> {
  @observable static isOpen = false;
  @observable static tektonResourceType: string = "";
  @observable static data: string = "";
  @observable static author: string = "";
  @observable static storeName: string = "";
  @observable static forks: number = 0;
  @observable static paramsDescription = "";
  @observable static tektonStore: TektonStore

  static open(data: string = "", resourceType: string = "", tektonStore: TektonStore = null) {

    AddTektonStoreDialog.isOpen = true;
    if (tektonStore !== null) {
      AddTektonStoreDialog.data = tektonStore.getData();
      AddTektonStoreDialog.tektonResourceType = tektonStore.getType();
      this.storeName = tektonStore.getName();
      this.forks = tektonStore.getForks();
      this.paramsDescription = tektonStore.getParamsDescription();
    } else {
      this.data = data;
      this.tektonResourceType = resourceType;
    }

    const userConfig = store.get("u_config");
    this.author = userConfig ? userConfig.userName : "";

  }



  static close() {
    AddTektonStoreDialog.isOpen = false;
    this.data = "";
    this.tektonResourceType = "";
  }

  close = () => {
    AddTektonStoreDialog.tektonResourceType = "";
    AddTektonStoreDialog.data = "";
    AddTektonStoreDialog.author = "";
    AddTektonStoreDialog.close();
  };

  reset() {
    AddTektonStoreDialog.storeName = "";
    AddTektonStoreDialog.forks = 0;
    AddTektonStoreDialog.paramsDescription = "";
  }

  addTektonStore = async () => {
    try {
      const resourceType: string = AddTektonStoreDialog.tektonResourceType;
      const data: string = AddTektonStoreDialog.data;
      const author: string = AddTektonStoreDialog.author;
      const currentTaskStore = await tektonStore.getByName(AddTektonStoreDialog.storeName)
      if (currentTaskStore === undefined) {
        console.log(currentTaskStore)
        await tektonStoreApi.create(
          {
            name: AddTektonStoreDialog.storeName,
            namespace: tektonStoreNamespace,
          },
          {
            spec: {
              tektonResourceType: resourceType,
              data: data,
              author: author,
              forks: AddTektonStoreDialog.forks,
              paramsDescription: AddTektonStoreDialog.paramsDescription,
            },
          }
        );
      } else {
        currentTaskStore.spec.author = AddTektonStoreDialog.author;
        currentTaskStore.spec.forks = AddTektonStoreDialog.forks;
        currentTaskStore.spec.data = data;
        currentTaskStore.spec.tektonResourceType = resourceType;
        currentTaskStore.spec.paramsDescription = AddTektonStoreDialog.paramsDescription;
        await apiManager.getApi(currentTaskStore.selfLink).update(
          { name: currentTaskStore.getName(), namespace: currentTaskStore.getNs() },
          { ...currentTaskStore },
        )
      }

      Notifications.ok(<>Add TektonStore {name} succeeded</>);
      this.reset();
      this.close();
    } catch (err) {
      Notifications.error(err);
    }
  };

  render() {
    const header = (
      <h5>
        <Trans>Add Store</Trans>
      </h5>
    );

    return (
      <Dialog
        className="AddTektonStoreDialog"
        isOpen={AddTektonStoreDialog.isOpen}
        close={this.close}
        pinned
      >
        <Wizard
          className={"AddTektonStoreWizard"}
          header={header}
          done={this.close}
        >
          <WizardStep
            className={"AddTektonStoreWizardStep"}
            contentClass="flex gaps column"
            next={this.addTektonStore}
          >
            <SubTitle title={<Trans>Name</Trans>} />
            <Input
              placeholder={_i18n._(t`Name`)}
              value={AddTektonStoreDialog.storeName}
              onChange={(value) => (AddTektonStoreDialog.storeName = value)}
            />
            <SubTitle title={<Trans>Author</Trans>} />
            <Input
              placeholder={_i18n._(t`Author`)}
              disabled={true}
              value={AddTektonStoreDialog.author}
            />
            <SubTitle title={<Trans>Forks</Trans>} />
            <Input
              disabled={true}
              placeholder={_i18n._(t`Forks`)}
              value={AddTektonStoreDialog?.forks?.toString() ?? "0"}
              onChange={(value) => (AddTektonStoreDialog.forks = Number(value))}
            />
            <SubTitle title={<Trans>ParamsDescription</Trans>} />
            <Input
              multiLine={true}
              maxRows={10}
              placeholder={_i18n._(t`ParamsDescription`)}
              value={AddTektonStoreDialog.paramsDescription}
              onChange={(value) => (AddTektonStoreDialog.paramsDescription = value)}
            />
            {/* <SubTitle title={<Trans>Subreference</Trans>} />
            <Input
              placeholder={_i18n._(t`Subreference`)}
              value={this.subReference}
              onChange={(value) => (this.subReference = value)}
            /> */}
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
