import React, { useState } from 'react';

function CodeBlock({ lang, code }) {
    const [copied, setCopied] = useState(false);
    const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
        <div className="code-window">
            <div className="code-header">
                <div className="window-controls"><span className="wc-dot wc-red" /><span className="wc-dot wc-yellow" /><span className="wc-dot wc-green" /></div>
                <span className="code-lang">{lang}</span>
                <button className="btn btn-sm btn-ghost" onClick={copy} style={{ padding: '2px 10px', fontSize: 11 }}>{copied ? '✓ Copied' : 'Copy'}</button>
            </div>
            <pre>{code}</pre>
        </div>
    );
}

function Callout({ type, children }) {
    const s = { tip: { c: 'var(--color-emerald)', bg: 'rgba(16,185,129,0.08)', icon: '💡', l: 'Pro Tip' }, warning: { c: 'var(--color-amber)', bg: 'rgba(245,158,11,0.08)', icon: '⚠️', l: 'Warning' }, info: { c: 'var(--color-primary-light)', bg: 'rgba(99,102,241,0.08)', icon: 'ℹ️', l: 'Note' }, prod: { c: 'var(--color-rose)', bg: 'rgba(239,68,95,0.08)', icon: '🚀', l: 'Production' } }[type] || {};
    return <div style={{ borderLeft: `3px solid ${s.c}`, background: s.bg, borderRadius: '0 8px 8px 0', padding: '12px 16px', margin: '16px 0' }}><div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: s.c }}>{s.icon} {s.l}</div><div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{children}</div></div>;
}

