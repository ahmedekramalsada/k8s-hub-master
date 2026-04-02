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
            <h2>⚙️ Advanced Scheduling & Workloads</h2>
            <p>Beyond Deployments, Kubernetes has specialized workload controllers for every use case: DaemonSets for node-level agents, Jobs for one-off tasks, CronJobs for scheduled work, and advanced scheduling controls for fine-grained node placement.</p>

            <h3>DaemonSet — One Pod Per Node</h3>
            <p>A <strong>DaemonSet</strong> ensures exactly one copy of a pod runs on every node (or a subset). As nodes are added or removed, pods are automatically scheduled or garbage collected. Perfect for logging agents, monitoring exporters, and network proxies.</p>
            <CodeBlock lang="daemonset.yaml" code={`apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd-logging
  namespace: logging
spec:
  selector:
    matchLabels:
      app: fluentd
  updateStrategy:
    type: RollingUpdate      # update one node at a time
    rollingUpdate:
      maxUnavailable: 1
  template:
    metadata:
      labels:
        app: fluentd
    spec:
      tolerations:
      - operator: Exists     # run on ALL nodes, including tainted ones
      hostNetwork: true      # access host network interfaces
      containers:
      - name: fluentd
        image: fluent/fluentd:v1.16
        resources:
          requests:
            cpu: "100m"
            memory: "200Mi"
          limits:
            memory: "500Mi"
        volumeMounts:
        - name: varlog
          mountPath: /var/log
          readOnly: true
      volumes:
      - name: varlog
        hostPath:
          path: /var/log`} />

            <h3>Job — Run Once to Completion</h3>
            <p>A <strong>Job</strong> creates one or more pods and ensures a specified number of them successfully complete. If a pod fails, the Job creates a new one. Use for database migrations, batch processing, backups.</p>
            <CodeBlock lang="job.yaml" code={`apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
  namespace: production
spec:
  completions: 1         # need 1 successful completion
  parallelism: 1         # run 1 pod at a time
  backoffLimit: 3        # retry up to 3 times on failure
  activeDeadlineSeconds: 300   # kill if not done in 5 minutes
  ttlSecondsAfterFinished: 86400  # clean up job+pods after 24h
  template:
    spec:
      restartPolicy: OnFailure   # Never or OnFailure for Jobs
      containers:
      - name: migrator
        image: myapp/migrator:1.2.0
        command: ["python", "manage.py", "migrate"]
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url`} />

            <h3>CronJob — Scheduled Tasks</h3>
            <p>A <strong>CronJob</strong> creates Jobs on a cron schedule. As of K8s 1.27, timezone support is stable.</p>
            <CodeBlock lang="cronjob.yaml" code={`apiVersion: batch/v1
kind: CronJob
metadata:
  name: nightly-backup
  namespace: production
spec:
  schedule: "0 2 * * *"            # 2 AM every night (UTC)
  timeZone: "America/New_York"     # K8s 1.27+ timezone support!
  concurrencyPolicy: Forbid        # don't start if previous still running
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      backoffLimit: 2
      template:
        spec:
          restartPolicy: OnFailure
          containers:
          - name: backup
            image: myapp/backup-tool:latest
            command: ["/bin/sh", "-c", "pg_dump $DB_URL | gzip | aws s3 cp - s3://backups/$(date +%Y%m%d).sql.gz"]`} />

            <h3>HPA — Horizontal Pod Autoscaler</h3>
            <p>The <strong>HPA</strong> automatically scales the number of pod replicas based on observed metrics. It uses the Metrics Server (built-in CPU/memory) or custom/external metrics via the Metrics API.</p>
            <CodeBlock lang="hpa.yaml" code={`apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-server
  minReplicas: 3
  maxReplicas: 20
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300    # wait 5 min before scaling down
    scaleUp:
      stabilizationWindowSeconds: 60
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70     # scale when avg CPU > 70%
  - type: Resource
    resource:
      name: memory
      target:
        type: AverageValue
        averageValue: 400Mi        # scale when avg memory > 400Mi`} />

            <h3>Taints & Tolerations — Node Repulsion</h3>
            <p>A <strong>Taint</strong> on a node repels all pods that don't have a matching <strong>Toleration</strong>. Used to dedicate nodes to specific workloads (GPU nodes, high-memory nodes) or prevent scheduling during maintenance.</p>
            <CodeBlock lang="taints-tolerations.yaml" code={`# Taint a node (kubectl)
kubectl taint nodes gpu-node-1 gpu=true:NoSchedule
# Effect options: NoSchedule | PreferNoSchedule | NoExecute

# Toleration in pod spec (allows scheduling on this node)
spec:
  tolerations:
  - key: "gpu"
    operator: "Equal"
    value: "true"
    effect: "NoSchedule"

  # NoExecute evicts running pods unless they have this toleration:
  tolerations:
  - key: "node.kubernetes.io/not-ready"
    operator: "Exists"
    effect: "NoExecute"
    tolerationSeconds: 300    # evict after 5 min if node unready`} />

            <h3>Node Affinity — Node Attraction</h3>
            <p>While taints repel, <strong>node affinity</strong> attracts pods to nodes with specific labels. More expressive than <code>nodeSelector</code>.</p>
            <CodeBlock lang="node-affinity.yaml" code={`spec:
  affinity:
    nodeAffinity:
      # REQUIRED — pod won't schedule if not satisfied
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/arch
            operator: In
            values: ["amd64"]
      # PREFERRED — scheduler tries but doesn't require
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 80           # higher weight = stronger preference
        preference:
          matchExpressions:
          - key: node-type
            operator: In
            values: ["compute-optimized"]`} />

            <h3>Pod Anti-Affinity — Spread Across Zones</h3>
            <p>Use pod anti-affinity to spread replicas across availability zones or nodes, preventing a single zone failure from taking down all replicas:</p>
            <CodeBlock lang="pod-antiaffinity.yaml" code={`spec:
  affinity:
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values: ["api-server"]
        topologyKey: "topology.kubernetes.io/zone"
        # Never schedule two "api-server" pods in the same zone`} />

            <Callout type="prod">
                For production deployments, always combine: <strong>3+ replicas</strong> + <strong>podAntiAffinity</strong> across zones +
                <strong> PodDisruptionBudget</strong> with <code>minAvailable: 2</code>. This ensures your service survives
                a full AZ failure and voluntary disruptions (node upgrades).
            </Callout>

            <h3>PriorityClass — Eviction Order</h3>
            <p>When a node runs out of resources, Kubernetes evicts lower-priority pods first. PriorityClass lets you define which workloads are most important:</p>
            <CodeBlock lang="priorityclass.yaml" code={`apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: critical-system
value: 1000000        # higher = more important
globalDefault: false
description: "Critical system services"
---
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: batch-job
value: 100            # low priority — evicted first
globalDefault: false`} />
        </div>
    );
}
