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
            <h2>💾 Kubernetes Storage</h2>
            <p>Containers are ephemeral — any data written inside is lost when the container restarts. Kubernetes provides a rich storage abstraction layer that decouples storage provisioning from consumption, enabling stateful workloads like databases to run reliably in a cluster.</p>

            <h3>Volume Types</h3>
            <p>A <strong>Volume</strong> is a directory accessible to containers in a pod. Unlike Docker volumes, Kubernetes volumes have the same lifetime as the pod that uses them (unless backed by persistent storage).</p>

            <ul>
                <li><strong>emptyDir</strong> — Created when pod starts, deleted when pod dies. Shared between containers in the same pod.</li>
                <li><strong>hostPath</strong> — Mounts a file or directory from the node's filesystem. Avoid in production (ties pod to a specific node).</li>
                <li><strong>configMap / secret</strong> — Mounts ConfigMap or Secret data as files in the container.</li>
                <li><strong>persistentVolumeClaim (PVC)</strong> — The production way. Claims a PersistentVolume and mounts it.</li>
                <li><strong>projected</strong> — Combines multiple volume sources (secret + configMap + serviceAccountToken) into a single directory.</li>
            </ul>

            <h3>The PV / PVC Lifecycle</h3>
            <CodeBlock lang="STORAGE LIFECYCLE" code={`Admin (or StorageClass)        Developer
         │                           │
         ▼                           ▼
 PersistentVolume (PV)    PersistentVolumeClaim (PVC)
 ─────────────────────    ──────────────────────────
 Actual storage resource  Request for storage
 (NFS, EBS, GCE PD...)    (size, access mode, class)
         │                           │
         └──────── BINDING ──────────┘
                       │
                       ▼
               Pod uses PVC as a Volume
                       │
         PVC deleted?
               │
         ┌─────▼─────────────────────┐
         │  reclaimPolicy:           │
         │  Retain  → PV kept        │
         │  Delete  → PV deleted     │
         │  Recycle → data wiped     │
         └───────────────────────────┘`} />

            <h3>PersistentVolume</h3>
            <p>A PV is a piece of storage in the cluster provisioned by an admin or dynamically by a StorageClass. It has a lifecycle independent of any pod.</p>
            <CodeBlock lang="pv.yaml" code={`apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgres-pv
spec:
  storageClassName: standard
  capacity:
    storage: 50Gi
  accessModes:
  - ReadWriteOnce           # one node can mount read-write
  persistentVolumeReclaimPolicy: Retain  # keep data after PVC deleted
  hostPath:                 # dev only — use NFS/EBS in production
    path: "/mnt/postgres"`} />

            <h3>PersistentVolumeClaim</h3>
            <p>A PVC is a request for storage by a user. It specifies size, access mode, and optionally a StorageClass. Kubernetes automatically binds it to a matching PV.</p>
            <CodeBlock lang="pvc-and-pod.yaml" code={`apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: production
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: fast-ssd     # request a specific StorageClass
  resources:
    requests:
      storage: 50Gi
---
apiVersion: v1
kind: Pod
metadata:
  name: postgres
spec:
  containers:
  - name: postgres
    image: postgres:15
    volumeMounts:
    - name: pgdata
      mountPath: /var/lib/postgresql/data
  volumes:
  - name: pgdata
    persistentVolumeClaim:
      claimName: postgres-pvc    # reference the PVC`} />

            <h3>Access Modes</h3>
            <ul>
                <li><strong>ReadWriteOnce (RWO)</strong> — One node can mount read-write. Most cloud disks (EBS, GCE PD). Default for databases.</li>
                <li><strong>ReadOnlyMany (ROX)</strong> — Many nodes can mount read-only. For shared config files.</li>
                <li><strong>ReadWriteMany (RWX)</strong> — Many nodes can mount read-write. Requires NFS, CephFS, Azure Files, or similar.</li>
                <li><strong>ReadWriteOncePod (RWOP)</strong> — K8s 1.22+. Only ONE pod can mount (not just one node). Strictest isolation.</li>
            </ul>

            <h3>StorageClass — Dynamic Provisioning</h3>
            <p>Instead of admins manually creating PVs, a <strong>StorageClass</strong> defines a "provisioner" that automatically creates PVs when a PVC is submitted. This is how cloud storage works:</p>
            <CodeBlock lang="storageclass.yaml" code={`apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: ebs.csi.aws.com     # AWS EBS CSI driver
volumeBindingMode: WaitForFirstConsumer  # wait until pod is scheduled
reclaimPolicy: Delete            # delete EBS volume when PVC deleted
allowVolumeExpansion: true       # allow PVC resize
parameters:
  type: gp3                      # EBS volume type
  encrypted: "true"              # encrypt at rest`} />

            <h3>StatefulSet — Stable Storage for Databases</h3>
            <p>Unlike Deployments, <strong>StatefulSets</strong> give each pod a stable, ordered identity and persistent storage. Each pod gets its own PVC that survives pod restarts.</p>
            <CodeBlock lang="statefulset.yaml" code={`apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: production
spec:
  serviceName: postgres-headless   # must match a headless Service
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:            # one PVC per pod (postgres-0, -1, -2)
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: fast-ssd
      resources:
        requests:
          storage: 50Gi
# Pods get stable DNS: postgres-0.postgres-headless.production.svc.cluster.local`} />

            <Callout type="prod">
                StatefulSet pods start in order (0, 1, 2) and terminate in reverse (2, 1, 0). This ensures database
                primary/replica initialization happens correctly. Never delete a StatefulSet pod directly in production —
                use <code>kubectl rollout restart statefulset/postgres</code>.
            </Callout>

            <h3>CSI — Container Storage Interface</h3>
            <p>Modern Kubernetes uses <strong>CSI drivers</strong> to connect to storage backends. CSI drivers are deployed as pods in your cluster and implement a standard interface. Common CSI drivers:</p>
            <ul>
                <li><strong>aws-ebs-csi-driver</strong> — AWS EBS (block storage)</li>
                <li><strong>gcp-pd-csi-driver</strong> — GCP Persistent Disks</li>
                <li><strong>azuredisk-csi-driver</strong> — Azure Managed Disks</li>
                <li><strong>longhorn</strong> — Open-source distributed block storage for K8s</li>
                <li><strong>rook-ceph</strong> — Ceph distributed storage operator</li>
            </ul>
        </div>
    );
}