export default function TheoryContent() {
    return (
        <div className="content-block">
            <h2>⚓ Helm & Package Management</h2>
            <p>Helm is the package manager for Kubernetes. It bundles related Kubernetes resources into a single deployable unit called a <strong>chart</strong>, adds template-based configuration, and tracks deployment history for rollbacks.</p>

            <h3>Why Helm?</h3>
            <p>Without Helm, deploying a production application means managing 5–15 separate YAML files (Deployment, Service, Ingress, ConfigMap, Secret, HPA, RBAC...). Helm solves this by:</p>
            <ul>
                <li><strong>Packaging</strong> — All resources in one chart, versioned together</li>
                <li><strong>Templating</strong> — Use Go templates and values files to generate environment-specific YAML</li>
                <li><strong>Release Management</strong> — Track what's deployed, when, and with what values</li>
                <li><strong>Rollback</strong> — <code>helm rollback my-app 3</code> restores any previous revision instantly</li>
            </ul>

            <h3>Chart Structure</h3>
            <CodeBlock lang="CHART STRUCTURE" code={`my-app/
├── Chart.yaml             # chart metadata (name, version, dependencies)
├── values.yaml            # default configuration values
├── values-production.yaml # environment override values
├── templates/
│   ├── deployment.yaml    # Go-templated K8s manifests
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── secret.yaml
│   ├── hpa.yaml
│   ├── _helpers.tpl       # reusable template helpers (macros)
│   └── NOTES.txt          # printed after helm install
├── charts/                # sub-chart dependencies
└── .helmignore`} />

            <h3>Chart.yaml — Chart Metadata</h3>
            <CodeBlock lang="Chart.yaml" code={`apiVersion: v2
name: my-api
description: Production API service Helm chart
type: application       # or 'library' for reusable helpers
version: 1.3.0          # chart version (SemVer)
appVersion: "2.5.1"     # your application version

dependencies:
- name: postgresql       # sub-chart from bitnami repo
  version: "13.x.x"
  repository: "https://charts.bitnami.com/bitnami"
  condition: postgresql.enabled   # can disable via values.yaml`} />

            <h3>values.yaml — Configuration</h3>
            <CodeBlock lang="values.yaml" code={`# Default values — override with -f values-prod.yaml
replicaCount: 2

image:
  repository: myregistry/api
  tag: "2.5.1"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: nginx
  host: api.example.com
  tls: true
  clusterIssuer: letsencrypt-prod

resources:
  requests:
    cpu: "250m"
    memory: "256Mi"
  limits:
    cpu: "1"
    memory: "512Mi"

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

postgresql:
  enabled: true         # enable the postgresql sub-chart`} />

            <h3>Templates — Go Templating</h3>
            <CodeBlock lang="templates/deployment.yaml" code={`apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "my-app.fullname" . }}   # from _helpers.tpl
  namespace: {{ .Release.Namespace }}
  labels:
    {{- include "my-app.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "my-app.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "my-app.selectorLabels" . | nindent 8 }}
    spec:
      containers:
      - name: {{ .Chart.Name }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        imagePullPolicy: {{ .Values.image.pullPolicy }}
        ports:
        - containerPort: 80
        resources:
          {{- toYaml .Values.resources | nindent 10 }}
        {{- if .Values.autoscaling.enabled }}
        # HPA will manage replicas
        {{- end }}`} />

            <h3>Helm Commands Reference</h3>
            <CodeBlock lang="bash" code={`# ── Repositories ─────────────────────────────────────────────
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update                    # refresh repo indices
helm search repo nginx              # find charts

# ── Install / Upgrade ─────────────────────────────────────────
helm install my-app ./my-chart \
  -n production \
  -f values-production.yaml \
  --set image.tag=2.5.1              # override single value

helm upgrade my-app ./my-chart \
  -n production \
  -f values-production.yaml \
  --atomic \                         # roll back automatically if upgrade fails
  --timeout 5m

# Install if not exists, upgrade if exists:
helm upgrade --install my-app ./my-chart -n production

# ── Inspection ────────────────────────────────────────────────
helm list -n production             # list releases
helm status my-app -n production    # show release status
helm history my-app -n production   # show all revisions
helm get values my-app -n production # show deployed values
helm get manifest my-app -n production # show rendered YAML

# ── Rollback / Uninstall ──────────────────────────────────────
helm rollback my-app 3 -n production   # roll back to revision 3
helm uninstall my-app -n production    # delete release + resources

# ── Template Debugging ────────────────────────────────────────
helm template my-app ./my-chart -f values-prod.yaml  # render without installing
helm lint ./my-chart                   # check for errors
helm install my-app ./my-chart --dry-run --debug      # simulate install`} />

            <h3>Helm Hooks</h3>
            <p>Hooks let you run actions at specific points in the release lifecycle. Common patterns:</p>
            <CodeBlock lang="pre-install-hook.yaml" code={`apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
  annotations:
    "helm.sh/hook": pre-install,pre-upgrade    # run BEFORE install/upgrade
    "helm.sh/hook-weight": "-5"                # lower = runs first
    "helm.sh/hook-delete-policy": hook-succeeded # clean up after success
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: migrate
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        command: ["python", "manage.py", "migrate"]`} />

            <Callout type="tip">
                Available hooks: <code>pre-install</code>, <code>post-install</code>, <code>pre-upgrade</code>,
                <code>post-upgrade</code>, <code>pre-rollback</code>, <code>post-rollback</code>, <code>pre-delete</code>,
                <code>post-delete</code>, <code>test</code>. Use <code>pre-install</code> + <code>pre-upgrade</code> for
                database migrations.
            </Callout>

            <h3>OCI Chart Registries (Helm 3.8+)</h3>
            <p>Charts can be stored in OCI registries (same as Docker images) for better access control and versioning:</p>
            <CodeBlock lang="bash" code={`# Push chart to OCI registry
helm package ./my-chart
helm push my-chart-1.3.0.tgz oci://registry.example.com/charts

# Install from OCI registry
helm install my-app oci://registry.example.com/charts/my-chart --version 1.3.0`} />

            <h3>Helmfile — Managing Multiple Charts</h3>
            <p>For complex platforms with many charts, <strong>Helmfile</strong> describes all your Helm releases declaratively in a single file:</p>
            <CodeBlock lang="helmfile.yaml" code={`repositories:
- name: bitnami
  url: https://charts.bitnami.com/bitnami

releases:
- name: postgresql
  namespace: databases
  chart: bitnami/postgresql
  version: 13.2.0
  values:
  - values/postgresql.yaml

- name: api
  namespace: production
  chart: ./charts/my-api
  values:
  - values/api-production.yaml
  needs:              # deploy after postgresql
  - databases/postgresql`} />
        </div>
    );
}
