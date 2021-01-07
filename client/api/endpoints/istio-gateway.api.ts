import {autobind} from "../../utils";
import {KubeObject} from "../kube-object";
import {KubeApi} from "../kube-api";
import {apiIstio} from "../index";

// Port describes the properties of a specific port of a service.
export interface Port {
  // A valid non-negative integer port number.
  number?: number;
  // The protocol exposed on the port.
  // MUST BE one of HTTP|HTTPS|GRPC|HTTP2|MONGO|TCP|TLS.
  // TLS implies the connection will be routed based on the SNI header to
  // the destination without terminating the TLS connection.
  protocol?: string;
  // Label assigned to the port.
  name?: string;
  // The port number on the endpoint where the traffic will be
  // received. Applicable only when used with ServiceEntries.
  targetPort?: number;
}

// TLS modes enforced by the proxy
export enum ServerTLSSettings_TLSmode {
  // The SNI string presented by the client will be used as the
  // match criterion in a VirtualService TLS route to determine
  // the destination service from the service registry.
  serverTLSSettings_PASSTHROUGH = 0,
  // Secure connections with standard TLS semantics.
  serverTLSSettings_SIMPLE = 1,
  // Secure connections to the downstream using mutual TLS by
  // presenting server certificates for authentication.
  serverTLSSettings_MUTUAL = 2,
  // Similar to the passthrough mode, except servers with this TLS
  // mode do not require an associated VirtualService to map from
  // the SNI value to service in the registry. The destination
  // details such as the service/subset/port are encoded in the
  // SNI value. The proxy will forward to the upstream (Envoy)
  // cluster (a group of endpoints) specified by the SNI
  // value. This server is typically used to provide connectivity
  // between services in disparate L3 networks that otherwise do
  // not have direct connectivity between their respective
  // endpoints. Use of this mode assumes that both the source and
  // the destination are using Istio mTLS to secure traffic.
  serverTLSSettings_AUTO_PASSTHROUGH = 3,
  // Secure connections from the downstream using mutual TLS by
  // presenting server certificates for authentication.  Compared
  // to Mutual mode, this mode uses certificates, representing
  // gateway workload identity, generated automatically by Istio
  // for mTLS authentication. When this mode is used, all other
  // fields in `TLSOptions` should be empty.
  serverTLSSettings_ISTIO_MUTUAL = 4,
}

export enum ServerTLSSettings_TLSProtocol {
  // Automatically choose the optimal TLS version.
  serverTLSSettings_TLS_AUTO = 0,
  // TLS version 1.0
  serverTLSSettings_TLSV1_0 = 1,
  // TLS version 1.1
  serverTLSSettings_TLSV1_1 = 2,
  // TLS version 1.2
  serverTLSSettings_TLSV1_2 = 3,
  // TLS version 1.3
  serverTLSSettings_TLSV1_3 = 4,
}

export interface ServerTLSSettings {
  // If set to true, the load balancer will send a 301 redirect for
  // all http connections, asking the clients to use HTTPS.
  httpsRedirect?: boolean;
  // Optional: Indicates whether connections to this port should be
  // secured using TLS. The value of this field determines how TLS is
  // enforced.
  mode?: ServerTLSSettings_TLSmode;
  // REQUIRED if mode is `SIMPLE` or `MUTUAL`. The path to the file
  // holding the server-side TLS certificate to use.
  serverCertificate?: string;
  // REQUIRED if mode is `SIMPLE` or `MUTUAL`. The path to the file
  // holding the server's private key.
  privateKey?: string;
  // REQUIRED if mode is `MUTUAL`. The path to a file containing
  // certificate authority certificates to use in verifying a presented
  // client side certificate.
  caCertificates?: string;
  // For gateways running on Kubernetes, the name of the secret that
  // holds the TLS certs including the CA certificates. Applicable
  // only on Kubernetes, and only if the dynamic credential fetching
  // feature is enabled in the proxy by setting
  // `ISTIO_META_USER_SDS` metadata variable.  The secret (of type
  // `generic`) should contain the following keys and values: `key:
  // <privateKey>` and `cert: <serverCert>`. For mutual TLS,
  // `cacert: <CACertificate>` can be provided in the same secret or
  // a separate secret named `<secret>-cacert`.
  // Secret of type tls for server certificates along with
  // ca.crt key for CA certificates is also supported.
  // Only one of server certificates and CA certificate
  // or credentialName can be specified.
  credentialName?: string;
  // A list of alternate names to verify the subject identity in the
  // certificate presented by the client.
  subjectAltNames?: string[];
  // An optional list of base64-encoded SHA-256 hashes of the SKPIs of
  // authorized client certificates.
  // Note: When both verify_certificate_hash and verify_certificate_spki
  // are specified, a hash matching either value will result in the
  // certificate being accepted.
  verifyCertificateSpki?: string[];
  // An optional list of hex-encoded SHA-256 hashes of the
  // authorized client certificates. Both simple and colon separated
  // formats are acceptable.
  // Note: When both verify_certificate_hash and verify_certificate_spki
  // are specified, a hash matching either value will result in the
  // certificate being accepted.
  verifyCertificateHash?: string[];
  // Optional: Minimum TLS protocol version.
  minProtocolVersion?: ServerTLSSettings_TLSProtocol;
  // Optional: Maximum TLS protocol version.
  maxProtocolVersion?: ServerTLSSettings_TLSProtocol;
  // Optional: If specified, only support the specified cipher list.
  // Otherwise default to the default cipher list supported by Envoy.
  cipherSuites?: string;
}

