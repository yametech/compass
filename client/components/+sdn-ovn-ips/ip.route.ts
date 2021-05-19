import {RouteProps} from "react-router";
import {buildURL} from "../../navigation";

export const ipRoute: RouteProps = {
    path: "/ip"
}

export interface IIPRouteParams {
}

export const ipURL = buildURL<IIPRouteParams>(ipRoute.path)