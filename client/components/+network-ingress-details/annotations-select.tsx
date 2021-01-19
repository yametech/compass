import React from "react";
import {computed} from "mobx";
import {observer} from "mobx-react";
import {t, Trans} from "@lingui/macro";
import {Select, SelectOption, SelectProps} from "../select";
import {cssNames, noop} from "../../utils";
import {Icon} from "../icon";
import {_i18n} from "../../i18n";

interface Props extends SelectProps {
  showIcons?: boolean;
  showClusterOption?: boolean; // show cluster option on the top (default: false)
  clusterOptionLabel?: React.ReactNode; // label for cluster option (default: "Cluster")

  namespace?: string;

  customizeOptions?(nsOptions: SelectOption[]): SelectOption[];
}

const defaultProps: Partial<Props> = {
  showIcons: true,
  showClusterOption: false,
  namespace: '',
  get clusterOptionLabel() {
    return _i18n._(t`Secret`);
  },
};

@observer
export class AnnotationsSelect extends React.Component<Props> {
  static defaultProps = defaultProps as object;

  @computed get options(): SelectOption[] {
    const annotationsList = [
      'nginx.ingress.kubernetes.io/app-root',
      'nginx.ingress.kubernetes.io/affinity',
      'nginx.ingress.kubernetes.io/affinity-mode',
      'nginx.ingress.kubernetes.io/auth-realm',
      'nginx.ingress.kubernetes.io/auth-secret',
      'nginx.ingress.kubernetes.io/auth-secret-type',
      'nginx.ingress.kubernetes.io/auth-type',
      'nginx.ingress.kubernetes.io/auth-tls-secret',
      'nginx.ingress.kubernetes.io/auth-tls-verify-depth',
      'nginx.ingress.kubernetes.io/auth-tls-verify-client',
      'nginx.ingress.kubernetes.io/auth-tls-error-page',
      'nginx.ingress.kubernetes.io/auth-tls-pass-certificate-to-upstream',
      'nginx.ingress.kubernetes.io/auth-url',
      'nginx.ingress.kubernetes.io/auth-cache-key',
      'nginx.ingress.kubernetes.io/auth-cache-duration',
      'nginx.ingress.kubernetes.io/auth-proxy-set-headers',
      'nginx.ingress.kubernetes.io/auth-snippet',
      'nginx.ingress.kubernetes.io/enable-global-auth',
      'nginx.ingress.kubernetes.io/backend-protocol',
      'nginx.ingress.kubernetes.io/canary',
      'nginx.ingress.kubernetes.io/canary-by-header',
      'nginx.ingress.kubernetes.io/canary-by-header-value',
      'nginx.ingress.kubernetes.io/canary-by-header-pattern',
      'nginx.ingress.kubernetes.io/canary-by-cookie',
      'nginx.ingress.kubernetes.io/canary-weight',
      'nginx.ingress.kubernetes.io/client-body-buffer-size',
      'nginx.ingress.kubernetes.io/configuration-snippet',
      'nginx.ingress.kubernetes.io/custom-http-errors',
      'nginx.ingress.kubernetes.io/default-backend',
      'nginx.ingress.kubernetes.io/enable-cors',
      'nginx.ingress.kubernetes.io/cors-allow-origin',
      'nginx.ingress.kubernetes.io/cors-allow-methods',
      'nginx.ingress.kubernetes.io/cors-allow-headers',
      'nginx.ingress.kubernetes.io/cors-expose-headers',
      'nginx.ingress.kubernetes.io/cors-allow-credentials',
      'nginx.ingress.kubernetes.io/cors-max-age',
      'nginx.ingress.kubernetes.io/force-ssl-redirect',
      'nginx.ingress.kubernetes.io/from-to-www-redirect',
      'nginx.ingress.kubernetes.io/http2-push-preload',
      'nginx.ingress.kubernetes.io/limit-connections',
      'nginx.ingress.kubernetes.io/limit-rps',
      'nginx.ingress.kubernetes.io/global-rate-limit',
      'nginx.ingress.kubernetes.io/global-rate-limit-window',
      'nginx.ingress.kubernetes.io/global-rate-limit-key',
      'nginx.ingress.kubernetes.io/global-rate-limit-ignored-cidrs',
      'nginx.ingress.kubernetes.io/permanent-redirect',
      'nginx.ingress.kubernetes.io/permanent-redirect-code',
      'nginx.ingress.kubernetes.io/temporal-redirect',
      'nginx.ingress.kubernetes.io/proxy-body-size',
      'nginx.ingress.kubernetes.io/proxy-cookie-domain',
      'nginx.ingress.kubernetes.io/proxy-cookie-path',
      'nginx.ingress.kubernetes.io/proxy-connect-timeout',
      'nginx.ingress.kubernetes.io/proxy-send-timeout',
      'nginx.ingress.kubernetes.io/proxy-read-timeout',
      'nginx.ingress.kubernetes.io/proxy-next-upstream',
      'nginx.ingress.kubernetes.io/proxy-next-upstream-timeout',
      'nginx.ingress.kubernetes.io/proxy-next-upstream-tries',
      'nginx.ingress.kubernetes.io/proxy-request-buffering',
      'nginx.ingress.kubernetes.io/proxy-redirect-from',
      'nginx.ingress.kubernetes.io/proxy-redirect-to',
      'nginx.ingress.kubernetes.io/proxy-http-version',
      'nginx.ingress.kubernetes.io/proxy-ssl-secret',
      'nginx.ingress.kubernetes.io/proxy-ssl-ciphers',
      'nginx.ingress.kubernetes.io/proxy-ssl-name',
      'nginx.ingress.kubernetes.io/proxy-ssl-protocols',
      'nginx.ingress.kubernetes.io/proxy-ssl-verify',
      'nginx.ingress.kubernetes.io/proxy-ssl-verify-depth',
      'nginx.ingress.kubernetes.io/proxy-ssl-server-name',
      'nginx.ingress.kubernetes.io/enable-rewrite-log',
      'nginx.ingress.kubernetes.io/rewrite-target',
      'nginx.ingress.kubernetes.io/satisfy',
      'nginx.ingress.kubernetes.io/server-alias',
      'nginx.ingress.kubernetes.io/server-snippet',
      'nginx.ingress.kubernetes.io/service-upstream',
      'nginx.ingress.kubernetes.io/session-cookie-name',
      'nginx.ingress.kubernetes.io/session-cookie-path',
      'nginx.ingress.kubernetes.io/session-cookie-change-on-failure',
      'nginx.ingress.kubernetes.io/session-cookie-samesite',
      'nginx.ingress.kubernetes.io/session-cookie-conditional-samesite-none',
      'nginx.ingress.kubernetes.io/ssl-redirect',
      'nginx.ingress.kubernetes.io/ssl-passthrough',
      'nginx.ingress.kubernetes.io/upstream-hash-by',
      'nginx.ingress.kubernetes.io/x-forwarded-prefix',
      'nginx.ingress.kubernetes.io/load-balance',
      'nginx.ingress.kubernetes.io/upstream-vhost',
      'nginx.ingress.kubernetes.io/whitelist-source-range',
      'nginx.ingress.kubernetes.io/proxy-buffering',
      'nginx.ingress.kubernetes.io/proxy-buffers-number',
      'nginx.ingress.kubernetes.io/proxy-buffer-size',
      'nginx.ingress.kubernetes.io/proxy-max-temp-file-size',
      'nginx.ingress.kubernetes.io/ssl-ciphers',
      'nginx.ingress.kubernetes.io/ssl-prefer-server-ciphers',
      'nginx.ingress.kubernetes.io/connection-proxy-header',
      'nginx.ingress.kubernetes.io/enable-access-log',
      'nginx.ingress.kubernetes.io/enable-opentracing',
      'nginx.ingress.kubernetes.io/enable-influxdb',
      'nginx.ingress.kubernetes.io/influxdb-measurement',
      'nginx.ingress.kubernetes.io/influxdb-port',
      'nginx.ingress.kubernetes.io/influxdb-host',
      'nginx.ingress.kubernetes.io/influxdb-server-name',
      'nginx.ingress.kubernetes.io/use-regex',
      'nginx.ingress.kubernetes.io/enable-modsecurity',
      'nginx.ingress.kubernetes.io/enable-owasp-core-rules',
      'nginx.ingress.kubernetes.io/modsecurity-transaction-id',
      'nginx.ingress.kubernetes.io/modsecurity-snippet',
      'nginx.ingress.kubernetes.io/mirror-request-body',
      'nginx.ingress.kubernetes.io/mirror-target'
    ];
    const {customizeOptions, showClusterOption, clusterOptionLabel, namespace} = this.props;
    let options: SelectOption[];
    options = annotationsList.map(item => ({ value: item }));
    options = customizeOptions ? customizeOptions(options) : options;
    if (showClusterOption) {
      options.unshift({value: null, label: clusterOptionLabel});
    }
    return options;
  }

  formatOptionLabel = (option: SelectOption) => {
    const {showIcons} = this.props;
    const {value, label} = option;
    return label || (
      <div>
        {showIcons && <Icon small material="layers" className="primary" />}
        {value}
      </div>
    );
  }

  render() {
    const {className, showIcons, showClusterOption, clusterOptionLabel, customizeOptions, ...selectProps} = this.props;
    return (
      <Select
        className={cssNames("ServicesSelect", className)}
        menuClass="SecretsSelect"
        formatOptionLabel={this.formatOptionLabel}
        options={this.options}
        {...selectProps}
      />
    );
  }
}
