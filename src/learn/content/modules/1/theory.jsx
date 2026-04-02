import React, { useState } from 'react';

function CodeBlock({ title, lang, code }) {
    const [copied, setCopied] = useState(false);
    const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
        <div className="code-window">
            <div className="code-header">
                <div className="window-controls"><span className="wc-dot wc-red" /><span className="wc-dot wc-yellow" /><span className="wc-dot wc-green" /></div>
                <span className="code-lang">{lang || title}</span>
                <button className="btn btn-sm btn-ghost" onClick={copy} style={{ padding: '2px 10px', fontSize: 11 }}>{copied ? '✓ Copied' : 'Copy'}</button>
            </div>
            <pre>{code}</pre>
        </div>
    );
}

function Callout({ type, children }) {
    const s = { tip: { c: 'var(--color-emerald)', bg: 'rgba(16,185,129,0.08)', icon: '💡', l: 'Pro Tip' }, warning: { c: 'var(--color-amber)', bg: 'rgba(245,158,11,0.08)', icon: '⚠️', l: 'Warning' }, info: { c: 'var(--color-primary-light)', bg: 'rgba(99,102,241,0.08)', icon: 'ℹ️', l: 'Note' }, prod: { c: 'var(--color-rose)', bg: 'rgba(239,68,95,0.08)', icon: '🚀', l: 'Production' } }[type] || { c: 'var(--color-primary-light)', bg: 'rgba(99,102,241,0.08)', icon: 'ℹ️', l: 'Note' };
    return <div style={{ borderLeft: `3px solid ${s.c}`, background: s.bg, borderRadius: '0 8px 8px 0', padding: '12px 16px', margin: '16px 0' }}><div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: s.c }}>{s.icon} {s.l}</div><div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{children}</div></div>;
}

