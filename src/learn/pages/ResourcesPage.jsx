import React, { useState, useMemo } from 'react';

const QUESTIONS = [
    // === Core Concepts ===
    { topic: "Core Concepts", difficulty: "Beginner", q: "What is a Pod?", a: "A Pod is the smallest execution unit in Kubernetes. It represents a single instance of a running process in your cluster and can contain one or more tightly coupled containers that share storage, network IP, and lifecycle." },
    { topic: "Core Concepts", difficulty: "Beginner", q: "What is a Namespace?", a: "Namespaces provide a mechanism for isolating groups of resources within a single cluster (logical partitioning). They are often used to separate environments (dev, staging, prod) or teams." },
    { topic: "Core Concepts", difficulty: "Mid", q: "How does a Deployment differ from a StatefulSet?", a: "A Deployment works well for stateless applications where pod replicas are interchangeable (e.g., a web server). A StatefulSet handles stateful applications (like databases), ensuring pod uniqueness, sticky network identities, and ordered deployment/scaling." },
    { topic: "Core Concepts", difficulty: "Beginner", q: "What is a ReplicaSet?", a: "A ReplicaSet's purpose is to maintain a stable set of replica Pods running at any given time. However, you rarely manage them directly; Deployments manage ReplicaSets automatically." },
    { topic: "Core Concepts", difficulty: "Mid", q: "What are Labels and Selectors?", a: "Labels are key/value pairs attached to objects (like Pods) used to organize and identify them. Selectors are the core grouping primitive that allows users to filter and target objects by their Labels (e.g., a Service selecting all Pods with label app=web)." },
    { topic: "Core Concepts", difficulty: "Mid", q: "Difference between limit and request for pod resources?", a: "A 'request' is the guaranteed amount of CPU/Memory the scheduler reserves for the pod on a Node. A 'limit' is the absolute maximum amount the pod is allowed to use before being throttled (CPU) or OOMKilled (Memory)." },
    { topic: "Core Concepts", difficulty: "Senior", q: "What happens if a pod exceeds its memory limit? What about CPU limit?", a: "If a pod exceeds its Memory limit, the container is killed with an OOMKilled exception. If it exceeds its CPU limit, it is not killed, but it is heavily throttled, severely degrading performance." },
    
    // === Architecture & Control Plane ===
    { topic: "Architecture", difficulty: "Mid", q: "What are the core components of the Kubernetes Control Plane?", a: "The Control Plane consists of the API Server (frontend), etcd (consistent/highly-available key-value store backing all cluster data), Scheduler (assigns pods to nodes), and Controller Manager (runs core controllers like Node Controller, ReplicaSet Controller)." },
    { topic: "Architecture", difficulty: "Mid", q: "What is the role of the Kubelet?", a: "The Kubelet is the primary 'node agent' that runs on every worker node. It registers the node with the API server, takes PodSpecs provided by the API server, and ensures the containers described in those PodSpecs are running and healthy." },
    { topic: "Architecture", difficulty: "Beginner", q: "What is kubectl?", a: "kubectl is the official command-line tool for interacting with the Kubernetes API Server. It allows administrators and developers to deploy applications, inspect and manage cluster resources, and view logs." },
    { topic: "Architecture", difficulty: "Senior", q: "How does etcd handle split-brain scenarios?", a: "etcd uses the Raft consensus algorithm. It requires a strict majority (quorum) of nodes to agree on a state change. If a network partition occurs, the partition with the minority of nodes will lose quorum and stop accepting writes, preventing split-brain." },
    { topic: "Architecture", difficulty: "Senior", q: "Explain the Reconciliation Loop.", a: "Kubernetes operates on a declarative 'Desired State' model. Controllers run an infinite Reconciliation Loop that constantly compares the 'Current State' of the cluster against the 'Desired State' stored in etcd, and takes actions to transition the Current State to the Desired State." },
    { topic: "Architecture", difficulty: "Mid", q: "What is kube-proxy?", a: "kube-proxy is a network proxy that runs on each node. It maintains network rules on nodes (usually using iptables or IPVS). These network rules allow network communication to your Pods from network sessions inside or outside of your cluster." },

    // === Networking ===
    { topic: "Networking", difficulty: "Mid", q: "Explain the difference between ClusterIP, NodePort, and LoadBalancer Services.", a: "ClusterIP exposes the service internally on a cluster-internal IP (default). NodePort exposes the service on each Node's IP at a static port (30000-32767). LoadBalancer provisions an external load balancer via your cloud provider (AWS/GCP/Azure) and assigns a public IP." },
    { topic: "Networking", difficulty: "Beginner", q: "What is an Ingress?", a: "An Ingress is an API object that manages external access to the services in a cluster, typically HTTP/HTTPS. It provides load balancing, SSL termination, and name-based virtual hosting, acting as a smart routing layer above Services." },
    { topic: "Networking", difficulty: "Senior", q: "What is the difference between Ingress and an API Gateway?", a: "Ingress is a Kubernetes-native resource focused primarily on HTTP/HTTPS routing, SSL termination, and host/path matching. An API Gateway is a broader architectural pattern handling rate limiting, authentication, API monetization, and transformations, though modern tools (like Gateway API) blur these lines." },
    { topic: "Networking", difficulty: "Mid", q: "What is a NetworkPolicy?", a: "A NetworkPolicy is a specification of how groups of pods are allowed to communicate with each other and other network endpoints. By default, pods are non-isolated (can talk to any pod). NetworkPolicies implement firewall-like rules at the IP/Port layer." },
    { topic: "Networking", difficulty: "Senior", q: "How does Kubernetes implement Service Discovery internally?", a: "Kubernetes uses CoreDNS. When a Service is created, CoreDNS automatically creates a DNS record for it (e.g., `my-svc.my-namespace.svc.cluster.local`). Pods are configured to use CoreDNS, allowing them to resolve services by name." },
    { topic: "Networking", difficulty: "Mid", q: "What is Headless Service?", a: "A Headless Service is created by setting `clusterIP: None`. Instead of load-balancing via a single IP, a DNS lookup for a Headless service returns the exact list of IPs for all backing Pods. This is common for StatefulSets where pods need to talk specifically to other individual pods." },

    // === Storage ===
    { topic: "Storage", difficulty: "Beginner", q: "Difference between PV and PVC?", a: "A PersistentVolume (PV) is a piece of storage in the cluster provisioned by an administrator or dynamically through StorageClasses. A PersistentVolumeClaim (PVC) is a request for storage by a user/pod. Pods use PVCs as volumes." },
    { topic: "Storage", difficulty: "Mid", q: "What is a StorageClass?", a: "A StorageClass allows administrators to define different 'classes' or tiers of storage (e.g., slow HDD, fast NVMe, cloud-specific EBS attributes). When a user creates a PVC specifying a StorageClass, a PV is dynamically provisioned on-the-fly." },
    { topic: "Storage", difficulty: "Mid", q: "What are the Access Modes of a PersistentVolume?", a: "ReadWriteOnce (RWO): Volume can be mounted as read-write by a single node. ReadOnlyMany (ROX): Volume can be mounted read-only by many nodes. ReadWriteMany (RWX): Volume can be mounted as read-write by many nodes (requires Network file systems like NFS/EFS)." },
    { topic: "Storage", difficulty: "Senior", q: "Why might a deployment fail with 'Volume is already exclusively attached to one node'?", a: "This happens on clouds like AWS/GCP when using Block Storage (EBS/PD) which only supports ReadWriteOnce. If a Rolling Update occurs, the new Pod spins up on Node B while the old Pod on Node A still holds the volume lock. Solution: Use strategy 'Recreate' instead of 'RollingUpdate'." },
    { topic: "Storage", difficulty: "Beginner", q: "Can you resize a PersistentVolumeClaim?", a: "Yes, starting in newer Kubernetes versions, volume expansion is supported. You edit the PVC to request more storage, and the underlying CSI driver (if supported) resizes the disk dynamically." },

    // === Security & RBAC ===
    { topic: "Security", difficulty: "Beginner", q: "What is RBAC in Kubernetes?", a: "Role-Based Access Control (RBAC) regulates network or system access based on the roles of individual users within an enterprise. It uses Role (namespace-specific) or ClusterRole (cluster-wide), paired with RoleBinding or ClusterRoleBinding, to define who can access what resources." },
    { topic: "Security", difficulty: "Mid", q: "Difference between RoleBinding and ClusterRoleBinding?", a: "A RoleBinding grants permissions defined in a Role (or ClusterRole) but strictly limits them to a specific Namespace. A ClusterRoleBinding applies globally across the entire cluster, granting access to cluster-scoped resources (like Nodes) or all namespaces at once." },
    { topic: "Security", difficulty: "Mid", q: "What is a ServiceAccount?", a: "A ServiceAccount provides an identity for processes that run in a Pod. Unlike normal users (usually managed outside K8s via OIDC or IAM), ServiceAccounts are native K8s objects managed by the API." },
    { topic: "Security", difficulty: "Senior", q: "What is the principle of least privilege in Kubernetes?", a: "It dictates giving Pods and Users only the exact permissions they need to function—and no more. This involves dropping Linux capabilities, using non-root users (`runAsNonRoot: true`), setting `automountServiceAccountToken: false` if API access isn't needed, and using restrictive NetworkPolicies." },
    { topic: "Security", difficulty: "Senior", q: "What happens if automountServiceAccountToken is left true?", a: "Kubernetes automatically injects a highly sensitive JWT into `/var/run/secrets/kubernetes.io/serviceaccount/token` inside your pod. If your app has a directory traversal or Remote Code Execution vulnerability, an attacker can steal this token to talk directly to the K8s API." },
    { topic: "Security", difficulty: "Mid", q: "How do you securely store passwords in Kubernetes?", a: "Use Kubernetes Secrets. However, by default, Secrets are only base64 encoded (not encrypted). In production, you must enable 'Encryption at Rest' for etcd, or use external secret operators like HashiCorp Vault or AWS Secrets Manager (via ExternalSecrets)." },

    // === Troubleshooting & Debugging ===
    { topic: "Troubleshooting", difficulty: "Beginner", q: "What is CrashLoopBackOff?", a: "It occurs when a container repeatedly crashes immediately after starting. Kubernetes tries to restart it, but increasing delays (backoffs) are applied. Common causes: missing dependencies, port conflicts, misconfigurations, or the container's main process exiting prematurely." },
    { topic: "Troubleshooting", difficulty: "Beginner", q: "What is ImagePullBackOff?", a: "The node cannot pull the container image from the registry. Causes: typo in the image name/tag, private registry lacks credentials (ImagePullSecrets), or the registry is down." },
    { topic: "Troubleshooting", difficulty: "Mid", q: "A pod is stuck in 'Pending' state. Why?", a: "Pending means the Scheduler cannot fit the pod onto a node. Causes: Insufficient CPU/Memory remaining on the cluster, unsatisfied Taints/Tolerations, NodeSelectors targeting missing node labels, or waiting for a dynamic PVC to provision." },
    { topic: "Troubleshooting", difficulty: "Mid", q: "How do you debug a CrashLoopBackOff where `kubectl logs` shows nothing?", a: "You can find out if the pod started and instantly died by checking previous logs: `kubectl logs <pod-name> --previous`. Also, use `kubectl describe pod <pod-name>` to look at the exact exit code in the container statuses." },
    { topic: "Troubleshooting", difficulty: "Senior", q: "Exit Code 137. What does it mean?", a: "137 = 128 + 9 (SIGKILL). This means the container was forcefully terminated by the kernel. In Kubernetes, this is almost always caused by an OOMKilled event because the container exceeded its specified memory `limit`." },
    { topic: "Troubleshooting", difficulty: "Senior", q: "A service is returning 502 Bad Gateway or 504 Timeout on an Ingress. How do you trace it?", a: "1. Check Ingress controller logs. 2. Verify Endpoints: `kubectl get endpoints <svc>`. If empty, the Service Selector doesn't match the Pod labels, or the Pods are failing Readiness Probes. 3. Verify Pods are in 'Running' state. 4. Verify the TargetPort in the Service matches the container port." },

    // === Advanced Workloads ===
    { topic: "Advanced", difficulty: "Mid", q: "What is a DaemonSet?", a: "A DaemonSet ensures that a copy of a pod runs on all (or some subset via nodeSelector) nodes in the cluster. As nodes are added, pods are added. Popular for cluster storage daemons (Ceph), log collection (Fluentd), and monitoring agents." },
    { topic: "Advanced", difficulty: "Senior", q: "How does the HorizontalPodAutoscaler (HPA) work under the hood?", a: "The HPA acts on a control loop. It periodically queries the `metrics-server` API for resource utilization (CPU/Memory). It then calculates a desired replica count (desiredReplicas = ceil[currentReplicas * ( currentMetricValue / desiredMetricValue )]) and scales the target Deployment accordingly." },
    { topic: "Advanced", difficulty: "Mid", q: "What is the difference between a Job and a CronJob?", a: "A Job creates one or more pods and ensures a specified number of them successfully terminate (exit code 0). It is a one-off task. A CronJob manages Jobs on a time-based schedule (like Linux cron)." },
    { topic: "Advanced", difficulty: "Senior", q: "What are Taints and Tolerations?", a: "They work together to ensure pods are not scheduled onto inappropriate nodes. Taints are applied to Nodes (e.g. 'Node A is dedicated to GPU'). Tolerations are applied to Pods. Only Pods possessing a matching Toleration can be scheduled onto the Tainted node." },
    { topic: "Advanced", difficulty: "Mid", q: "What is an InitContainer?", a: "InitContainers run before app containers in a Pod. They must complete successfully before the next one starts. They are used to run setup scripts, delay startup until a database is ready, or clone Git repositories, without putting those tools inside the main app image." },

    // === Helm & Package Management ===
    { topic: "Helm", difficulty: "Beginner", q: "What is Helm?", a: "Helm is the package manager for Kubernetes. Packages are called 'Charts'. Helm allows you to template YAML files, pass in 'values', and manage deployments, upgrades, and rollbacks natively as 'Releases'." },
    { topic: "Helm", difficulty: "Mid", q: "What is the `values.yaml` file used for?", a: "It contains the default configuration values for a Chart. When installing or upgrading, users can override these defaults by passing in their own custom values file (`-f my-values.yaml`) or using `--set` flags on the command line." },
    { topic: "Helm", difficulty: "Senior", q: "What does `helm template` actually do?", a: "It renders chart templates locally (client-side) and prints the generated Kubernetes YAML without making any API calls to the cluster. This is extremely useful for dry-runs, debugging syntax errors, or injecting the output into an ArgoCD GitOps pipeline." },
    { topic: "Helm", difficulty: "Senior", q: "Difference between Helm and Kustomize?", a: "Helm is a templating engine—you write text templates (Go templates) and inject string values. Kustomize is a patching engine—you write pure Kubernetes YAML files, and Kustomize overlays and merges them together (e.g., adding labels to all resources or replacing an image tag) without needing template tags." },
    { topic: "Helm", difficulty: "Mid", q: "How do you roll back a broken Helm deployment?", a: "You can find the history of releases using `helm history <release-name>`. Then, you can instantly revert the cluster state to a previous known-good revision using `helm rollback <release-name> <revision-number>`." }
];

