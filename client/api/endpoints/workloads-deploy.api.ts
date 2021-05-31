import get from "lodash/get";
import { WorkloadKubeObject } from "../workload-kube-object";
import { autobind } from "../../utils";
import { KubeApi } from "../kube-api";
import moment from "moment";
import { advanceFormatDuration } from "../../utils";
import { apiWorkloads } from "../index";

@autobind()
export class Deploy extends WorkloadKubeObject {
  static kind = "Workloads";

  spec: {
    appName: string; // the app name
    resourceType: string;
    metadata: string; // the field record array container configuration
    service?: string;
    volumeClaims?: string;
  };

  status: {};

  getOwnerNamespace(): string {
    return get(this, "metadata.labels.namespace");
  }

  getAppName() {
    return get(this, "spec.appName");
  }

  getResourceType() {
    return get(this, "spec.resourceType");
  }

  getTagName() {
    return get(this, "metadata.labels.tagName") || '';
  }

  getGenerateTimestamp() {
    if (this.metadata && this.metadata.creationTimestamp) {
      return this.metadata.creationTimestamp;
    }
    return "";
  }

  getCreated(humanize = true, compact = true, fromNow = false) {
    if (fromNow) {
      return moment(this.metadata.creationTimestamp).fromNow();
    }
    const diff =
      new Date().getTime() -
      new Date(this.metadata.creationTimestamp).getTime();
    if (humanize) {
      return advanceFormatDuration(diff, compact);
    }
    return diff;
  }

  getObject() {
    return get(this, "spec.metadata");
  }

  setMetadata(metadata: string) {
    this.spec.metadata = metadata;
  }
}

export const deployApi = new KubeApi({
  kind: Deploy.kind,
  apiBase: "/apis/yamecloud.io/v1/workloads",
  isNamespaced: false,
  objectConstructor: Deploy,
  request: apiWorkloads,
});
