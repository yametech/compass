import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";
import { SDN } from './sdn'

export const ovnRoute: RouteProps = {
  get path() {
    return SDN.tabRoutes.map(({ path }) => path).flat()
  }
}

export const ovnVlanRoute: RouteProps = {
  path: "/ovn-vlan",
};

export const ovnURL = buildURL(ovnVlanRoute.path);
export const ovnVlanURL = buildURL(ovnVlanRoute.path);
