// Base class for all kubernetes objects

import moment from "moment";
import { KubeJsonApiData, KubeJsonApiDataList } from "./kube-json-api";
import { autobind, formatDuration } from "../utils";
import { ItemObject } from "../item.store";
import { apiKube } from "./index";
import { resourceApplierApi } from "./endpoints/resource-applier.api";

export type IKubeObjectConstructor<T extends KubeObject = any> = (new (
  data: KubeJsonApiData | any
) => T) & {
  kind?: string;
};

export interface IKubeObjectMetadata {
  uid: string;
  name: string;
  namespace?: string;
  creationTimestamp: string;
  resourceVersion: string;
  selfLink: string;
  deletionTimestamp?: string;
  finalizers?: string[];
  continue?: string; // provided when used "?limit=" query param to fetch objects list
  labels?: {
    [label: string]: string;
  };
  annotations?: {
    [annotation: string]: string;
  };
  ownerReferences?: OwnerReferences[];
}

export interface OwnerReferences {
  apiVersion: string;
  kind: string;
  name: string;
  uid: string;
  controller: boolean;
  blockOwnerDeletion: boolean;
}

export type IKubeMetaField = keyof KubeObject["metadata"];

@autobind()
export class KubeObject implements ItemObject {
  static readonly kind: string;

  static create(data: any) {
    return new KubeObject(data);
  }

  static isNonSystem(item: KubeJsonApiData | KubeObject) {
    return !item.metadata.name.startsWith("system:");
  }

  static isJsonApiData(object: any): object is KubeJsonApiData {
    return !object.items && object.metadata;
  }

  static isJsonApiDataList(object: any): object is KubeJsonApiDataList {
    return object.items && object.metadata;
  }

  static stringifyLabels(labels: { [name: string]: string }): string[] {
    if (!labels) return [];
    return Object.entries(labels).map(([name, value]) => `${name}=${value}`);
  }

  static mapperLablesOrAnnotations(data: string[]): Map<string, string> {
    let result = new Map<string, string>();
    if (data.length == 0) return result;
    data.map((item) => {
      const slice = item.split("=");
      result.set(slice[0], slice[1]);
    });
    return result;
  }

  constructor(data: KubeJsonApiData) {
    Object.assign(this, data);
  }

  apiVersion: string;
  kind: string;
  metadata: IKubeObjectMetadata;

  get selfLink() {
    return this.metadata.selfLink;
  }

  getId() {
    return this.metadata.uid;
  }

  getResourceVersion() {
    return this.metadata.resourceVersion;
  }

  getName() {
    return this.metadata.name;
  }

  getNs() {
    return this.metadata.namespace || undefined;
  }

  getCreationTime() {
    return this.metadata.creationTimestamp;
  }

  // todo: refactor with named arguments
  getAge(humanize = true, compact = true, fromNow = false) {
    if (fromNow) {
      return moment(this.metadata.creationTimestamp).fromNow();
    }
    const diff =
      new Date().getTime() -
      new Date(this.metadata.creationTimestamp).getTime();
    if (humanize) {
      return formatDuration(diff, compact);
    }
    return diff;
  }

  getFinalizers(): string[] {
    return this.metadata.finalizers || [];
  }

  getLabel(key: string): string {
    return KubeObject.mapperLablesOrAnnotations(this.getLabels()).get(key) || ""
  }

  getLabels(): string[] {
    return KubeObject.stringifyLabels(this.metadata.labels);
  }

  copyLabels(): { [k: string]: string } {
    return Object.fromEntries(
      KubeObject.mapperLablesOrAnnotations(this.getLabels())
    );
  }

  copyAnnotations(): { [k: string]: string } {
    return Object.fromEntries(
      KubeObject.mapperLablesOrAnnotations(this.getAnnotations())
    );
  }

  addLabel(key: string, value: string) {
    this.metadata.labels = Object.fromEntries(
      KubeObject.mapperLablesOrAnnotations(this.getLabels()).set(key, value)
    );
  }

  removeLable(key: string) {
    let result = KubeObject.mapperLablesOrAnnotations(this.getLabels());
    result.delete(key);
    this.metadata.labels = Object.fromEntries(result);
  }

  getValueFromLabels(key: string): string {
    return (
      KubeObject.mapperLablesOrAnnotations(this.getLabels()).get(key) || ""
    );
  }

  getAnnotations(): string[] {
    const annotations = KubeObject.stringifyLabels(this.metadata.annotations);
    return annotations.filter((annotation) => {
      const skip = resourceApplierApi.annotations.some((key) =>
        annotation.startsWith(key)
      );
      return !skip;
    });
  }

  getAnnotation(key: string): string {
    return KubeObject.mapperLablesOrAnnotations(this.getAnnotations()).get(key) || ""
  }


  addOwnerReferences(ownerReferences: OwnerReferences[]) {
    if (ownerReferences !== undefined) {
      Object.assign((this.metadata.ownerReferences = []), ownerReferences);
    }
  }

  addAnnotation(key: string, value: string) {
    this.metadata.annotations = Object.fromEntries(
      KubeObject.mapperLablesOrAnnotations(this.getLabels()).set(key, value)
    );
  }

  removeAnnotation(key: string) {
    let result = KubeObject.mapperLablesOrAnnotations(this.getAnnotations());
    result.delete(key);
    this.metadata.annotations = Object.fromEntries(result);
  }

  getValueFromAnnotations(key: string): string {
    return (
      KubeObject.mapperLablesOrAnnotations(this.getAnnotations()).get(key) || ""
    );
  }

  getSearchFields() {
    const { getName, getId, getNs, getAnnotations, getLabels } = this;
    return [getName(), getNs(), getId(), ...getLabels(), ...getAnnotations()];
  }

  toPlainObject(): object {
    return JSON.parse(JSON.stringify(this));
  }

  // use unified resource-applier api for updating all k8s objects
  async update<T extends KubeObject>(data: Partial<T>) {
    return resourceApplierApi.update<T>({
      ...this.toPlainObject(),
      ...data,
    });
  }

  delete() {
    return apiKube.del(this.selfLink);
  }
}
