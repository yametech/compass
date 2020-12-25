import "./task-run-logs-dialog.scss";

import * as React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { _i18n } from "../../i18n";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { IPodContainer, Pod, podsApi, TaskRun } from "../../api/endpoints";
import { Icon } from "../icon";
import { Select, SelectOption } from "../select";
import { Spinner } from "../spinner";
import { cssNames, downloadFile, interval } from "../../utils";
import { taskRunStore } from "./taskrun.store";
import { configStore } from "../../../client/config.store";

interface Props extends Partial<DialogProps> { }

@observer
export class TaskRunLogsDialog extends React.Component<Props> {
  @observable static isOpen = false;
  @observable static taskRunName: string;
  @observable static ns: string;
  static open(taskRunName: string, namespace: string) {
    TaskRunLogsDialog.taskRunName = taskRunName || "";
    TaskRunLogsDialog.ns = namespace;
    TaskRunLogsDialog.isOpen = true;
  }

  static close() {
    TaskRunLogsDialog.isOpen = false;
  }

  private logsArea: HTMLDivElement;
  private refresher = interval(5, () => this.load());
  private containers: string[] = [];
  private podName: string = "";
  private lastLineIsShown = true; // used for proper auto-scroll content after refresh

  @observable logs = ""; // latest downloaded logs for pod
  @observable newLogs = ""; // new logs since dialog is open
  @observable logsReady = false;
  @observable selectedContainerName: string;
  @observable showTimestamps = true;
  @observable tailLines = 1000;
  @observable finalLog = "";

  lineOptions = [
    { label: _i18n._(t`All logs`), value: Number.MAX_SAFE_INTEGER },
    { label: 1000, value: 1000 },
    { label: 10000, value: 10000 },
    { label: 100000, value: 100000 },
  ];

  onOpen = async () => {
    let taskRun = taskRunStore.getByName(TaskRunLogsDialog.taskRunName)
    this.selectedContainerName = taskRun.getContainerName()[0] || "";
    await this.load();
    this.refresher.start();
  };

  onClose = () => {
    this.resetLogs();
    this.refresher.stop();
  };

  close = () => {
    this.finalLog = "";
    TaskRunLogsDialog.close();
  };

  load = async () => {
    let taskRun = taskRunStore.getByName(TaskRunLogsDialog.taskRunName);
    this.podName = taskRun.getPodName();
    this.containers = taskRun.getContainerName();

    if (!this.podName) return;
    if (!this.containers) return;
    try {
      // if logs already loaded, check the latest timestamp for getting updates only from this point
      const logsTimestamps = this.getTimestamps(this.newLogs || this.logs);
      let lastLogDate = new Date(0);
      if (logsTimestamps) {
        lastLogDate = new Date(logsTimestamps.slice(-1)[0]);
        lastLogDate.setSeconds(lastLogDate.getSeconds() + 1); // avoid duplicates from last second
      }
      const namespace = TaskRunLogsDialog.ns;
      const name = this.podName;

      const logs = await podsApi.getLogs(
        { namespace, name },
        {
          container: this.selectedContainerName,
          timestamps: true,
          tailLines: this.tailLines ? this.tailLines : undefined,
          sinceTime: lastLogDate.toISOString(),
        }
      );
      if (!this.logs) {
        this.logs = logs;
      } else if (logs) {
        this.newLogs = `${this.newLogs}\n${logs}`.trim();
      }
    } catch (error) {
      this.logs = [
        _i18n._(t`Failed to load logs: ${error.message}`),
        _i18n._(t`Reason: ${error.reason} (${error.code})`),
      ].join("\n");
    }
    this.logsReady = true;
  };

  reload = async () => {
    this.resetLogs();
    this.refresher.stop();
    await this.load();
    this.refresher.start();
  };

  componentDidUpdate() {
    // scroll logs only when it's already in the end,
    // otherwise it can interrupt reading by jumping after loading new logs update
    if (this.logsArea && this.lastLineIsShown) {
      this.logsArea.scrollTop = this.logsArea.scrollHeight;
    }
  }

  onScroll = (evt: React.UIEvent<HTMLDivElement>) => {
    const logsArea = evt.currentTarget;
    const { scrollHeight, clientHeight, scrollTop } = logsArea;
    this.lastLineIsShown = clientHeight + scrollTop === scrollHeight;
  };

  getLogs() {
    const { logs, newLogs, showTimestamps } = this;
    return {
      logs: showTimestamps ? logs : this.removeTimestamps(logs),
      newLogs: showTimestamps ? newLogs : this.removeTimestamps(newLogs),
    };
  }