export interface Server {
  // The Port on which the proxy should listen for incoming
  // connections.
  port?: Port;
  // $hide_from_docs
  // The ip or the Unix domain socket to which the listener should be bound
  // to. Format: `x.x.x.x` or `unix:///path/to/uds` or `unix://@foobar`
  // (Linux abstract namespace). When using Unix domain sockets, the port
  // number should be 0.
  bind?: string;
  // One or more hosts exposed by this gateway.
  // While typically applicable to
  // HTTP services, it can also be used for TCP services using TLS with SNI.
  // A host is specified as a `dnsName` with an optional `namespace/` prefix.
  // The `dnsName` should be specified using FQDN format, optionally including
  // a wildcard character in the left-most component (e.g.,
  // `prod/*.example.com`). Set the `dnsName` to `*` to select all
  // `VirtualService` hosts from the specified namespace (e.g.,`prod/*`).
  //
  // The `namespace` can be set to `*` or `.`, representing any or the current
  // namespace, respectively. For example, `*/foo.example.com` selects the
  // service from any available namespace while `./foo.example.com` only selects
  // the service from the namespace of the sidecar. The default, if no
  // `namespace/` is specified, is `*/`, that is, select services from any
  // namespace. Any associated `DestinationRule` in the selected namespace will
  // also be used.
  //
  // A `VirtualService` must be bound to the gateway and must have one or
  // more hosts that match the hosts specified in a server. The match
  // could be an exact match or a suffix match with the server's hosts. For
  // example, if the server's hosts specifies `*.example.com`, a
  // `VirtualService` with hosts `dev.example.com` or `prod.example.com` will
  // match. However, a `VirtualService` with host `example.com` or
  // `newexample.com` will not match.
  //
  // NOTE: Only virtual services exported to the gateway's namespace
  // (e.g., `exportTo` value of `*`) can be referenced.
  // Private configurations (e.g., `exportTo` set to `.`) will not be
  // available. Refer to the `exportTo` setting in `VirtualService`,
  // `DestinationRule`, and `ServiceEntry` configurations for details.
  hosts?: string[];
  // Set of TLS related options that govern the server's behavior. Use
  // these options to control if all http requests should be redirected to
  // https, and the TLS modes to use.
  tls?: ServerTLSSettings;
  // The loopback IP endpoint or Unix domain socket to which traffic should
  // be forwarded to by default. Format should be `127.0.0.1:PORT` or
  // `unix:///path/to/socket` or `unix://@foobar` (Linux abstract namespace).
  // NOT IMPLEMENTED.
  // $hide_from_docs
  defaultEndpoint?: string;
  // An optional name of the server, when set must be unique across all servers.
  // This will be used for variety of purposes like prefixing stats generated with
  // this name etc.
  name?: string;
}

export interface GatewaySpec {
  // A list of server specifications.
  servers?: Server[];
  // One or more labels that indicate a specific set of pods/VMs
  // on which this gateway configuration should be applied.
  // By default workloads are searched across all namespaces based on label selectors.
  // This implies that a gateway resource in the namespace "foo" can select pods in
  // the namespace "bar" based on labels.
  // This behavior can be controlled via the `PILOT_SCOPE_GATEWAY_TO_NAMESPACE`
  // environment variable in istiod. If this variable is set
  // to true, the scope of label search is restricted to the configuration
  // namespace in which the the resource is present. In other words, the Gateway
  // resource must reside in the same namespace as the gateway workload
  // instance.
  // If selector is nil, the Gateway will be applied to all workloads.
  selector?: Map<string, string>;
}

@autobind()
export class Gateway extends KubeObject {
  static kind = "Gateway";
  spec: GatewaySpec;

  getOwnerNamespace(): string {
    if (this.metadata.labels == undefined) {
      return "";
    }
    return this.metadata.labels.namespace != undefined
      ? this.metadata.labels.namespace
      : "";
  }
}

export const gateWayApi = new KubeApi({
  kind: Gateway.kind,
  apiBase: "/apis/networking.istio.io/v1beta1/gateways",
  isNamespaced: true,
  objectConstructor: Gateway,
  request: apiIstio,
});
