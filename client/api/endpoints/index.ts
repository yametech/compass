// Local express.js & endpoints
export * from "./config.api";
export * from "./cluster.api";
export * from "./kubeconfig.api";

// Kubernetes endpoints
// Docs: https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.10/
export * from "./namespaces.api";
export * from "./cluster-role.api";
export * from "./cluster-role-binding.api";
export * from "./role.api";
export * from "./role-binding.api";
export * from "./secret.api";
export * from "./service-accounts.api";
export * from "./nodes.api";
export * from "./pods.api";
export * from "./deployment.api";
export * from "./daemon-set.api";
export * from "./stateful-set.api";
export * from "./replica-set.api";
export * from "./job.api";
export * from "./cron-job.api";
export * from "./configmap.api";
export * from "./ingress.api";
export * from "./network-policy.api";
export * from "./persistent-volume-claims.api";
export * from "./persistent-volume.api";
export * from "./service.api";
export * from "./storage-class.api";
export * from "./pod-metrics.api";
export * from "./podsecuritypolicy.api";
export * from "./selfsubjectrulesreviews.api";
export * from "./ali-formrender.api";
export * from "./page.api";
export * from "./form.api";
export * from "./field.api";
export * from "./stone.api";
export * from "./enhance-stateful-set.api";
export * from "./endpoint.api";
export * from "./injector.api";
export * from "./workloads-deploy.api";
export * from "./tekton-stores.api";
export * from "./tekton-graph.api";
export * from "./tekton-pipeline.api";
export * from "./tekton-pipelinerun.api";
export * from "./tekton-task.api";
export * from "./tekton-pipelineresource.api";
export * from "./tekton-taskrun.api";
export * from "./tenant-department.api";
export * from "./tenant-user";
export * from "./tenant-role.api";
export * from "./subnet.api";
export * from "./network-attachment-definitions.api";
export * from "./istio-destination-rule.api";
export * from "./istio-gateway.api";
export * from "./istio-service-entry.api";
export * from "./istio-workload-entry.api";
export * from "./istio-virtual-service.api";
export * from "./istio-sidecar.api";
