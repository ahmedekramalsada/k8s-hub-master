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
            <h2>🌐 Kubernetes Networking</h2>
            <p>Kubernetes networking solves four distinct communication problems: container-to-container within a pod, pod-to-pod across the cluster, pod-to-Service, and external-to-Service. Understanding each layer is essential for building reliable production systems.</p>

            <h3>The Kubernetes Networking Model</h3>
            <p>Every pod gets a unique IP address — no NAT between pods. This "flat network" simplifies communication but requires a <strong>CNI (Container Network Interface)</strong> plugin to implement.</p>

            <CodeBlock lang="NETWORK LAYERS" code={`External Traffic
       │
       ▼
  [ Ingress Controller ]     ← L7 HTTP routing (host/path)
       │
       ▼
  [ Service (ClusterIP) ]    ← stable virtual IP + load balancing
       │
       ▼
  [ kube-proxy (iptables) ]  ← packet routing on every node
       │
       ▼
  [ CNI Plugin (Calico/Flannel/Cilium) ]  ← pod IP assignment & routing
       │
       ▼
  [ Pod IP: 10.244.x.x ]     ← unique per pod`} />

            <h3>Service Types — Deep Dive</h3>

            <h3>ClusterIP (Default)</h3>
            <p>Creates a virtual IP that load-balances traffic to matching pods. Only reachable within the cluster. Every service gets a DNS entry: <code>my-service.my-namespace.svc.cluster.local</code></p>
            <CodeBlock lang="clusterip-service.yaml" code={`apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: production
spec:
  type: ClusterIP        # default — omit or explicit
  selector:
    app: backend
  ports:
  - port: 80             # service listens on 80
    targetPort: 3000     # forwards to container port 3000`} />

            <h3>NodePort</h3>
            <p>Extends ClusterIP by also opening a static port (30000–32767) on every node's IP. Useful for development and bare-metal clusters. Traffic flows: <code>NodeIP:NodePort → ClusterIP → Pod</code></p>
            <Callout type="warning">NodePort exposes your service on every node — including control plane nodes. Not suitable for production without a reverse proxy or firewall in front.</Callout>

            <h3>LoadBalancer</h3>
            <p>Extends NodePort by automatically provisioning a cloud load balancer (AWS ALB/NLB, GCP LB, Azure LB). The cloud LB gets a public IP and forwards traffic to the NodePort on your nodes.</p>
            <Callout type="prod">In production, prefer <strong>one LoadBalancer → Ingress controller → many services</strong> over creating one LoadBalancer per service. A LoadBalancer service costs money per cloud LB provisioned.</Callout>

            <h3>Headless Service (StatefulSets)</h3>
            <p>Setting <code>clusterIP: None</code> makes a "headless" service. DNS returns individual pod IPs directly instead of the virtual IP. Required for StatefulSets where each pod has a stable identity.</p>
            <CodeBlock lang="headless-service.yaml" code={`apiVersion: v1
kind: Service
metadata:
  name: postgres-headless
spec:
  clusterIP: None        # headless!
  selector:
    app: postgres
  ports:
  - port: 5432
# DNS: postgres-0.postgres-headless.default.svc.cluster.local
#      postgres-1.postgres-headless.default.svc.cluster.local`} />

            <h3>Ingress — HTTP Routing at Layer 7</h3>
            <p>An <strong>Ingress</strong> routes external HTTP/HTTPS traffic to internal services based on hostnames and URL paths. It requires an <strong>Ingress Controller</strong> (nginx, Traefik, AWS ALB) to be installed in the cluster.</p>

            <CodeBlock lang="ingress.yaml" code={`apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  namespace: production
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/enable-cors: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.myapp.com
    secretName: api-tls       # cert-manager auto-creates this
  rules:
  - host: api.myapp.com
    http:
      paths:
      - path: /v1             # route /v1/* to api-v1 service
        pathType: Prefix
        backend:
          service:
            name: api-v1
            port:
              number: 80
      - path: /v2             # route /v2/* to api-v2 service
        pathType: Prefix
        backend:
          service:
            name: api-v2
            port:
              number: 80`} />

            <h3>CoreDNS — Cluster DNS</h3>
            <p>Kubernetes runs <strong>CoreDNS</strong> as a cluster add-on. Every pod is configured to use CoreDNS for DNS resolution. Service discovery works via DNS:</p>
            <CodeBlock lang="DNS Resolution" code={`# Within same namespace:
http://backend/api

# Cross-namespace (full DNS):
http://backend.production.svc.cluster.local/api

# Short form from another namespace:
http://backend.production/api

# StatefulSet pod DNS:
http://postgres-0.postgres-headless.production.svc.cluster.local`} />

            <h3>NetworkPolicy — Microsegmentation</h3>
            <p>By default, all pods can talk to all other pods (cluster-wide). <strong>NetworkPolicies</strong> restrict traffic using label selectors. They are enforced by the CNI plugin (must support NetworkPolicy — Calico, Cilium do; Flannel doesn't by default).</p>

            <CodeBlock lang="network-policy.yaml" code={`# Default-deny all ingress + egress (start strict, allow explicitly)
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}   # applies to ALL pods in namespace
  policyTypes:
  - Ingress
  - Egress
---
# Now allow: frontend → backend on port 3000 only
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 3000`} />

            <Callout type="prod">Always apply <strong>default-deny</strong> NetworkPolicies first, then explicitly allow only required traffic. This "zero-trust networking" approach limits blast radius if one service is compromised.</Callout>

            <h3>CNI Plugin Comparison</h3>
            <ul>
                <li><strong>Flannel</strong> — Simplest overlay network. No NetworkPolicy support. Good for dev clusters.</li>
                <li><strong>Calico</strong> — Popular production choice. NetworkPolicy + BGP routing. Used on GKE, AKS.</li>
                <li><strong>Cilium</strong> — eBPF-based, highest performance. Advanced observability with Hubble. Recommended for new production clusters.</li>
                <li><strong>Weave Net</strong> — Simple encryption built-in. Good for multi-cloud.</li>
            </ul>
        </div>
    );
}
