// Base http-service / json-api class
import store from 'store'
import { stringify } from "querystring";
import { EventEmitter } from "../utils/eventEmitter";
import { cancelableFetch } from "../utils/cancelableFetch";

export interface JsonApiData {
}

export interface JsonApiError {
  code?: number;
  message?: string;
  errors?: { id: string; title: string; status?: number }[];
}

export interface JsonApiParams<D = any> {
  query?: { [param: string]: string | number | any };
  data?: D; // request body
}

export interface JsonApiLog {
  method: string;
  reqUrl: string;
  reqInit: RequestInit;
  data?: any;
  error?: any;
}

export interface JsonApiConfig {
  apiPrefix: string;
  debug?: boolean;
}
export class JsonApi<D = JsonApiData, P extends JsonApiParams = JsonApiParams> {
  static reqInitDefault: RequestInit = {
    headers: {
      'content-type': 'application/json'
    }
  };

  static configDefault: Partial<JsonApiConfig> = {
    debug: false
  };

  constructor(protected config: JsonApiConfig, protected reqInit?: RequestInit) {
    this.config = Object.assign({}, JsonApi.configDefault, config);
    this.reqInit = Object.assign({}, JsonApi.reqInitDefault, reqInit);
    this.parseResponse = this.parseResponse.bind(this);
  }

  public onData = new EventEmitter<[D, Response]>();
  public onError = new EventEmitter<[JsonApiErrorParsed, Response]>();


  get<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    const userConfig = store.get('u_config')
    const token = userConfig.token
    if (!token) return
    let reqConfig = { ...reqInit, method: "get", headers: { Authorization: token } }
    return this.request<T>(path, params, { ...reqConfig });
  }

  post<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    const userConfig = store.get('u_config')
    const token = userConfig.token
    if (!token) return
    let reqConfig = { ...reqInit, method: "post", headers: { Authorization: token } }
    return this.request<T>(path, params, { ...reqConfig });
  }

  put<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    const userConfig = store.get('u_config')
    const token = userConfig.token
    if (!token) return
    let reqConfig = { ...reqInit, method: "put", headers: { Authorization: token } }
    return this.request<T>(path, params, { ...reqConfig });
  }

  patch<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    const userConfig = store.get('u_config')
    const token = userConfig.token
    if (!token) return
    let reqConfig = { ...reqInit, method: "patch", headers: { Authorization: token } }
    return this.request<T>(path, params, { ...reqConfig });
  }

  del<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    const userConfig = store.get('u_config')
    const token = userConfig.token
    if (!token) return
    let reqConfig = { ...reqInit, method: "delete", headers: { Authorization: token } }
    return this.request<T>(path, params, { ...reqConfig });
  }
  protected request<D>(path: string, params?: P, init: RequestInit = {}) {
    let reqUrl = this.config.apiPrefix + path;
    const reqInit: RequestInit = { ...this.reqInit, ...init };
    const { data, query } = params || {} as P;
    if (data && !reqInit.body) {
      reqInit.body = JSON.stringify(data);
    }
    if (query) {
      const queryString = stringify(query);
      reqUrl += (reqUrl.includes("?") ? "&" : "?") + queryString;
    }
    const infoLog: JsonApiLog = {
      method: reqInit.method.toUpperCase(),
      reqUrl: reqUrl,
      reqInit: reqInit,
    };
    return cancelableFetch(reqUrl, reqInit).then(res => {
      return this.parseResponse<D>(res, infoLog);
    });
  }

  protected async parseResponse<D>(res: Response, log: JsonApiLog): Promise<D> {
    const { status } = res;
    let text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : ""; // DELETE-requests might not have response-body
    } catch (e) {
      data = text;
    }
    if (status >= 200 && status < 300) {
      if (data && data.code === 200 && data.errors) { // handle server error
        return Promise.reject(data.errors);
      }
      this.onData.emit(data, res);
      this.writeLog({ ...log, data });
      return Promise.resolve(data);
    } else {
      const error = new JsonApiErrorParsed(data, this.parseError(data, res));
      this.onError.emit(error, res);
      this.writeLog({ ...log, error })
      throw error;
    }
  }

  protected parseError(error: JsonApiError | string, res: Response): string[] {
    if (typeof error === "string") {
      return [error]
    }
    else if (Array.isArray(error.errors)) {
      return error.errors.map(error => error.title)
    }
    else if (error.message) {
      return [error.message]
    }
    return [res.statusText || "Error!"]
  }

  protected writeLog(log: JsonApiLog) {
    if (!this.config.debug) return;
    const { method, reqUrl, ...params } = log;
    let textStyle = 'font-weight: bold;';
    if (params.data) textStyle += 'background: green; color: white;';
    if (params.error) textStyle += 'background: red; color: white;';
    console.log(`%c${method} ${reqUrl}`, textStyle, params);
  }
}

export class JsonApiErrorParsed {
  isUsedForNotification = false;

  constructor(private error: JsonApiError | DOMException, private messages: string[]) {
  }

  get isAborted() {
    return this.error.code === DOMException.ABORT_ERR;
  }

  toString() {
    return this.messages.join("\n");
  }
}
