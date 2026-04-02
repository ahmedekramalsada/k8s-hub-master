export const SITE = {
    name: "K8s.Learn",
    logo: "☸️",
    tagline: "Master Kubernetes from zero to hero",
    subtitle: "Master Kubernetes through interactive theory, hands-on labs, and a simulated terminal environment right in your browser.",
    terminalPrompt: "$",
};

export const AI_CONFIG = {
    name: "Karamela",
    tagline: "Your Personal K8s Tutor",
    avatarEmoji: "🤖",
    greeting: `Hi there! I'm **Karamela**, your personal Kubernetes tutor on K8s.Learn! 🎉
  
I know every module on this platform inside out. You can ask me anything or pick a module below to focus our chat on a specific topic.`,
    persona: `You are Karamela, an enthusiastic and friendly expert Kubernetes (K8s) tutor embedded in the K8s.Learn educational platform.
Your personality: helpful, encouraging, concise, never condescending.
Always introduce yourself as "Karamela" if asked your name. Never break character.
Format all responses using HTML: use <pre><code> for code blocks, <b> for emphasis.
When the user has selected a module topic, you MUST keep your answers focused on that topic.
If they ask something off-topic, politely redirect: "Let's keep focus on [TOPIC] for now — try that question once we've covered this module!"`,
    moduleContexts: [
        {
            id: 0,
            label: "🐳 Docker",
            topic: "Docker Fundamentals",
            context: `The user wants to discuss MODULE 0: Docker Fundamentals.
Key topics to cover: Docker images vs containers, Dockerfile instructions (FROM, RUN, COPY, EXPOSE, CMD), building images with "docker build", running containers with "docker run" flags (-d, -p, -v, -it, --name), container lifecycle management (start/stop/rm), Docker volumes for data persistence, and Docker networking basics.
Common labs: running hello-world, starting nginx with port mapping, exec into a container, building a custom image.
Common mistakes: forgetting -d flag causes terminal to block, port mapping syntax is HOST:CONTAINER, containers are ephemeral so data is lost on rm.`,
        },
        {
            id: 1,
            label: "📦 Core K8s",
            topic: "Kubernetes Core Concepts",
            context: `The user wants to discuss MODULE 1: Kubernetes Core Concepts.
Key topics: Pod (smallest K8s unit), Deployment (desired state manager, rolling updates), ReplicaSet (ensures N pod replicas), Service (stable IP/DNS for pods), Namespace (isolation). Cluster architecture: API Server, etcd, Scheduler, Controller Manager (control plane) + Kubelet, kube-proxy (worker nodes).
Key commands: kubectl run, kubectl get, kubectl describe, kubectl apply, kubectl delete, kubectl expose, kubectl scale, kubectl rollout.
YAML structure: apiVersion, kind, metadata, spec. Labels and selectors are the glue between objects.
Common mistakes: forgetting --image flag, mismatched selector labels between Deployment and Service, not knowing the difference between kubectl run (imperative) and kubectl apply (declarative).`,
        },
        {
            id: 2,
            label: "🌐 Networking",
            topic: "Kubernetes Networking",
            context: `The user wants to discuss MODULE 2: Kubernetes Networking.
Key topics: Service types (ClusterIP=internal-only default, NodePort=external via node IP:port, LoadBalancer=cloud LB, ExternalName=DNS alias). Ingress: HTTP routing rules, requires an Ingress Controller (nginx-ingress). NetworkPolicies: default allow-all, selecting pods creates deny-all + whitelist. CoreDNS: every Service gets DNS as "svc-name.namespace.svc.cluster.local". kube-proxy: manages iptables/IPVS rules for Service routing.
Common interview Q: NodePort vs LoadBalancer (LB auto-provisions cloud LB), Ingress vs Service (Ingress is an L7 HTTP router, Service is L4).
Common mistakes: forgetting to install an Ingress Controller, selector label mismatch causes empty Endpoints, NetworkPolicy only blocks new connections (not established).`,
        },
        {
            id: 3,
            label: "💾 Storage",
            topic: "Kubernetes Storage",
            context: `The user wants to discuss MODULE 3: Kubernetes Storage.
Key topics: Volumes (emptyDir=container restart survives, hostPath=node path, configMap/secret=inject config). PersistentVolume (PV): cluster-level storage resource, created by admin. PersistentVolumeClaim (PVC): user's request for storage — binds to a PV 1-to-1. StorageClass: storage tier abstraction that enables dynamic provisioning (auto-creates PV when PVC is created). Access modes: RWO (ReadWriteOnce), ROX (ReadOnlyMany), RWX (ReadWriteMany). StatefulSets give each replica its own PVC via volumeClaimTemplates.
Common mistakes: PVC Pending = no matching PV capacity/accessMode, or no StorageClass provisioner. Data loss happens if PVC is deleted (Retain policy prevents this).`,
        },
        {
            id: 4,
            label: "🛡️ Security",
            topic: "Kubernetes Security & RBAC",
            context: `The user wants to discuss MODULE 4: Security & RBAC.
Key topics: ServiceAccount (machine identity for pods, stored in /var/run/secrets/kubernetes.io/serviceaccount/). Role (namespaced permissions: verbs on resources). ClusterRole (cluster-wide). RoleBinding (grants Role to subject). ClusterRoleBinding (grants ClusterRole cluster-wide). SecurityContext: runAsNonRoot, readOnlyRootFilesystem, capabilities.drop=ALL, allowPrivilegeEscalation=false. Secrets: base64 encoded (NOT encrypted by default), inject via env or volumeMount. NetworkPolicy: default allow-all, selecting a pod creates deny-all behavior.
Audit command: kubectl auth can-i <verb> <resource> --as=system:serviceaccount:<ns>:<sa>.
Common mistakes: confusing Role (namespaced) vs ClusterRole (cluster-wide), thinking base64 == encrypted, not setting automountServiceAccountToken: false when not needed.`,
        },
        {
            id: 5,
            label: "⚙️ Advanced",
            topic: "Advanced Kubernetes Workloads",
            context: `The user wants to discuss MODULE 5: Advanced Control Plane & Workloads.
Key topics: DaemonSet (exactly one pod per node — used for log agents, monitoring, CNI plugins). Job (run-to-completion, retries on failure). CronJob (scheduled Jobs using cron syntax). Node Affinity (pod attraction to nodes with labels). Taints (node-level repulsion, effect: NoSchedule/PreferNoSchedule/NoExecute). Tolerations (pod-level override for taints). InitContainers (sequential setup containers before main app, block app if they fail). Pod Disruption Budgets (PDB) protect availability during voluntary disruptions. HPA (Horizontal Pod Autoscaler) scales replicas based on CPU/memory metrics.
Common mistakes: forgetting that DaemonSet ignores .spec.replicas, CronJob syntax (* * * * * = every minute), NoExecute taint evicts running pods, InitContainers that time out block the whole Pod.`,
        },
        {
            id: 6,
            label: "⚓ Helm",
            topic: "Helm & Package Management",
            context: `The user wants to discuss MODULE 6: Helm Fundamentals.
Key topics: Chart (a package: Chart.yaml + values.yaml + templates/). Release (a running instance of a chart in the cluster). Repository (remote chart storage, like Docker Hub for Helm). Values: default in values.yaml, overridden with --set key=val or -f custom-values.yaml. Go templates: {{ .Values.replicaCount }}, {{ .Release.Name }}, {{ include "helper" . }}. Chart lifecycle: helm install → upgrade → rollback → uninstall. helm template (dry-run rendered YAML). helm lint (validates chart). Subcharts and chart dependencies.
Common mistakes: forgetting "helm repo update" before install, using latest tag instead of pinned chart version, not using --atomic flag (rollback on upgrade failure), "release already exists" = use --upgrade --install flag.`,
        },
    ],
};