const CATEGORIES = ["All", "Core Concepts", "Architecture", "Networking", "Storage", "Security", "Troubleshooting", "Advanced", "Helm"];

export default function ResourcesPage() {
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [filter, setFilter] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const toggleAccordion = (idx) => {
        setExpandedIndex(prev => prev === idx ? null : idx);
    };

    const filtered = useMemo(() => {
        let f = QUESTIONS;
        
        if (activeCategory !== 'All') {
            f = f.filter(q => q.topic === activeCategory);
        }
        
        if (filter.trim()) {
            const lowFilter = filter.toLowerCase();
            f = f.filter(q => 
                q.q.toLowerCase().includes(lowFilter) || 
                q.a.toLowerCase().includes(lowFilter) ||
                q.difficulty.toLowerCase().includes(lowFilter)
            );
        }
        
        return f;
    }, [filter, activeCategory]);

    const getDiffColor = (diff) => {
        if (diff === 'Beginner') return { bg: 'rgba(74, 222, 128, 0.15)', border: 'rgba(74, 222, 128, 0.4)', color: '#4ade80' };
        if (diff === 'Mid') return { bg: 'rgba(96, 165, 250, 0.15)', border: 'rgba(96, 165, 250, 0.4)', color: '#60a5fa' };
        if (diff === 'Senior') return { bg: 'rgba(248, 113, 113, 0.15)', border: 'rgba(248, 113, 113, 0.4)', color: '#f87171' };
        return { bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.2)', color: 'white' };
    };

    return (
        <div style={{ padding: 'var(--sp-8) var(--sp-12)', height: '100%', overflowY: 'auto', background: 'var(--bg-app)' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                <header style={{ marginBottom: 'var(--sp-8)' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: 'var(--sp-2)', color: 'var(--text-primary)' }}>
                        Kubernetes Interview Prep 🎓
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 800, lineHeight: 1.6 }}>
                        A curated masterclass of {QUESTIONS.length} high-yield Kubernetes interview questions. Filter by topic, search for keywords, and prepare for your next DevOps engineering role.
                    </p>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
                    
                    {/* Category Pills */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {CATEGORIES.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => { setActiveCategory(cat); setExpandedIndex(null); }}
                                style={{
                                    background: activeCategory === cat ? 'var(--color-primary-light)' : 'var(--bg-card)',
                                    color: activeCategory === cat ? '#000' : 'var(--text-primary)',
                                    border: `1px solid ${activeCategory === cat ? 'var(--color-primary-light)' : 'var(--border-subtle)'}`,
                                    borderRadius: 30, padding: '6px 16px', fontSize: 13, fontWeight: 600,
                                    cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-sans)'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Search & Actions */}
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                            <input 
                                type="text" 
                                placeholder="Search 'CrashLoopBackOff', 'PV', 'Ingress'..." 
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="input"
                                style={{ paddingLeft: 44, width: '100%', height: 48, background: 'var(--bg-panel)' }}
                            />
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, minWidth: 140, textAlign: 'right' }}>
                            Showing {filtered.length} of {QUESTIONS.length}
                        </div>
                    </div>
                </div>

                {/* Questions List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', paddingBottom: 'var(--sp-12)' }}>
                    {filtered.map((item, idx) => {
                        // Original array index tracking is needed if we expand it based on original data,
                        // but since filtered map idx is localized, we just expand the mapped idx.
                        const isExpanded = expandedIndex === idx;
                        const diffStyle = getDiffColor(item.difficulty);

                        return (
                            <div 
                                key={idx} 
                                style={{ 
                                    background: 'var(--bg-card)', 
                                    border: `1px solid ${isExpanded ? 'var(--color-primary)' : 'var(--border-subtle)'}`, 
                                    borderRadius: 'var(--radius-lg)',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isExpanded ? 'var(--shadow-lg)' : 'none'
                                }}
                            >
                                <button 
                                    onClick={() => toggleAccordion(idx)}
                                    style={{
                                        width: '100%', textAlign: 'left', background: 'transparent',
                                        border: 'none', padding: '20px 24px', cursor: 'pointer',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-panel)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <span style={{ color: 'var(--color-primary-light)', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                                {item.topic}
                                            </span>
                                            <span style={{ 
                                                background: diffStyle.bg, border: `1px solid ${diffStyle.border}`, color: diffStyle.color,
                                                fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontFamily: 'var(--font-mono)'
                                            }}>
                                                {item.difficulty}
                                            </span>
                                        </div>
                                        <span style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.4 }}>
                                            {item.q}
                                        </span>
                                    </div>
                                    <div style={{ background: isExpanded ? 'var(--color-primary-light)' : 'rgba(255,255,255,0.05)', color: isExpanded ? '#000' : 'var(--text-muted)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', marginTop: 4 }}>
                                        <span style={{ fontSize: 14, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                                            ▼
                                        </span>
                                    </div>
                                </button>
                                
                                <div style={{ 
                                    height: isExpanded ? 'auto' : 0, 
                                    opacity: isExpanded ? 1 : 0, 
                                    transition: 'all 0.3s ease',
                                    borderTop: isExpanded ? '1px solid var(--border-subtle)' : 'none'
                                }}>
                                    <div style={{ padding: '24px', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.05rem', background: 'rgba(0,0,0,0.1)' }}>
                                        {/* Simple formatting: replace backticks with a styled span */}
                                        {item.a.split(/(?=`[^`]+`)/).map((part, i) => {
                                            if (part.startsWith('`')) {
                                                const match = part.match(/`([^`]+)`(.*)/);
                                                if (match) {
                                                    return <span key={i}><code style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: '0.9em' }}>{match[1]}</code>{match[2]}</span>;
                                                }
                                            }
                                            return <span key={i}>{part}</span>;
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filtered.length === 0 && (
                        <div style={{ padding: '64px 32px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-subtle)' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🤷‍♂️</div>
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>No questions found</h3>
                            <p>Try adjusting your search criteria or selecting a different category.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
