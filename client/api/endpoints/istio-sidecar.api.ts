import { autobind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { WorkloadSelector } from "./istio-service-entry.api";
import { Port } from "./istio-gateway.api";
import { Destination } from "./istio-virtual-service.api";
import {apiIstio} from "../index";

export interface SidecarSpec {
  // Criteria used to select the specific set of pods/VMs on which this
  // `Sidecar` configuration should be applied. If omitted, the `Sidecar`
  // configuration will be applied to all workload instances in the same namespace.
  WorkloadSelector: WorkloadSelector;
  // Ingress specifies the configuration of the sidecar for processing
  // inbound traffic to the attached workload instance. If omitted, Istio will
  // automatically configure the sidecar based on the information about the workload
  // obtained from the orchestration platform (e.g., exposed ports, services,
  // etc.). If specified, inbound ports are configured if and only if the
  // workload instance is associated with a service.
  Ingress?: IstioIngressListener[];
  // Egress specifies the configuration of the sidecar for processing
  // outbound traffic from the attached workload instance to other
  // services in the mesh. If not specified, inherits the system
  // detected defaults from the namespace-wide or the global default Sidecar.
  Egress?: IstioEgressListener[];
  // Configuration for the outbound traffic policy.  If your
  // application uses one or more external services that are not known
  // apriori, setting the policy to `ALLOW_ANY` will cause the
  // sidecars to route any unknown traffic originating from the
  // application to its requested destination. If not specified,
  // inherits the system detected defaults from the namespace-wide or
  // the global default Sidecar.
  OutboundTrafficPolicy?: OutboundTrafficPolicy;
}

// `OutboundTrafficPolicy` sets the default behavior of the sidecar for
// handling outbound traffic from the application.
// If your application uses one or more external
// services that are not known apriori, setting the policy to `ALLOW_ANY`
// will cause the sidecars to route any unknown traffic originating from
// the application to its requested destination.  Users are strongly
// encouraged to use `ServiceEntry` configurations to explicitly declare any external
// dependencies, instead of using `ALLOW_ANY`, so that traffic to these
// services can be monitored.
export interface OutboundTrafficPolicy {
  Mode?: OutboundTrafficPolicy_Mode;
  // Specifies the details of the egress proxy to which unknown
  // traffic should be forwarded to from the sidecar. Valid only if
  // the mode is set to ALLOW_ANY. If not specified when the mode is
  // ALLOW_ANY, the sidecar will send the unknown traffic directly to
  // the IP requested by the application.
  //
  // ** NOTE 1**: The specified egress host must be imported in the
  // egress section for the traffic forwarding to work.
  //
  // ** NOTE 2**: An Envoy based egress gateway is unlikely to be able
  // to handle plain text TCP connections forwarded from the sidecar.
  // Envoy's dynamic forward proxy can handle only HTTP and TLS
  // connections.
  // $hide_from_docs
  EgressProxy?: Destination;
}

export enum OutboundTrafficPolicy_Mode {
  // Outbound traffic will be restricted to services defined in the
  // service registry as well as those defined through `ServiceEntry` configurations.
  OutboundTrafficPolicy_REGISTRY_ONLY = 0,
  // Outbound traffic to unknown destinations will be allowed, in case
  // there are no services or `ServiceEntry` configurations for the destination port.
  OutboundTrafficPolicy_ALLOW_ANY = 1,
}

// `IstioEgressListener` specifies the properties of an outbound traffic
// listener on the sidecar proxy attached to a workload instance.
export interface IstioEgressListener {
  // The port associated with the listener. If using Unix domain socket,
  // use 0 as the port number, with a valid protocol. The port if
  // specified, will be used as the default destination port associated
  // with the imported hosts. If the port is omitted, Istio will infer the
  // listener ports based on the imported hosts. Note that when multiple
  // egress listeners are specified, where one or more listeners have
  // specific ports while others have no port, the hosts exposed on a
  // listener port will be based on the listener with the most specific
  // port.
  Port: Port;
  // The IP or the Unix domain socket to which the listener should be bound
  // to. Port MUST be specified if bind is not empty. Format: `x.x.x.x` or
  // `unix:///path/to/uds` or `unix://@foobar` (Linux abstract namespace). If
  // omitted, Istio will automatically configure the defaults based on imported
  // services, the workload instances to which this configuration is applied to and
  // the captureMode. If captureMode is `NONE`, bind will default to
  // 127.0.0.1.
  Bind: string;
  // When the bind address is an IP, the captureMode option dictates
  // how traffic to the listener is expected to be captured (or not).
  // captureMode must be DEFAULT or `NONE` for Unix domain socket binds.
  CaptureMode: CaptureMode;
  // One or more service hosts exposed by the listener
  // in `namespace/dnsName` format. Services in the specified namespace
  // matching `dnsName` will be exposed.
  // The corresponding service can be a service in the service registry
  // (e.g., a Kubernetes or cloud foundry service) or a service specified
  // using a `ServiceEntry` or `VirtualService` configuration. Any
  // associated `DestinationRule` in the same namespace will also be used.
  //
  // The `dnsName` should be specified using FQDN format, optionally including
  // a wildcard character in the left-most component (e.g., `prod/*.example.com`).
  // Set the `dnsName` to `*` to select all services from the specified namespace
  // (e.g., `prod/*`).
  //
  // The `namespace` can be set to `*`, `.`, or `~`, representing any, the current,
  // or no namespace, respectively. For example, `*/foo.example.com` selects the
  // service from any available namespace while `./foo.example.com` only selects
  // the service from the namespace of the sidecar. If a host is set to `*/*`,
  // Istio will configure the sidecar to be able to reach every service in the
  // mesh that is exported to the sidecar's namespace. The value `~/*` can be used
  // to completely trim the configuration for sidecars that simply receive traffic
  // and respond, but make no outbound connections of their own.
  //
  // NOTE: Only services and configuration artifacts exported to the sidecar's
  // namespace (e.g., `exportTo` value of `*`) can be referenced.
  // Private configurations (e.g., `exportTo` set to `.`) will
  // not be available. Refer to the `exportTo` setting in `VirtualService`,
  // `DestinationRule`, and `ServiceEntry` configurations for details.
  //
  // **WARNING:** The list of egress hosts in a `Sidecar` must also include
  // the Mixer control plane services if they are enabled. Envoy will not
  // be able to reach them otherwise. For example, add host
  // `istio-system/istio-telemetry.istio-system.svc.cluster.local` if telemetry
  // is enabled, `istio-system/istio-policy.istio-system.svc.cluster.local` if
  // policy is enabled, or add `istio-system/*` to allow all services in the
  // `istio-system` namespace. This requirement is temporary and will be removed
  // in a future Istio release.
  Hosts: string[];
}

// `IstioIngressListener` specifies the properties of an inbound
// traffic listener on the sidecar proxy attached to a workload instance.
export interface IstioIngressListener {
  // The port associated with the listener.
  Port?: Port;
  // The IP to which the listener should be bound. Must be in the
  // format `x.x.x.x`. Unix domain socket addresses are not allowed in
  // the bind field for ingress listeners. If omitted, Istio will
  // automatically configure the defaults based on imported services
  // and the workload instances to which this configuration is applied
  // to.
  Bind?: string;
  // The captureMode option dictates how traffic to the listener is
  // expected to be captured (or not).
  CaptureMode?: CaptureMode;
  // The loopback IP endpoint or Unix domain socket to which
  // traffic should be forwarded to. This configuration can be used to
  // redirect traffic arriving at the bind `IP:Port` on the sidecar to a `localhost:port`
  // or Unix domain socket where the application workload instance is listening for
  // connections. Format should be `127.0.0.1:PORT` or `unix:///path/to/socket`
  DefaultEndpoint?: string;
}

// `CaptureMode` describes how traffic to a listener is expected to be
// captured. Applicable only when the listener is bound to an IP.
export enum CaptureMode {
  // The default capture mode defined by the environment.
  CaptureMode_DEFAULT = 0,
  // Capture traffic using IPtables redirection.
  CaptureMode_IPTABLES = 1,
  // No traffic capture. When used in an egress listener, the application is
  // expected to explicitly communicate with the listener port or Unix
  // domain socket. When used in an ingress listener, care needs to be taken
  // to ensure that the listener port is not in use by other processes on
  // the host.
  CaptureMode_NONE = 2,
}

@autobind()
export class Sidecar extends KubeObject {
  static kind = "Sidecar";
  spec: SidecarSpec;

  getOwnerNamespace(): string {
    if (this.metadata.labels == undefined) {
      return "";
    }
    return this.metadata.labels.namespace != undefined
      ? this.metadata.labels.namespace
      : "";
  }
}

export const sidecarApi = new KubeApi({
  kind: Sidecar.kind,
  apiBase: "/apis/networking.istio.io/v1beta1/sidecars",
  isNamespaced: true,
  objectConstructor: Sidecar,
  request: apiIstio,
});
