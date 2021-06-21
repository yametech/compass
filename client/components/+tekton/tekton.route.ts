import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";
import { Tekton } from "./tekton";

export const tektonRoute: RouteProps = {
  get path() {
    return Tekton.tabRoutes.map(({ path }) => path).flat();
  },
};

export const tektonsRoute: RouteProps = {
  path: "/tektons",
};

export const pipelineRoute: RouteProps = {
  path: "/tekton-pipeline",
};

export const pipelineRunRoute: RouteProps = {
  path: "/tekton-pipelinerun",
};

export const pipelineResourceRoute: RouteProps = {
  path: "/tekton-pipelineresource",
};

export const taskRoute: RouteProps = {
  path: "/tekton-task",
};

export const taskRunRoute: RouteProps = {
  path: "/tekton-taskrun",
};

export const opsSecretRoute: RouteProps = {
  path: "/tekton-config",
};

export const tektonStoreRoute: RouteProps = {
  path: "/tekton-store",
};

export const webHookRoute: RouteProps = {
  path: "/tekton-webhook",
};

export interface ITektonsOverviewRouteParams {}

export const tektonsURL = buildURL<ITektonsOverviewRouteParams>(
  tektonsRoute.path
);
export const tektonURL = buildURL(pipelineRoute.path);
export const pipelineURL = buildURL(pipelineRoute.path);
export const pipelineRunURL = buildURL(pipelineRunRoute.path);
export const pipelineResourceURL = buildURL(pipelineResourceRoute.path);
export const taskURL = buildURL(taskRoute.path);
export const taskRunURL = buildURL(taskRunRoute.path);
export const opsSecretURL = buildURL(opsSecretRoute.path);
export const tektonStoreURL = buildURL(tektonStoreRoute.path);
export const webHookURL = buildURL(webHookRoute.path);
