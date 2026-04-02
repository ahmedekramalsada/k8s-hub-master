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
            <h2>🔒 Security & RBAC</h2>
            <p>Kubernetes security is multi-layered: cluster access control (RBAC), pod-level isolation (SecurityContext, Pod Security Standards), network isolation (NetworkPolicy), and secrets management. A production cluster must implement all layers.</p>

            <h3>RBAC — Role-Based Access Control</h3>
            <p>RBAC controls who can do what in Kubernetes. The model has four objects:</p>
            <ul>
                <li><strong>Role</strong> — grants permissions within a namespace</li>
                <li><strong>ClusterRole</strong> — grants permissions cluster-wide (or for cluster-scoped resources)</li>
                <li><strong>RoleBinding</strong> — binds a Role to subjects (users, groups, ServiceAccounts) in a namespace</li>
                <li><strong>ClusterRoleBinding</strong> — binds a ClusterRole to subjects cluster-wide</li>
            </ul>

            <CodeBlock lang="RBAC FLOW" code={`Subject (WHO)          Binding (HOW)        Role (WHAT)
─────────────          ─────────────        ──────────────────
User "alice"     →  RoleBinding        →  Role "pod-reader"
Group "devs"     →  ClusterRoleBinding →  ClusterRole "reader"
ServiceAccount   →  RoleBinding        →  Role "deployer"
"app-sa"

Role says: apiGroup=apps, resources=deployments, verbs=get,list,update`} />

            <CodeBlock lang="rbac.yaml" code={`# Role: can read pods and logs in 'production' namespace
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: production
rules:
- apiGroups: [""]              # "" = core API group
  resources: ["pods", "pods/log"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list"]
---
# Bind the role to a ServiceAccount
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods-binding
  namespace: production
subjects:
- kind: ServiceAccount
  name: monitoring-sa
  namespace: monitoring        # SA can be in a different namespace!
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io`} />

            <Callout type="warning">
                Avoid giving <code>cluster-admin</code> or wildcard (<code>*</code>) verbs to any ServiceAccount.
                Use <code>kubectl auth can-i --list --as=system:serviceaccount:ns:sa-name</code> to audit what a
                ServiceAccount can do.
            </Callout>

            <h3>ServiceAccount — Pod Identity</h3>
            <p>Every pod runs with a ServiceAccount identity. By default, Kubernetes mounts a token for the <code>default</code> ServiceAccount. Always create dedicated ServiceAccounts with minimal permissions.</p>

            <CodeBlock lang="serviceaccount.yaml" code={`apiVersion: v1
kind: ServiceAccount
metadata:
  name: api-sa
  namespace: production
automountServiceAccountToken: false   # disable auto-mount; mount explicitly if needed
---
# In the pod spec:
spec:
  serviceAccountName: api-sa
  containers:
  - name: api
    # If you need the token, project it with controlled expiry:
    volumeMounts:
    - mountPath: /var/run/secrets/tokens
      name: api-token
  volumes:
  - name: api-token
    projected:
      sources:
      - serviceAccountToken:
          path: token
          expirationSeconds: 3600    # token expires every hour`} />

            <h3>Pod Security Standards (PSS)</h3>
            <p>PSS replaced the deprecated PodSecurityPolicy (PSP). It defines three profiles enforced via namespace labels:</p>
            <ul>
                <li><strong>Privileged</strong> — No restrictions. Only for trusted infrastructure pods (CNI, storage drivers).</li>
                <li><strong>Baseline</strong> — Prevents known privilege escalations. Good starting point for most apps.</li>
                <li><strong>Restricted</strong> — Heavily restricted. Required for CIS benchmarks and compliance.</li>
            </ul>
            <CodeBlock lang="namespace-pss.yaml" code={`apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    # Enforce restricted PSS on all pods in this namespace
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest
    # Warn (but allow) on audit logs too
    pod-security.kubernetes.io/warn: restricted
    pod-security.kubernetes.io/audit: restricted`} />

            <h3>SecurityContext — Hardening Individual Pods</h3>
            <p>Set security constraints at both pod level and container level:</p>
            <CodeBlock lang="securitycontext.yaml" code={`spec:
  # Pod-level security context
  securityContext:
    runAsNonRoot: true           # reject if container runs as root
    runAsUser: 1000              # run as UID 1000
    runAsGroup: 3000
    fsGroup: 2000                # volume files owned by this group
    seccompProfile:
      type: RuntimeDefault       # restrict syscalls (PSS Restricted required)

  containers:
  - name: app
    # Container-level security context
    securityContext:
      allowPrivilegeEscalation: false  # cannot gain more privileges
      readOnlyRootFilesystem: true     # immutable filesystem
      capabilities:
        drop:
        - ALL                    # drop all Linux capabilities
        add:
        - NET_BIND_SERVICE       # only add back what's needed`} />

            <h3>Secrets Management</h3>
            <p>Kubernetes Secrets are base64-encoded (not encrypted) by default. For production, use these approaches:</p>
            <ul>
                <li><strong>Encryption at Rest:</strong> Enable <code>EncryptionConfiguration</code> on the API server to encrypt Secret data in etcd.</li>
                <li><strong>Sealed Secrets (Bitnami):</strong> Encrypt secrets offline, commit the sealed version to Git. Only the controller in the cluster can decrypt.</li>
                <li><strong>External Secrets Operator:</strong> Sync secrets from AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault into K8s Secrets automatically.</li>
                <li><strong>CSI Secret Store Driver:</strong> Mount secrets directly from external vaults as Pod volumes — never stored in etcd.</li>
            </ul>

            <Callout type="prod">
                The gold standard: use <strong>External Secrets Operator + AWS Secrets Manager</strong> (or Vault).
                Secrets live in your cloud provider's encrypted vault. ESO syncs them into K8s Secrets on demand.
                Never commit unencrypted secrets to Git — use <code>git-secrets</code> or <code>detect-secrets</code> pre-commit hooks.
            </Callout>

            <h3>Admission Controllers</h3>
            <p>Admission controllers intercept API requests and can mutate or validate them before objects are persisted. Critical for security:</p>
            <ul>
                <li><strong>OPA Gatekeeper / Kyverno</strong> — Policy-as-code. Block non-compliant resources: "no latest tags", "all pods must have resource limits", "must have specific labels".</li>
                <li><strong>ImagePolicyWebhook</strong> — Validate that images come from trusted registries and have passed vulnerability scanning.</li>
                <li><strong>MutatingAdmissionWebhook</strong> — Inject sidecars (Istio proxy, Vault agent) automatically without modifying pod specs.</li>
            </ul>
        </div>
    );
}