  getTimestamps(logs: string) {
    return logs.match(/^\d+\S+/gm);
  }

  removeTimestamps(logs: string) {
    return logs.replace(/^\d+.*?\s/gm, "");
  }

  resetLogs() {
    this.logs = "";
    this.newLogs = "";
    this.lastLineIsShown = true;
    this.logsReady = false;
  }

  onContainerChange = (option: SelectOption) => {
    this.selectedContainerName = this.containers.find(
      (containerName) => containerName === option.value
    );
    this.finalLog = "";
    this.reload();
  };

  onTailLineChange = (option: SelectOption) => {
    this.tailLines = option.value;
    this.reload();
  };

  formatOptionLabel = (option: SelectOption) => {
    const { value, label } = option;
    return (
      label || (
        <>
          <Icon small material="view_carousel" /> {value}
        </>
      )
    );
  };

  toggleTimestamps = () => {
    this.showTimestamps = !this.showTimestamps;
  };

  downloadLogs = () => {
    const { logs, newLogs } = this.getLogs();
    const fileName = this.selectedContainerName + ".log";
    const fileContents = logs + newLogs;
    downloadFile(fileName, fileContents, "text/plain");
  };

  get containerSelectOptions() {
    return [
      {
        label: _i18n._(t`Steps`),
        options: this.containers.map((container) => {
          return { value: container };
        }),
      },
    ];
  }

  renderControlsPanel() {
    const { logsReady, showTimestamps } = this;
    if (!logsReady) return;
    const timestamps = this.getTimestamps(this.logs + this.newLogs);
    let from = "";
    let to = "";
    if (timestamps) {
      from = new Date(timestamps[0]).toLocaleString();
      to = new Date(timestamps[timestamps.length - 1]).toLocaleString();
    }
    return (
      <div className="controls flex align-center">
        <div className="time-range">
          {timestamps && (
            <Trans>
              From <b>{from}</b> to <b>{to}</b>
            </Trans>
          )}
        </div>
        <div className="control-buttons flex gaps">
          <Icon
            material="av_timer"
            onClick={this.toggleTimestamps}
            className={cssNames("timestamps-icon", { active: showTimestamps })}
            tooltip={
              (showTimestamps ? _i18n._(t`Hide`) : _i18n._(t`Show`)) +
              " " +
              _i18n._(t`timestamps`)
            }
          />
          <Icon
            material="save_alt"
            onClick={this.downloadLogs}
            tooltip={_i18n._(t`Save`)}
          />
        </div>
      </div>
    );
  }

  renderLogs() {
    if (!this.logsReady) {
      return <Spinner center />;
    }
    const { logs, newLogs } = this.getLogs();

    if (!logs && !newLogs) {
      return (
        <p className="no-logs">
          <Trans>There are no logs available for container.</Trans>
        </p>
      );
    }
    return (
      <>
        <p className="taskrun-log-contant">{logs}</p>

        {newLogs && (
          <>
            <p
              className="new-logs-sep"
              title={_i18n._(t`New logs since opening the dialog`)}
            />
            {newLogs}
          </>
        )}
      </>
    );
  }

  render() {
    const { ...dialogProps } = this.props;
    const { selectedContainerName, tailLines } = this;
    const podName = this.podName ? this.podName : "";
    const header = (
      <h5>
        <Trans>{podName} Logs</Trans>
      </h5>
    );
    return (
      <Dialog
        {...dialogProps}
        isOpen={TaskRunLogsDialog.isOpen}
        className="PodLogsDialog"
        onOpen={this.onOpen}
        onClose={this.onClose}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep hideNextBtn prevLabel={<Trans>Close</Trans>}>
            <div className="log-controls flex gaps align-center justify-space-between">
              <div className="container flex gaps align-center">
                <span>
                  <Trans>Step</Trans>
                </span>
                {selectedContainerName && (
                  <Select
                    className="container-selector"
                    options={this.containerSelectOptions}
                    themeName="light"
                    value={{ value: selectedContainerName }}
                    onChange={this.onContainerChange}
                    formatOptionLabel={this.formatOptionLabel}
                    autoConvertOptions={false}
                  />
                )}
                <span>
                  <Trans>Lines</Trans>
                </span>
                <Select
                  value={tailLines}
                  options={this.lineOptions}
                  onChange={this.onTailLineChange}
                  themeName="light"
                />
              </div>
              {this.renderControlsPanel()}
            </div>
            <div
              className="taskrun-logs-area"
              onScroll={this.onScroll}
              ref={(e) => (this.logsArea = e)}
            >
              {this.renderLogs()}
            </div>
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
