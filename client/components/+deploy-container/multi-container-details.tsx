import {ActionMeta} from "react-select/src/types";
import {observer} from "mobx-react";
import React from "react";
import {Button} from "../button";
import {Collapse} from "../collapse";
import {ContainerDetails} from "./container-details";
import {observable} from "mobx";
import {container, Container} from "./common";
import {Trans} from "@lingui/macro";
import {Icon} from "../icon";

interface Props<T = any> extends Partial<Props> {
  value?: T;
  themeName?: "dark" | "light" | "outlined";

  onChange?(value: T, meta?: ActionMeta<any>): void;

  base?: boolean;
  commands?: boolean;
  args?: boolean;
  environment?: boolean;
  readyProbe?: boolean;
  liveProbe?: boolean;
  lifeCycle?: boolean;
  divider?: true;
}

@observer
export class MultiContainerDetails extends React.Component<Props> {

  static defaultProps = {
    base: true,
    commands: true,
    args: true,
    environment: true,
    readyProbe: true,
    liveProbe: true,
    lifeCycle: true,
    divider: true,
    volumeClaims: true,
  }

  @observable static value: Container[] = [container];

  get value() {
    return this.props.value || [container];
  }

  add() {
    this.value.push(container);
  }

  remove(index: number) {
    this.value.splice(index, 1);
  }

  genExtra = (index: number) => {
    if (this.value.length > 1) {
      return (
        <Icon
          material={"delete_outline"}
          style={{color: '#ff4d4f'}}
          onClick={(event) => {
            this.remove(index);
            event.preventDefault();
            event.stopPropagation();
          }}
        />
      )
    }
    return null
  }

  rContainerDetails(index: number) {
    return (
      <Collapse key={`cDetails${index}`} panelName={<Trans>Container</Trans>} extraExpand={this.genExtra(index)}>
        <ContainerDetails
          args={true} base={true} commands={true} environment={true}
          liveProbe={true} lifeCycle={true} volumeMounts={true} readyProbe={true}
          value={this.value[index]}
          onChange={value => this.value[index] = value}
        />
      </Collapse>
    )
  }

  render() {
    return (
      <>
        <Button primary onClick={() => this.add()}>
          <Trans>Add Container</Trans>
        </Button>
        <br/>
        <br/>
        {this.value.map((item: any, index: number) =>  this.rContainerDetails(index))}
      </>
    )
  }
}