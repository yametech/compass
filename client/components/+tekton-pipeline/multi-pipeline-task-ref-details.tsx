import { observer } from "mobx-react";
import React from "react";
import {computed} from "mobx";
import { ActionMeta } from "react-select/src/types";
import { Collapse } from "../collapse";
import { PipelineTask } from "../../api/endpoints";
import { PipelineTaskDetail, pipelineTask } from "./pipeline-task";
import { Trans } from "@lingui/macro";
import {Icon} from "../icon";

interface Props<T = any> extends Partial<Props> {
  value?: T;
  themeName?: "dark" | "light" | "outlined";
  namespace?: string;
  disable?: boolean;

  onChange?(value: T, meta?: ActionMeta<any>): void;
}

@observer
export class MultiPipelineTaskStepDetails extends React.Component<Props> {
  static defaultProps = {
    disable: true,
    namespace: "",
  }

  // @observable value: PipelineTask[] = this.props.value || [];
  @computed get value(): PipelineTask[] {
    return this.props.value || [];
  }

  add() {
    this.value.push(pipelineTask);
  }

  remove = (index: number) => {
    this.value.splice(index, 1);
  };

  render() {
    const { disable, namespace } = this.props;

    const genExtra = (index: number) => {
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
        );
      }
      return null;
    };

    return (
      <>
        {this.value.length > 0 ? (
          this.value.map((item, index) => {
            return (
              <Collapse
                panelName={<Trans>Task</Trans>}
                extraExpand={!disable ? genExtra(index) : null}
              >
                <PipelineTaskDetail
                  disable={disable}
                  value={this.value[index]}
                  namespace={namespace}
                  onChange={(value) => (this.value[index] = value)}
                />
              </Collapse>
            );
          })
        ) : null
        }
      </>
    );
  }
}
