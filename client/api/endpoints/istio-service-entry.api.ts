import { autobind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { WorkloadEntrySpec } from "./istio-workload-entry.api";
import { Port } from "./istio-gateway.api";
import {apiIstio} from "../index";

export interface ServiceEntrySpec {
  // The hosts associated with the ServiceEntry. Could be a DNS
  // name with wildcard prefix.
  //
  // 1. The hosts field is used to select matching hosts in VirtualServices and DestinationRules.
  // 2. For HTTP traffic the HTTP Host/Authority header will be matched against the hosts field.
  // 3. For HTTPs or TLS traffic containing Server Name Indication (SNI), the SNI value
  // will be matched against the hosts field.
  //
  // **NOTE 1:** When resolution is set to type DNS and no endpoints
  // are specified, the host field will be used as the DNS name of the
  // endpoint to route traffic to.
  //
  // **NOTE 2:** If the hostname matches with the name of a service
  // from another service registry such as Kubernetes that also
  // supplies its own set of endpoints, the ServiceEntry will be
  // treated as a decorator of the existing Kubernetes
  // service. Properties in the service entry will be added to the
  // Kubernetes service if applicable. Currently, the only the
  // following additional properties will be considered by `istiod`:
  //
  // 1. subjectAltNames: In addition to verifying the SANs of the
  //    service accounts associated with the pods of the service, the
  //    SANs specified here will also be verified.
  //
  hosts?: string[];
  // The virtual IP addresses associated with the service. Could be CIDR
  // prefix. For HTTP traffic, generated route configurations will include http route
  // domains for both the `addresses` and `hosts` field values and the destination will
  // be identified based on the HTTP Host/Authority header.
  // If one or more IP addresses are specified,
  // the incoming traffic will be identified as belonging to this service
  // if the destination IP matches the IP/CIDRs specified in the addresses
  // field. If the Addresses field is empty, traffic will be identified
  // solely based on the destination port. In such scenarios, the port on
  // which the service is being accessed must not be shared by any other
  // service in the mesh. In other words, the sidecar will behave as a
  // simple TCP proxy, forwarding incoming traffic on a specified port to
  // the specified destination endpoint IP/host. Unix domain socket
  // addresses are not supported in this field.
  addresses?: string[];
  // The ports associated with the external service. If the
  // Endpoints are Unix domain socket addresses, there must be exactly one
  // port.
  ports?: Port[];
  // Specify whether the service should be considered external to the mesh
  // or part of the mesh.
  location?: string;
  // Service discovery mode for the hosts. Care must be taken
  // when setting the resolution mode to NONE for a TCP port without
  // accompanying IP addresses. In such cases, traffic to any IP on
  // said port will be allowed (i.e. `0.0.0.0:<port>`).
  resolution?: string;
  // One or more endpoints associated with the service. Only one of
  // `endpoints` or `workloadSelector` can be specified.
  endpoints?: WorkloadEntrySpec;
  // Applicable only for MESH_INTERNAL services. Only one of
  // `endpoints` or `workloadSelector` can be specified. Selects one
  // or more Kubernetes pods or VM workloads (specified using
  // `WorkloadEntry`) based on their labels. The `WorkloadEntry` object
  // representing the VMs should be defined in the same namespace as
  // the ServiceEntry.
  workloadSelector?: WorkloadSelector;
  // A list of namespaces to which this service is exported. Exporting a service
  // allows it to be used by sidecars, gateways and virtual services defined in
  // other namespaces. This feature provides a mechanism for service owners
  // and mesh administrators to control the visibility of services across
  // namespace boundaries.
  //
  // If no namespaces are specified then the service is exported to all
  // namespaces by default.
  //
  // The value "." is reserved and defines an export to the same namespace that
  // the service is declared in. Similarly the value "*" is reserved and
  // defines an export to all namespaces.
  //
  // For a Kubernetes Service, the equivalent effect can be achieved by setting
  // the annotation "networking.istio.io/exportTo" to a comma-separated list
  // of namespace names.
  exportTo?: string[];
  // If specified, the proxy will verify that the server certificate's
  // subject alternate name matches one of the specified values.
  //
  // NOTE: When using the workloadEntry with workloadSelectors, the
  // service account specified in the workloadEntry will also be used
  // to derive the additional subject alternate names that should be
  // verified.
  subjectAltNames?: string[];
}

// `WorkloadSelector` specifies the criteria used to determine if the `Gateway`,
// `Sidecar`, or `EnvoyFilter` configuration can be applied to a proxy. The matching criteria
// includes the metadata associated with a proxy, workload instance info such as
// labels attached to the pod/VM, or any other info that the proxy provides
// to Istio during the initial handshake. If multiple conditions are
// specified, all conditions need to match in order for the workload instance to be
// selected. Currently, only label based selection mechanism is supported.
export interface WorkloadSelector {
  // One or more labels that indicate a specific set of pods/VMs
  // on which this `Sidecar` configuration should be applied. The scope of
  // label search is restricted to the configuration namespace in which the
  // the resource is present.
  labels?: Map<string, string>;
}

// Resolution determines how the proxy will resolve the IP addresses of
// the network endpoints associated with the service, so that it can
// route to one of them. The resolution mode specified here has no impact
// on how the application resolves the IP address associated with the
// service. The application may still have to use DNS to resolve the
// service to an IP so that the outbound traffic can be captured by the
// Proxy. Alternatively, for HTTP services, the application could
// directly communicate with the proxy (e.g., by setting HTTP_PROXY) to
// talk to these services.
export enum ServiceEntry_Resolution {
  // Assume that incoming connections have already been resolved (to a
  // specific destination IP address). Such connections are typically
  // routed via the proxy using mechanisms such as IP table REDIRECT/
  // eBPF. After performing any routing related transformations, the
  // proxy will forward the connection to the IP address to which the
  // connection was bound.
  ServiceEntry_NONE = 0,
  // Use the static IP addresses specified in endpoints (see below) as the
  // backing instances associated with the service.
  ServiceEntry_STATIC = 1,
  // Attempt to resolve the IP address by querying the ambient DNS,
  // during request processing. If no endpoints are specified, the proxy
  // will resolve the DNS address specified in the hosts field, if
  // wildcards are not used. If endpoints are specified, the DNS
  // addresses specified in the endpoints will be resolved to determine
  // the destination IP address.  DNS resolution cannot be used with Unix
  // domain socket endpoints.
  ServiceEntry_DNS = 2,
}
export enum ServiceEntry_Location {
  // Signifies that the service is external to the mesh. Typically used
  // to indicate external services consumed through APIs.
  ServiceEntry_MESH_EXTERNAL = 0,
  // Signifies that the service is part of the mesh. Typically used to
  // indicate services added explicitly as part of expanding the service
  // mesh to include unmanaged infrastructure (e.g., VMs added to a
  // Kubernetes based service mesh).
  ServiceEntry_MESH_INTERNAL = 1,
}

@autobind()
export class ServiceEntry extends KubeObject {
  static kind = "ServiceEntry";
  spec: ServiceEntrySpec;

  getOwnerNamespace(): string {
    if (this.metadata.labels == undefined) {
      return "";
    }
    return this.metadata.labels.namespace != undefined
      ? this.metadata.labels.namespace
      : "";
  }
}

export const serviceEntryApi = new KubeApi({
  kind: ServiceEntry.kind,
  apiBase: "/apis/networking.istio.io/v1beta1/serviceentries",
  isNamespaced: true,
  objectConstructor: ServiceEntry,
  request: apiIstio,
});