export default function TheoryContent() {
    return (
        <div className="content-block">
            <h2>☸️ Kubernetes Core Concepts</h2>
            <p>Kubernetes (K8s) is an open-source container orchestration system. It automates deployment, scaling, and management of containerized applications across a cluster of machines. Think of it as an operating system for your data center.</p>

            <h3>The Cluster Architecture</h3>
            <p>A Kubernetes cluster has two kinds of nodes: the <strong>Control Plane</strong> (the brain) and <strong>Worker Nodes</strong> (the muscle).</p>

            <CodeBlock lang="CLUSTER ARCHITECTURE" code={`┌─────────────────────────────────────────────────────────┐
│                    CONTROL PLANE                        │
│                                                         │
│  ┌──────────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  API Server  │  │  etcd    │  │  Controller Mgr  │  │
│  │ (kube-apiserv│  │(key-value│  │ (watches + fixes) │  │
│  │  er)         │  │  store)  │  │                  │  │
│  └──────┬───────┘  └──────────┘  └──────────────────┘  │
│         │                ▲           ┌──────────────┐   │
│         │                │           │  Scheduler   │   │
│         │                └───────────│ (pod→node)   │   │
│         │                            └──────────────┘   │
└─────────┼───────────────────────────────────────────────┘
          │ (watches API / reports status)
    ┌─────▼──────────────────────────────────────┐
    │               WORKER NODE                  │
    │  ┌──────────┐  ┌───────────┐  ┌─────────┐  │
    │  │  kubelet │  │kube-proxy │  │containerd│  │
    │  │(node agent│  │(networking│  │(runtime) │  │
    │  │          │  │ rules)    │  │          │  │
    │  └──────────┘  └───────────┘  └─────────┘  │
    │                                             │
    │  ┌────────────────────────────────────────┐ │
    │  │  Pod  │  Pod  │  Pod  │  Pod  │  Pod  │ │
    │  └────────────────────────────────────────┘ │
    └─────────────────────────────────────────────┘`} />

            <ul>
                <li><strong>kube-apiserver:</strong> The front door to K8s. All kubectl commands, controllers, and UI tools talk to this REST API. The only component that writes to etcd.</li>
                <li><strong>etcd:</strong> Distributed key-value store. The source of truth for all cluster state (what pods exist, what nodes are healthy, etc.). Back this up!</li>
                <li><strong>kube-scheduler:</strong> Watches for new pods with no assigned node. Scores all available nodes and picks the best one based on resources, affinity, taints, etc.</li>
                <li><strong>kube-controller-manager:</strong> Runs control loops. Deployment controller checks "are there 3 replicas?" If not, it creates more pods. Node controller watches for dead nodes.</li>
                <li><strong>kubelet:</strong> The agent on every worker node. It watches the API server for pods assigned to its node and manages their lifecycle via the container runtime.</li>
                <li><strong>kube-proxy:</strong> Maintains iptables/ipvs rules on every node so that traffic to a Service IP is correctly routed to the right pods.</li>
            </ul>

            <h3>Pod — The Atomic Unit</h3>
            <p>
                A <strong>Pod</strong> is the smallest deployable unit in Kubernetes. It wraps one or more containers that
                share the same network namespace (same IP address) and can share volumes. Always prefer one container per pod — multi-container pods are for specific patterns (sidecar, ambassador, adapter).
            </p>

            <CodeBlock lang="pod.yaml" code={`apiVersion: v1
kind: Pod
metadata:
  name: web-server
  namespace: production
  labels:
    app: web           # used by Services and Deployments to find this pod
    version: "v2.1"
spec:
  containers:
  - name: nginx
    image: nginx:1.25.3   # always pin the version!
    ports:
    - containerPort: 80
    resources:
      requests:           # minimum guaranteed resources
        cpu: "100m"       # 100 millicores = 0.1 CPU
        memory: "128Mi"
      limits:             # hard ceiling — OOMKilled if exceeded
        cpu: "500m"
        memory: "256Mi"
    livenessProbe:        # restart if this fails
      httpGet:
        path: /healthz
        port: 80
      initialDelaySeconds: 15
      periodSeconds: 20
    readinessProbe:       # remove from Service if this fails
      httpGet:
        path: /ready
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 10`} />

            <Callout type="info">
                <strong>Requests vs Limits:</strong> The scheduler uses <em>requests</em> to decide which node a pod can fit on.
                The kubelet uses <em>limits</em> to throttle CPU (never killed for CPU) or kill the container for memory (OOMKilled).
                Set requests = 80% of your actual usage. Set limits = 2x requests.
            </Callout>

            <h3>QoS Classes — How Kubernetes Prioritizes Eviction</h3>
            <p>Kubernetes assigns a Quality of Service class based on resource definitions. When a node runs out of memory, pods are evicted in QoS order:</p>
            <ul>
                <li><strong>BestEffort</strong> — evicted first. No requests or limits set at all.</li>
                <li><strong>Burstable</strong> — evicted second. Requests set, limits different (or missing).</li>
                <li><strong>Guaranteed</strong> — evicted last. Requests = Limits for every container. Use for critical workloads.</li>
            </ul>

            <h3>Deployment — Managing Replicas with Zero Downtime</h3>
            <p>
                You should almost never create pods directly. A <strong>Deployment</strong> manages a <strong>ReplicaSet</strong> which ensures
                your desired number of pod replicas are always running. When you update a Deployment (e.g. new image version),
                it performs a rolling update without downtime.
            </p>

            <CodeBlock lang="deployment.yaml" code={`apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
  namespace: production
spec:
  replicas: 3                    # always run 3 copies
  selector:
    matchLabels:
      app: api-server            # manages pods with this label
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1                # can have 4 pods during update
      maxUnavailable: 0          # never go below 3 healthy pods
  template:
    metadata:
      labels:
        app: api-server
    spec:
      terminationGracePeriodSeconds: 30   # wait 30s for graceful shutdown
      containers:
      - name: api
        image: myregistry/api:2.1.0
        imagePullPolicy: IfNotPresent     # don't re-pull if image exists
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: "250m"
            memory: "256Mi"
          limits:
            cpu: "1"
            memory: "512Mi"
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:              # load from Secret, not hardcoded
              name: api-secret
              key: database-url
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 20
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
          failureThreshold: 3`} />

            <h3>The Pod Lifecycle</h3>
            <CodeBlock lang="POD LIFECYCLE" code={`kubectl create pod
       │
       ▼
  [Pending]  ← scheduler is finding a node
       │
       ▼  (node found, image pulled, container starting)
  [Running]  ← at least one container is running
       │
       ├──▶  [Succeeded]  ← all containers exited with code 0 (Jobs)
       │
       └──▶  [Failed]     ← container crashed (exit code != 0)
                                │
                          restartPolicy?
                          Always    → restart immediately (Deployments)
                          OnFailure → restart only on failure (Jobs)
                          Never     → don't restart

  [Unknown]  ← node unreachable, state unknown`} />

            <h3>Service — Stable Network Endpoint</h3>
            <p>
                Pods are ephemeral — they get new IPs every time they restart. A <strong>Service</strong> provides a stable
                IP and DNS name that load-balances traffic across all matching pods, regardless of how many times they restart.
            </p>
            <ul>
                <li><strong>ClusterIP</strong> (default) — internal only, reachable within the cluster</li>
                <li><strong>NodePort</strong> — opens a static port (30000–32767) on every node</li>
                <li><strong>LoadBalancer</strong> — provisions a cloud LB (AWS ALB, GCP LB, etc.)</li>
                <li><strong>Headless</strong> — <code>clusterIP: None</code>, returns direct pod IPs for StatefulSets</li>
            </ul>

            <CodeBlock lang="service.yaml" code={`apiVersion: v1
kind: Service
metadata:
  name: api-service
  namespace: production
spec:
  type: ClusterIP
  selector:
    app: api-server    # routes to all pods with this label
  ports:
  - name: http
    port: 80           # the port THIS service listens on
    targetPort: 8080   # the port the CONTAINER listens on`} />

            <Callout type="tip">
                Services use <strong>label selectors</strong> to find pods — not pod names. If you change a pod's labels,
                it immediately drops out of (or joins) a service. This is how blue/green deployments work in Kubernetes.
            </Callout>

            <h3>ConfigMap & Secret</h3>
            <p>
                Never hardcode configuration in container images. Use <strong>ConfigMaps</strong> for non-sensitive config
                (feature flags, app settings) and <strong>Secrets</strong> for sensitive data (passwords, API keys, TLS certs).
            </p>
            <Callout type="warning">
                Kubernetes Secrets are <strong>base64-encoded, not encrypted</strong> by default. Anyone with read access
                to the namespace can decode them. Use <strong>Sealed Secrets</strong>, <strong>External Secrets Operator</strong>,
                or <strong>Vault</strong> for production secret management.
            </Callout>

            <h3>Namespaces — Logical Cluster Isolation</h3>
            <p>Namespaces divide a cluster into virtual sub-clusters. Use them to separate environments (dev/staging/prod) or teams. Most resources are namespace-scoped; some (Nodes, ClusterRoles, PVs) are cluster-scoped.</p>
            <CodeBlock lang="bash" code={`# Common namespace pattern
kubectl create namespace production
kubectl create namespace staging
kubectl create namespace monitoring

# Always specify namespace or set a default
kubectl config set-context --current --namespace=production

# View resources across all namespaces
kubectl get pods --all-namespaces
kubectl get pods -A          # shorthand`} />

            <Callout type="prod">
                <strong>RBAC + Namespaces = Team Isolation.</strong> Assign each team their own namespace, then use
                RoleBindings to grant that team admin access to only their namespace. Use ResourceQuotas to prevent
                one team from consuming all cluster resources.
            </Callout>
        </div>
    );
}
