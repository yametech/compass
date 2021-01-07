import { autobind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import {apiIstio} from "../index";

export interface VirtualServiceSpec {
  // The destination hosts to which traffic is being sent. Could
  // be a DNS name with wildcard prefix or an IP address.  Depending on the
  // platform, short-names can also be used instead of a FQDN (i.e. has no
  // dots in the name). In such a scenario, the FQDN of the host would be
  // derived based on the underlying platform.
  //
  // A single VirtualService can be used to describe all the traffic
  // properties of the corresponding hosts, including those for multiple
  // HTTP and TCP ports. Alternatively, the traffic properties of a host
  // can be defined using more than one VirtualService, with certain
  // caveats. Refer to the
  // [Operations Guide](https://istio.io/docs/ops/best-practices/traffic-management/#split-virtual-services)
  // for details.
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
  // The hosts field applies to both HTTP and TCP services. Service inside
  // the mesh, i.e., those found in the service registry, must always be
  // referred to using their alphanumeric names. IP addresses are allowed
  // only for services defined via the Gateway.
  //
  // *Note*: It must be empty for a delegate VirtualService.
  hosts?: string[];
  // The names of gateways and sidecars that should apply these routes.
  // Gateways in other namespaces may be referred to by
  // `<gateway namespace>/<gateway name>`; specifying a gateway with no
  // namespace qualifier is the same as specifying the VirtualService's
  // namespace. A single VirtualService is used for sidecars inside the mesh as
  // well as for one or more gateways. The selection condition imposed by this
  // field can be overridden using the source field in the match conditions
  // of protocol-specific routes. The reserved word `mesh` is used to imply
  // all the sidecars in the mesh. When this field is omitted, the default
  // gateway (`mesh`) will be used, which would apply the rule to all
  // sidecars in the mesh. If a list of gateway names is provided, the
  // rules will apply only to the gateways. To apply the rules to both
  // gateways and sidecars, specify `mesh` as one of the gateway names.
  gateways?: string[];
  // An ordered list of route rules for HTTP traffic. HTTP routes will be
  // applied to platform service ports named 'http-*'/'http2-*'/'grpc-*', gateway
  // ports with protocol HTTP/HTTP2/GRPC/ TLS-terminated-HTTPS and service
  // entry ports using HTTP/HTTP2/GRPC protocols.  The first rule matching
  // an incoming request is used.
  http?: HTTPRoute[];
  // An ordered list of route rule for non-terminated TLS & HTTPS
  // traffic. Routing is typically performed using the SNI value presented
  // by the ClientHello message. TLS routes will be applied to platform
  // service ports named 'https-*', 'tls-*', unterminated gateway ports using
  // HTTPS/TLS protocols (i.e. with "passthrough" TLS mode) and service
  // entry ports using HTTPS/TLS protocols.  The first rule matching an
  // incoming request is used.  NOTE: Traffic 'https-*' or 'tls-*' ports
  // without associated virtual service will be treated as opaque TCP
  // traffic.
  tls?: TLSRoute[];
  // An ordered list of route rules for opaque TCP traffic. TCP routes will
  // be applied to any port that is not a HTTP or TLS port. The first rule
  // matching an incoming request is used.
  tcp?: TCPRoute[];
  // A list of namespaces to which this virtual service is exported. Exporting a
  // virtual service allows it to be used by sidecars and gateways defined in
  // other namespaces. This feature provides a mechanism for service owners
  // and mesh administrators to control the visibility of virtual services
  // across namespace boundaries.
  //
  // If no namespaces are specified then the virtual service is exported to all
  // namespaces by default.
  //
  // The value "." is reserved and defines an export to the same namespace that
  // the virtual service is declared in. Similarly the value "*" is reserved and
  // defines an export to all namespaces.
  exportTo?: string[];
}

export interface HTTPRoute {
  // The name assigned to the route for debugging purposes. The
  // route's name will be concatenated with the match's name and will
  // be logged in the access logs for requests matching this
  // route/match.
  name?: string;
  // Match conditions to be satisfied for the rule to be
  // activated. All conditions inside a single match block have AND
  // semantics, while the list of match blocks have OR semantics. The rule
  // is matched if any one of the match blocks succeed.
  match?: HTTPMatchRequest[];
  // A HTTP rule can either redirect or forward (default) traffic. The
  // forwarding target can be one of several versions of a service (see
  // glossary in beginning of document). Weights associated with the
  // service version determine the proportion of traffic it receives.
  route?: HTTPRouteDestination[];
  // A HTTP rule can either redirect or forward (default) traffic. If
  // traffic passthrough option is specified in the rule,
  // route/redirect will be ignored. The redirect primitive can be used to
  // send a HTTP 301 redirect to a different URI or Authority.
  redirect?: HTTPRedirect;
  // Delegate is used to specify the particular VirtualService which
  // can be used to define delegate HTTPRoute.
  // It can be set only when `Route` and `Redirect` are empty, and the route rules of the
  // delegate VirtualService will be merged with that in the current one.
  // **NOTE**:
  //    1. Only one level delegation is supported.
  //    2. The delegate's HTTPMatchRequest must be a strict subset of the root's,
  //       otherwise there is a conflict and the HTTPRoute will not take effect.
  delegate?: Delegate;
  // Rewrite HTTP URIs and Authority headers. Rewrite cannot be used with
  // Redirect primitive. Rewrite will be performed before forwarding.
  rewrite?: HTTPRewrite;
  // Timeout for HTTP requests, default is disabled.
  timeout?: string;
  // Retry policy for HTTP requests.
  retries?: HTTPRetry;
  // Fault injection policy to apply on HTTP traffic at the client side.
  // Note that timeouts or retries will not be enabled when faults are
  // enabled on the client side.
  fault?: HTTPFaultInjection;
  // Mirror HTTP traffic to a another destination in addition to forwarding
  // If this field is absent, all the traffic (100%) will be mirrored.
  // Max value is 100.
  mirrorPercentage?: string;
  // Cross-Origin Resource Sharing policy (CORS). Refer to
  // [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
  // for further details about cross origin resource sharing.
  corsPolicy?: CorsPolicy;
  // Header manipulation rules
  headers?: Headers; // the requests to the intended destination. Mirrored traffic is on a
  // best effort basis where the sidecar/gateway will not wait for the
  // mirrored cluster to respond before returning the response from the
  // original destination.  Statistics will be generated for the mirrored
  // destination.
  mirror?: Destination;
  // Percentage of the traffic to be mirrored by the `mirror` field.
  // Use of integer `mirror_percent` value is deprecated. Use the
  // double `mirror_percentage` field instead
  mirrorPercent?: number;
}

export interface Headers {
  // Header manipulation rules to apply before forwarding a request
  // to the destination service
  request?: Headers_HeaderOperations;
  // Header manipulation rules to apply before returning a response
  // to the caller
  response?: Headers_HeaderOperations;
}

// HeaderOperations Describes the header manipulations to apply
export interface Headers_HeaderOperations {
  // Overwrite the headers specified by key with the given values
  set?: Map<string, string>;
  // Append the given values to the headers specified by keys
  // (will create a comma-separated list of values)
  add?: Map<string, string>;
  // Remove a the specified headers
  remove?: string;
}

export interface CorsPolicy {
  // The list of origins that are allowed to perform CORS requests. The
  // content will be serialized into the Access-Control-Allow-Origin
  // header. Wildcard * will allow all origins.
  // $hide_from_docs
  allowOrigin?: string[]; // Deprecated: Do not use.
  // String patterns that match allowed origins.
  // An origin is allowed if any of the string matchers match.
  // If a match is found, then the outgoing Access-Control-Allow-Origin would be set to the origin as provided by the client.
  allowOrigins?: string;
  // List of HTTP methods allowed to access the resource. The content will
  // be serialized into the Access-Control-Allow-Methods header.
  allowMethods?: string[];
  // List of HTTP headers that can be used when requesting the
  // resource. Serialized to Access-Control-Allow-Headers header.
  allowHeaders?: string[];
  // A list of HTTP headers that the browsers are allowed to
  // access. Serialized into Access-Control-Expose-Headers header.
  axposeHeaders?: string[];
  // Specifies how long the results of a preflight request can be
  // cached. Translates to the `Access-Control-Max-Age` header.
  maxAge?: string | Date;
  // Indicates whether the caller is allowed to send the actual request
  // (not the preflight) using credentials. Translates to
  // `Access-Control-Allow-Credentials` header.
  allowCredentials?: boolean | string;
}

export interface HTTPFaultInjection {
  // Delay requests before forwarding, emulating various failures such as
  // network issues, overloaded upstream service, etc.
  delay?: HTTPFaultInjection_Delay;
  // Abort Http request attempts and return error codes back to downstream
  // service, giving the impression that the upstream service is faulty.
  abort?: HTTPFaultInjection_Abort;
}

// The _httpStatus_ field is used to indicate the HTTP status code to
// return to the caller. The optional _percentage_ field can be used to only
// abort a certain percentage of requests. If not specified, all requests are
// aborted.
export interface HTTPFaultInjection_Abort {
  // Types that are valid to be assigned to ErrorType:
  //	*HTTPFaultInjection_Abort_HttpStatus
  //	*HTTPFaultInjection_Abort_GrpcStatus
  //	*HTTPFaultInjection_Abort_Http2Error
  errorType?: string;
  // Percentage of requests to be aborted with the error code provided.
  percentage?: string;
}

// The _fixedDelay_ field is used to indicate the amount of delay in seconds.
// The optional _percentage_ field can be used to only delay a certain
// percentage of requests. If left unspecified, all request will be delayed.
export interface HTTPFaultInjection_Delay {
  // Percentage of requests on which the delay will be injected (0-100).
  // Use of integer `percent` value is deprecated. Use the double `percentage`
  // field instead.
  percent?: number; // Deprecated: Do not use.
  // Types that are valid to be assigned to HttpDelayType:
  //	*HTTPFaultInjection_Delay_FixedDelay
  //	*HTTPFaultInjection_Delay_ExponentialDelay
  httpDelayType?: string;
  // Percentage of requests on which the delay will be injected.
  percentage?: string;
}

export interface HTTPRetry {
  // Number of retries for a given request. The interval
  // between retries will be determined automatically (25ms+). Actual
  // number of retries attempted depends on the request `timeout` of the
  // [HTTP route](https://istio.io/docs/reference/config/networking/virtual-service/#HTTPRoute).
  attempts?: number;
  // Timeout per retry attempt for a given request. format: 1h/1m/1s/1ms. MUST BE >=1ms.
  perTryTimeout?: string;
  // Specifies the conditions under which retry takes place.
  // One or more policies can be specified using a ‘,’ delimited list.
  // See the [retry policies](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#x-envoy-retry-on)
  // and [gRPC retry policies](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#x-envoy-retry-grpc-on) for more details.
  retryOn?: string;
  // Flag to specify whether the retries should retry to other localities.
  // See the [retry plugin configuration](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/http/http_connection_management#retry-plugin-configuration) for more details.
  retryRemoteLocalities?: boolean;
}

export interface HTTPRewrite {
  // rewrite the path (or the prefix) portion of the URI with this
  // value. If the original URI was matched based on prefix, the value
  // provided in this field will replace the corresponding matched prefix.
  uri?: string;
  // rewrite the Authority/Host header with this value.
  authority?: string;
}

export interface Delegate {
  // Name specifies the name of the delegate VirtualService.
  name?: string;
  // Namespace specifies the namespace where the delegate VirtualService resides.
  // By default, it is same to the root's.
  namespace?: string;
}

export interface HTTPRedirect {
  // On a redirect, overwrite the Path portion of the URL with this
  // value. Note that the entire path will be replaced, irrespective of the
  // request URI being matched as an exact path or prefix.
  uri?: string;
  // On a redirect, overwrite the Authority/Host portion of the URL with
  // this value.
  authority?: string;
  // On a redirect, Specifies the HTTP status code to use in the redirect
  // response. The default response code is MOVED_PERMANENTLY (301).
  redirectCode?: number;
}

export interface HTTPRouteDestination {
  // Destination uniquely identifies the instances of a service
  // to which the request/connection should be forwarded to.
  destination?: Destination;
  // The proportion of traffic to be forwarded to the service
  // version. (0-100). Sum of weights across destinations SHOULD BE == 100.
  // If there is only one destination in a rule, the weight value is assumed to
  // be 100.
  weight?: number;
  // Header manipulation rules
  headers?: Headers;
}

export interface Destination {
  // The name of a service from the service registry. Service
  // names are looked up from the platform's service registry (e.g.,
  // Kubernetes services, Consul services, etc.) and from the hosts
  // declared by [ServiceEntry](https://istio.io/docs/reference/config/networking/service-entry/#ServiceEntry). Traffic forwarded to
  // destinations that are not found in either of the two, will be dropped.
  //
  // *Note for Kubernetes users*: When short names are used (e.g. "reviews"
  // instead of "reviews.default.svc.cluster.local"), Istio will interpret
  // the short name based on the namespace of the rule, not the service. A
  // rule in the "default" namespace containing a host "reviews will be
  // interpreted as "reviews.default.svc.cluster.local", irrespective of
  // the actual namespace associated with the reviews service. To avoid
  // potential misconfiguration, it is recommended to always use fully
  // qualified domain names over short names.
  host?: string;
  // The name of a subset within the service. Applicable only to services
  // within the mesh. The subset must be defined in a corresponding
  // DestinationRule.
  subset?: string;
  // Specifies the port on the host that is being addressed. If a service
  // exposes only a single port it is not required to explicitly select the
  // port.
  port?: number;
}

// HTTPMatchRequest CANNOT be empty.
// **Note:** No regex string match can be set when delegate VirtualService is specified.
export interface HTTPMatchRequest {
  // The name assigned to a match. The match's name will be
  // concatenated with the parent route's name and will be logged in
  // the access logs for requests matching this route.
  name: string;
  // URI to match
  // values are case-sensitive and formatted as follows:
  //
  // - `exact: "value"` for exact string match
  //
  // - `prefix: "value"` for prefix-based match
  //
  // - `regex: "value"` for ECMAscript style regex-based match
  //
  // **Note:** Case-insensitive matching could be enabled via the
  // `ignore_uri_case` flag.
  uri?: string;
  // URI Scheme
  // values are case-sensitive and formatted as follows:
  //
  // - `exact: "value"` for exact string match
  //
  // - `prefix: "value"` for prefix-based match
  //
  // - `regex: "value"` for ECMAscript style regex-based match
  //
  scheme?: string;
  // HTTP Method
  // values are case-sensitive and formatted as follows:
  //
  // - `exact: "value"` for exact string match
  //
  // - `prefix: "value"` for prefix-based match
  //
  // - `regex: "value"` for ECMAscript style regex-based match
  //
  method?: string;
  // HTTP Authority
  // values are case-sensitive and formatted as follows:
  //
  // - `exact: "value"` for exact string match
  //
  // - `prefix: "value"` for prefix-based match
  //
  // - `regex: "value"` for ECMAscript style regex-based match
  //
  authority?: string;
  // The header keys must be lowercase and use hyphen as the separator,
  // e.g. _x-request-id_.
  //
  // Header values are case-sensitive and formatted as follows:
  //
  // - `exact: "value"` for exact string match
  //
  // - `prefix: "value"` for prefix-based match
  //
  // - `regex: "value"` for ECMAscript style regex-based match
  //
  // If the value is empty and only the name of header is specfied, presence of the header is checked.
  // **Note:** The keys `uri`, `scheme`, `method`, and `authority` will be ignored.
  headers?: Map<string, string>;
  // Specifies the ports on the host that is being addressed. Many services
  // only expose a single port or label ports with the protocols they support,
  // in these cases it is not required to explicitly select the port.
  port?: number;
  // One or more labels that constrain the applicability of a rule to
  // workloads with the given labels. If the VirtualService has a list of
  // gateways specified in the top-level `gateways` field, it must include the reserved gateway
  // `mesh` for this field to be applicable.
  sourceLabels?: Map<string, string>;
  // Names of gateways where the rule should be applied. Gateway names
  // in the top-level `gateways` field of the VirtualService (if any) are overridden. The gateway
  // match is independent of sourceLabels.
  gateways?: string[];
  // Query parameters for matching.
  //
  // Ex:
  // - For a query parameter like "?key=true", the map key would be "key" and
  //   the string match could be defined as `exact: "true"`.
  // - For a query parameter like "?key", the map key would be "key" and the
  //   string match could be defined as `exact: ""`.
  // - For a query parameter like "?key=123", the map key would be "key" and the
  //   string match could be defined as `regex: "\d+$"`. Note that this
  //   configuration will only match values like "123" but not "a123" or "123a".
  //
  // **Note:** `prefix` matching is currently not supported.
  queryParams?: Map<string, string>;
  //
  // **Note:** The case will be ignored only in the case of `exact` and `prefix`
  // URI matches.
  ignoreUriCase?: boolean;
  // withoutHeader has the same syntax with the header, but has opposite meaning.
  // If a header is matched with a matching rule among withoutHeader, the traffic becomes not matched one.
  withoutHeaders?: Map<string, string>;
  // Source namespace constraining the applicability of a rule to workloads in that namespace.
  // If the VirtualService has a list of gateways specified in the top-level `gateways` field,
  // it must include the reserved gateway `mesh` for this field to be applicable.
  sourceNamespace?: string;
}

export interface TLSRoute {
  // Match conditions to be satisfied for the rule to be
  // activated. All conditions inside a single match block have AND
  // semantics, while the list of match blocks have OR semantics. The rule
  // is matched if any one of the match blocks succeed.
  match?: TLSMatchAttributes[];
  // The destination to which the connection should be forwarded to.
  route?: RouteDestination;
}

// TLS connection match attributes.
export interface TLSMatchAttributes {
  // SNI (server name indicator) to match on. Wildcard prefixes
  // can be used in the SNI value, e.g., *.com will match foo.example.com
  // as well as example.com. An SNI value must be a subset (i.e., fall
  // within the domain) of the corresponding virtual serivce's hosts.
  sniHosts?: string[];
  // IPv4 or IPv6 ip addresses of destination with optional subnet.  E.g.,
  // a.b.c.d/xx form or just a.b.c.d.
  destinationSubnets?: string[];
  // Specifies the port on the host that is being addressed. Many services
  // only expose a single port or label ports with the protocols they
  // support, in these cases it is not required to explicitly select the
  // port.
  port?: number;
  // One or more labels that constrain the applicability of a rule to
  // workloads with the given labels. If the VirtualService has a list of
  // gateways specified in the top-level `gateways` field, it should include the reserved gateway
  // `mesh` in order for this field to be applicable.
  sourceLabels?: Map<string, string>;
  // Names of gateways where the rule should be applied. Gateway names
  // in the top-level `gateways` field of the VirtualService (if any) are overridden. The gateway
  // match is independent of sourceLabels.
  gateways?: string[];
  // Source namespace constraining the applicability of a rule to workloads in that namespace.
  // If the VirtualService has a list of gateways specified in the top-level `gateways` field,
  // it must include the reserved gateway `mesh` for this field to be applicable.
  sourceNamespace?: string;
}

// L4 routing rule weighted destination.
export interface RouteDestination {
  // Destination uniquely identifies the instances of a service
  // to which the request/connection should be forwarded to.
  destination?: Destination;
  // The proportion of traffic to be forwarded to the service
  // version. If there is only one destination in a rule, all traffic will be
  // routed to it irrespective of the weight.
  weight?: number;
}

export interface TCPRoute {
  // Match conditions to be satisfied for the rule to be
  // activated. All conditions inside a single match block have AND
  // semantics, while the list of match blocks have OR semantics. The rule
  // is matched if any one of the match blocks succeed.
  match: L4MatchAttributes[];
  // The destination to which the connection should be forwarded to.
  route: RouteDestination[];
}

// L4 connection match attributes. Note that L4 connection matching support
// is incomplete.
export interface L4MatchAttributes {
  // IPv4 or IPv6 ip addresses of destination with optional subnet.  E.g.,
  // a.b.c.d/xx form or just a.b.c.d.
  destinationSubnets?: string[];
  // Specifies the port on the host that is being addressed. Many services
  // only expose a single port or label ports with the protocols they support,
  // in these cases it is not required to explicitly select the port.
  port?: number;
  // IPv4 or IPv6 ip address of source with optional subnet. E.g., a.b.c.d/xx
  // form or just a.b.c.d
  // $hide_from_docs
  sourceSubnet?: string;
  // One or more labels that constrain the applicability of a rule to
  // workloads with the given labels. If the VirtualService has a list of
  // gateways specified in the top-level `gateways` field, it should include the reserved gateway
  // `mesh` in order for this field to be applicable.
  sourceLabels?: Map<string, string>;
  // Names of gateways where the rule should be applied. Gateway names
  // in the top-level `gateways` field of the VirtualService (if any) are overridden. The gateway
  // match is independent of sourceLabels.
  gateways?: string[];
  // Source namespace constraining the applicability of a rule to workloads in that namespace.
  // If the VirtualService has a list of gateways specified in the top-level `gateways` field,
  // it must include the reserved gateway `mesh` for this field to be applicable.
  sourceNamespace?: string;
}

@autobind()
export class VirtualService extends KubeObject {
  static kind = "VirtualService";
  spec: VirtualServiceSpec;

  getOwnerNamespace(): string {
    if (this.metadata.labels == undefined) {
      return "";
    }
    return this.metadata.labels.namespace != undefined
      ? this.metadata.labels.namespace
      : "";
  }
}

export const virtualServiceApi = new KubeApi({
  kind: VirtualService.kind,
  apiBase: "/apis/networking.istio.io/v1beta1/virtualservices",
  isNamespaced: true,
  objectConstructor: VirtualService,
  request: apiIstio,
});
