import { autobind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { number, boolean } from "yargs";
import {apiIstio} from "..";

export interface DestinationRuleSpec {
  // The name of a service from the service registry. Service
  // names are looked up from the platform's service registry (e.g.,
  // Kubernetes services, Consul services, etc.) and from the hosts
  // declared by [ServiceEntries](https://istio.io/docs/reference/config/networking/service-entry/#ServiceEntry). Rules defined for
  // services that do not exist in the service registry will be ignored.
  //
  // *Note for Kubernetes users*: When short names are used (e.g. "reviews"
  // instead of "reviews.default.svc.cluster.local"), Istio will interpret
  // the short name based on the namespace of the rule, not the service. A
  // rule in the "default" namespace containing a host "reviews" will be
  // interpreted as "reviews.default.svc.cluster.local", irrespective of
  // the actual namespace associated with the reviews service. _To avoid
  // potential misconfigurations, it is recommended to always use fully
  // qualified domain names over short names._
  //
  // Note that the host field applies to both HTTP and TCP services.
  host?: string;
  // Traffic policies to apply (load balancing policy, connection pool
  // sizes, outlier detection).
  trafficPolicy?: TrafficPolicy;
  // One or more named sets that represent individual versions of a
  // service. Traffic policies can be overridden at subset level.
  subsets?: Subset[];
  // A list of namespaces to which this destination rule is exported.
  // The resolution of a destination rule to apply to a service occurs in the
  // context of a hierarchy of namespaces. Exporting a destination rule allows
  // it to be included in the resolution hierarchy for services in
  // other namespaces. This feature provides a mechanism for service owners
  // and mesh administrators to control the visibility of destination rules
  // across namespace boundaries.
  //
  // If no namespaces are specified then the destination rule is exported to all
  // namespaces by default.
  //
  // The value "." is reserved and defines an export to the same namespace that
  // the destination rule is declared in. Similarly, the value "*" is reserved and
  // defines an export to all namespaces.
  exportTo?: string[];
}

// **Note:** Policies specified for subsets will not take effect until
// a route rule explicitly sends traffic to this subset.
//
// One or more labels are typically required to identify the subset destination,
// however, when the corresponding DestinationRule represents a host that
// supports multiple SNI hosts (e.g., an egress gateway), a subset without labels
// may be meaningful. In this case a traffic policy with [ClientTLSSettings](#ClientTLSSettings)
// can be used to identify a specific SNI host corresponding to the named subset.
export interface Subset {
  // Name of the subset. The service name and the subset name can
  // be used for traffic splitting in a route rule.
  name: string;
  // Labels apply a filter over the endpoints of a service in the
  // service registry. See route rules for examples of usage.
  labels?: Map<string, string>;
  // Traffic policies that apply to this subset. Subsets inherit the
  // traffic policies specified at the DestinationRule level. Settings
  // specified at the subset level will override the corresponding settings
  // specified at the DestinationRule level.
  trafficPolicy?: TrafficPolicy;
}

// Traffic policies to apply for a specific destination, across all
// destination ports. See DestinationRule for examples.
export interface TrafficPolicy {
  // Settings controlling the load balancer algorithms.
  loadBalancer?: LoadBalancerSettings;
  // Settings controlling the volume of connections to an upstream service
  connectionPool?: ConnectionPoolSettings;
  // Settings controlling eviction of unhealthy hosts from the load balancing pool
  outlierDetection?: OutlierDetection;
  // TLS related settings for connections to the upstream service.
  tls?: ClientTLSSettings;
  // Traffic policies specific to individual ports. Note that port level
  // settings will override the destination-level settings. Traffic
  // settings specified at the destination-level will not be inherited when
  // overridden by port-level settings, i.e. default values will be applied
  // to fields omitted in port-level traffic policies.
  portLevelSettings?: TrafficPolicy_PortTrafficPolicy[];
}

// Traffic policies that apply to specific ports of the service
export interface TrafficPolicy_PortTrafficPolicy {
  // Specifies the number of a port on the destination service
  // on which this policy is being applied.
  //
  port?: PortSelector;
  // Settings controlling the load balancer algorithms.
  loadBalancer?: LoadBalancerSettings;
  // Settings controlling the volume of connections to an upstream service
  connectionPool?: ConnectionPoolSettings;
  // Settings controlling eviction of unhealthy hosts from the load balancing pool
  outlierDetection?: OutlierDetection;
  // TLS related settings for connections to the upstream service.
  tls?: ClientTLSSettings;
}

// PortSelector specifies the number of a port to be used for
// matching or selection for final routing.
export interface PortSelector {
  // Valid port number
  number?: number;
}

export interface ClientTLSSettings {
  // Indicates whether connections to this port should be secured
  // using TLS. The value of this field determines how TLS is enforced.
  mode: ClientTLSSettings_TLSmode;
  // REQUIRED if mode is `MUTUAL`. The path to the file holding the
  // client-side TLS certificate to use.
  // Should be empty if mode is `ISTIO_MUTUAL`.
  clientCertificate: string;
  // REQUIRED if mode is `MUTUAL`. The path to the file holding the
  // client's private key.
  // Should be empty if mode is `ISTIO_MUTUAL`.
 privateKey: string;
  // OPTIONAL: The path to the file containing certificate authority
  // certificates to use in verifying a presented server certificate. If
  // omitted, the proxy will not verify the server's certificate.
  // Should be empty if mode is `ISTIO_MUTUAL`.
  caCertificates: string;
  // The name of the secret that holds the TLS certs for the
  // client including the CA certificates. Secret must exist in the
  // same namespace with the proxy using the certificates.
  // The secret (of type `generic`)should contain the
  // following keys and values: `key: <privateKey>`,
  // `cert: <serverCert>`, `cacert: <CACertificate>`.
  // Secret of type tls for client certificates along with
  // ca.crt key for CA certificates is also supported.
  // Only one of client certificates and CA certificate
  // or credentialName can be specified.
  //
  // **NOTE:** This field is currently applicable only at gateways.
  // Sidecars will continue to use the certificate paths.
  credentialName: string;
  // A list of alternate names to verify the subject identity in the
  // certificate. If specified, the proxy will verify that the server
  // certificate's subject alt name matches one of the specified values.
  // If specified, this list overrides the value of subject_alt_names
  // from the ServiceEntry.
  subjectAltNames: string[];
  // SNI string to present to the server during TLS handshake.
  sni: string;
}

export enum ClientTLSSettings_TLSmode {
  // Do not setup a TLS connection to the upstream endpoint.
  ClientTLSSettings_DISABLE = 0,
  // Originate a TLS connection to the upstream endpoint.
  ClientTLSSettings_SIMPLE = 1,
  // Secure connections to the upstream using mutual TLS by presenting
  // client certificates for authentication.
  ClientTLSSettings_MUTUAL = 2,
  // Secure connections to the upstream using mutual TLS by presenting
  // client certificates for authentication.
  // Compared to Mutual mode, this mode uses certificates generated
  // automatically by Istio for mTLS authentication. When this mode is
  // used, all other fields in `ClientTLSSettings` should be empty.
  ClientTLSSettings_ISTIO_MUTUAL = 3,
}

export interface OutlierDetection {
  // Number of errors before a host is ejected from the connection
  // pool. Defaults to 5. When the upstream host is accessed over HTTP, a
  // 502, 503, or 504 return code qualifies as an error. When the upstream host
  // is accessed over an opaque TCP connection, connect timeouts and
  // connection error/failure events qualify as an error.
  // $hide_from_docs
  consecutiveErrors?: number; // Deprecated: Do not use.
  // Number of gateway errors before a host is ejected from the connection pool.
  // When the upstream host is accessed over HTTP, a 502, 503, or 504 return
  // code qualifies as a gateway error. When the upstream host is accessed over
  // an opaque TCP connection, connect timeouts and connection error/failure
  // events qualify as a gateway error.
  // This feature is disabled by default or when set to the value 0.
  //
  // Note that consecutive_gateway_errors and consecutive_5xx_errors can be
  // used separately or together. Because the errors counted by
  // consecutive_gateway_errors are also included in consecutive_5xx_errors,
  // if the value of consecutive_gateway_errors is greater than or equal to
  // the value of consecutive_5xx_errors, consecutive_gateway_errors will have
  // no effect.
  consecutiveGatewayErrors?: number | string;
  // Number of 5xx errors before a host is ejected from the connection pool.
  // When the upstream host is accessed over an opaque TCP connection, connect
  // timeouts, connection error/failure and request failure events qualify as a
  // 5xx error.
  // This feature defaults to 5 but can be disabled by setting the value to 0.
  //
  // Note that consecutive_gateway_errors and consecutive_5xx_errors can be
  // used separately or together. Because the errors counted by
  // consecutive_gateway_errors are also included in consecutive_5xx_errors,
  // if the value of consecutive_gateway_errors is greater than or equal to
  // the value of consecutive_5xx_errors, consecutive_gateway_errors will have
  // no effect.
  consecutive_5XxErrors?: number | string;
  // Time interval between ejection sweep analysis. format:
  // 1h/1m/1s/1ms. MUST BE >=1ms. Default is 10s.
  interval?: string | Date;
  // Minimum ejection duration. A host will remain ejected for a period
  // equal to the product of minimum ejection duration and the number of
  // times the host has been ejected. This technique allows the system to
  // automatically increase the ejection period for unhealthy upstream
  // servers. format: 1h/1m/1s/1ms. MUST BE >=1ms. Default is 30s.
  baseEjectionTime: string | Date;
  // Maximum % of hosts in the load balancing pool for the upstream
  // service that can be ejected. Defaults to 10%.
  maxEjectionPercent: number;
  // Outlier detection will be enabled as long as the associated load balancing
  // pool has at least min_health_percent hosts in healthy mode. When the
  // percentage of healthy hosts in the load balancing pool drops below this
  // threshold, outlier detection will be disabled and the proxy will load balance
  // across all hosts in the pool (healthy and unhealthy). The threshold can be
  // disabled by setting it to 0%. The default is 0% as it's not typically
  // applicable in k8s environments with few pods per service.
  minHealthPercent?: number;
}

export interface ConnectionPoolSettings {
  // Settings common to both HTTP and TCP upstream connections.
  tcp?: ConnectionPoolSettings_TCPSettings;
  // HTTP connection pool settings.
  http: ConnectionPoolSettings_HTTPSettings;
}

// Settings applicable to HTTP1.1/HTTP2/GRPC connections.
export interface ConnectionPoolSettings_HTTPSettings {
  // Maximum number of pending HTTP requests to a destination. Default 2^32-1.
  http1MaxPendingRequests?: number;
  // Maximum number of requests to a backend. Default 2^32-1.
  http2MaxRequests?: number;
  // Maximum number of requests per connection to a backend. Setting this
  // parameter to 1 disables keep alive. Default 0, meaning "unlimited",
  // up to 2^29.
  maxRequestsPerConnection?: number;
  // Maximum number of retries that can be outstanding to all hosts in a
  // cluster at a given time. Defaults to 2^32-1.
  maxRetries?: number;
  // The idle timeout for upstream connection pool connections. The idle timeout is defined as the period in which there are no active requests.
  // If not set, the default is 1 hour. When the idle timeout is reached the connection will be closed.
  // Note that request based timeouts mean that HTTP/2 PINGs will not keep the connection alive. Applies to both HTTP1.1 and HTTP2 connections.
  idleTimeout: string | Date;
  // Specify if http1.1 connection should be upgraded to http2 for the associated destination.
  h2UpgradePolicy: ConnectionPoolSettings_HTTPSettings_H2UpgradePolicy;
  // If set to true, client protocol will be preserved while initiating connection to backend.
  // Note that when this is set to true, h2_upgrade_policy will be ineffective i.e. the client
  // connections will not be upgraded to http2.
  useClientProtocol: boolean;
}

export enum ConnectionPoolSettings_HTTPSettings_H2UpgradePolicy {
  ConnectionPoolSettings_HTTPSettings_DEFAULT = 0,
  ConnectionPoolSettings_HTTPSettings_DO_NOT_UPGRADE = 1,
  ConnectionPoolSettings_HTTPSettings_UPGRADE = 2,
}

// Settings common to both HTTP and TCP upstream connections.
export interface ConnectionPoolSettings_TCPSettings {
  // Maximum number of HTTP1 /TCP connections to a destination host. Default 2^32-1.
  maxConnections: number;
  // TCP connection timeout.
  connectTimeout: string;
  // If set then set SO_KEEPALIVE on the socket to enable TCP Keepalives.
  tcpKeepalive: ConnectionPoolSettings_TCPSettings_TcpKeepalive;
}

// TCP keepalive.
export interface ConnectionPoolSettings_TCPSettings_TcpKeepalive {
  // Maximum number of keepalive probes to send without response before
  // deciding the connection is dead. Default is to use the OS level configuration
  // (unless overridden, Linux defaults to 9.)
  probes?: number;
  // The time duration a connection needs to be idle before keep-alive
  // probes start being sent. Default is to use the OS level configuration
  // (unless overridden, Linux defaults to 7200s (ie 2 hours.)
  time?: string ;
  // The time duration between keep-alive probes.
  // Default is to use the OS level configuration
  // (unless overridden, Linux defaults to 75s.)
  interval?: string;
}

export interface LoadBalancerSettings {
  // Upstream load balancing policy.
  //
  // Types that are valid to be assigned to LbPolicy:
  //	*LoadBalancerSettings_Simple
  //	*LoadBalancerSettings_ConsistentHash
  lbPolicy?: string;
  // Locality load balancer settings, this will override mesh wide settings in entirety, meaning no merging would be performed
  // between this object and the object one in MeshConfig
  localityLbSetting?: LocalityLoadBalancerSetting;
}

// Locality load balancing settings.
export interface LocalityLoadBalancerSetting {
  // Optional: only one of distribute or failover can be set.
  // Explicitly specify loadbalancing weight across different zones and geographical locations.
  // Refer to [Locality weighted load balancing](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/locality_weight)
  // If empty, the locality weight is set according to the endpoints number within it.
  distribute?: LocalityLoadBalancerSetting_Distribute[];
  // Optional: only failover or distribute can be set.
  // Explicitly specify the region traffic will land on when endpoints in local region becomes unhealthy.
  // Should be used together with OutlierDetection to detect unhealthy endpoints.
  // Note: if no OutlierDetection specified, this will not take effect.
  failover?: LocalityLoadBalancerSetting_Failover[];
  // enable locality load balancing, this is DestinationRule-level and will override mesh wide settings in entirety.
  // e.g. true means that turn on locality load balancing for this DestinationRule no matter what mesh wide settings is.
  enabled?: boolean;
}

// Specify the traffic failover policy across regions. Since zone and sub-zone
// failover is supported by default this only needs to be specified for
// regions when the operator needs to constrain traffic failover so that
// the default behavior of failing over to any endpoint globally does not
// apply. This is useful when failing over traffic across regions would not
// improve service health or may need to be restricted for other reasons
// like regulatory controls.
export interface LocalityLoadBalancerSetting_Failover {
  // Originating region.
  from?: string;
  // Destination region the traffic will fail over to when endpoints in
  // the 'from' region becomes unhealthy.
  to?: string;
}

// Describes how traffic originating in the 'from' zone or sub-zone is
// distributed over a set of 'to' zones. Syntax for specifying a zone is
// {region}/{zone}/{sub-zone} and terminal wildcards are allowed on any
// segment of the specification. Examples:
// * - matches all localities
// us-west/* - all zones and sub-zones within the us-west region
// us-west/zone-1/* - all sub-zones within us-west/zone-1
export interface LocalityLoadBalancerSetting_Distribute {
  // Originating locality, '/' separated, e.g. 'region/zone/sub_zone'.
  from: string;
  // Map of upstream localities to traffic distribution weights. The sum of
  // all weights should be == 100. Any locality not assigned a weight will
  // receive no traffic.
  to?: Map<string, number>;
}

@autobind()
export class DestinationRule extends KubeObject {
  static kind = "DestinationRule";
  spec: DestinationRuleSpec;

  getOwnerNamespace(): string {
    if (this.metadata.labels == undefined) {
      return "";
    }
    return this.metadata.labels.namespace != undefined
      ? this.metadata.labels.namespace
      : "";
  }
}

export const destinationRuleApi = new KubeApi({
  kind: DestinationRule.kind,
  apiBase: "/apis/networking.istio.io/v1beta1/destinationrules",
  isNamespaced: true,
  objectConstructor: DestinationRule,
  request: apiIstio,
});
