// App configuration api
import { apiConfig } from "../index";
import { IConfig } from "../../../server/common/config";
export const configApi = {
  getConfig() {
    return apiConfig.get<IConfig>("/config")
  },
};
