import React from "react";
import {Link} from "react-router-dom";
import {autorun, observable} from "mobx";
import {disposeOnUnmount, observer} from "mobx-react";
import {PipelineRun, TaskRun, taskRunApi} from "../../api/endpoints";
import {getDetailsUrl} from "../../navigation";

interface Props {
  pipelineRun: PipelineRun;
}

@observer
export class PipelineRunDetailsTaskRun extends React.Component<Props> {
  @observable taskRuns: TaskRun[] = [];

  @disposeOnUnmount
  taskRunLoader = autorun(async () => {
    const {pipelineRun} = this.props;
    this.taskRuns = await Promise.all(
      pipelineRun.getTaskRunName().map(taskRunName => taskRunApi.get({
        name: taskRunName,
        namespace: pipelineRun.getNs(),
      }))
    );
  });

  render() {
    return (
      <div className="PipelineRunDetailsTaskRun">
        {
          this.taskRuns.map((taskRun, index) => {
            return (
              <p key={`${taskRun.getId()}${index}`}>
                <Link key={`${taskRun.getId()}${index}`} to={getDetailsUrl(taskRun.selfLink)}>
                  {taskRun.getName()}
                </Link>
              </p>
            );
          })
        }
      </div>
    );
  }
}