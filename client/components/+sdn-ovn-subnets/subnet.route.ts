import {RouteProps} from "react-router";
import {buildURL} from "../../navigation";

export const subNetRoute: RouteProps = {
    path: "/subnet"
}

export interface ISubNetRouteParams {
}

export const subNetURL = buildURL<ISubNetRouteParams>(subNetRoute.path)

