// Client-side config
import { observable, when, action } from "mobx";
import { autobind, interval } from "./utils";
import { IConfig } from "../server/common/config";
import { IClientVars } from "../server/config";
import { configApi } from "./api/endpoints/config.api";

const {
  IS_PRODUCTION,
  API_PREFIX,
  LOCAL_SERVER_PORT,
  BUILD_VERSION,
} = (process.env as any) as IClientVars;

@autobind()
export class ConfigStore {
  readonly isDevelopment = !IS_PRODUCTION;
  readonly apiPrefix = API_PREFIX;
  readonly buildVersion = BUILD_VERSION;

  // auto-update config
  protected updater = interval(5, this.load);

  @observable config: Partial<IConfig> = {};
  @observable isLoaded = false;

  constructor() {
    this.updater.start();
  }

  load() {
    this.updater.start();
    return configApi.getConfig().then((config: any) => {
      this.config = config;
      this.isLoaded = true;
    });
  }

  async getToken() {
    await when(() => this.isLoaded);
    return this.config.token;
  }

  public getConfigToken(): string {
    return this.config.token;
  }

  get serverPort() {
    const port = location.port;
    return port ? `:${port}` : "";
  }

  get allowedNamespaces() {
    return this.config.allowedNamespaces || [];
  }

  get userName() {
    return this.config.userName;
  }

  get isClusterAdmin() {
    return this.config.isClusterAdmin;
  }

  public getDefaultNamespace(): string {
    return this.config.defaultNamespace != "" ? this.config.defaultNamespace : 'admin';
  }

  public getOpsNamespace(): string {
    return this.getDefaultNamespace() + "-" + "ops"
  }

  public getAllowedNamespaces() {
    return this.config.allowedNamespaces;
  }

  @action
  public setConfig(res: any) {
    this.config = res;
  }

  reset() {
    this.isLoaded = false;
    this.config = {};
  }
}
export const configStore = new ConfigStore();
