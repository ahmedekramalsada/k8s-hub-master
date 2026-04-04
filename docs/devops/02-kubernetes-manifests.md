# DevOps Guide 02: Kubernetes Manifests

## What is a Kubernetes Manifest?

A manifest is a YAML file that describes what you want Kubernetes to run. You tell K8s **what** you want (desired state), and K8s figures out **how** to make it happen.

```
You write: "I want 2 copies of nginx:latest"
K8s does: Creates 2 Pods, schedules them on nodes, monitors them, restarts if they crash
```

## Your Manifest Files

All your manifests are in `k3s/manifests/`. Here's what each one does:

### 1. namespace.yaml

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: k8s-hub
```

**What it does:** Creates an isolated space called `k8s-hub`. Everything lives inside it.

**Why namespaces matter:**
- Isolation: apps in different namespaces can't see each other by default
- Organization: `kubectl get pods -n k8s-hub` shows only your app
- Resource quotas: you can limit CPU/memory per namespace

### 2. deployment.yaml (THE most important file)

This is your core application definition. It has TWO containers in ONE pod:

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 2                    # Run 2 copies
  strategy:
    type: RollingUpdate          # Zero-downtime deployments
    rollingUpdate:
      maxSurge: 1                # Add 1 new pod before removing old
      maxUnavailable: 0          # Never have fewer than 2 pods
```

**RollingUpdate in action:**
```
Start:  [v1] [v1]
Step 1: [v1] [v1] [v2]    ← maxSurge adds new one
Step 2: [v1] [v2]          ← removes one old
Step 3: [v1] [v2] [v2]    ← adds second new
Step 4: [v2] [v2]          ← removes last old
Done! Zero downtime.
```

**Pod-level security (PSS Restricted):**
```yaml
securityContext:
  runAsNonRoot: true         # Refuse to run if container tries root
  runAsUser: 1001            # Run as user ID 1001
  runAsGroup: 1001           # Run as group ID 1001
  fsGroup: 1001              # File system group for volumes
  seccompProfile:
    type: RuntimeDefault     # Block dangerous system calls
```

**Container-level security:**
```yaml
securityContext:
  readOnlyRootFilesystem: true    # Frontend can't write to disk
  allowPrivilegeEscalation: false # Can't gain more privileges
  capabilities:
    drop:
      - ALL                       # Remove all Linux capabilities
```

**Health probes:**
```yaml
readinessProbe:    # "Am I ready for traffic?"
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 5
  periodSeconds: 10

livenessProbe:     # "Am I still alive?"
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 10
  periodSeconds: 30
```

| Probe | What it checks | What happens if it fails |
|---|---|---|
| readinessProbe | "Can I handle requests?" | K8s stops sending traffic to this pod |
| livenessProbe | "Am I still running?" | K8s kills and restarts the pod |

### 3. service.yaml

```yaml
apiVersion: v1
kind: Service
spec:
  type: ClusterIP
  selector:
    app: k8s-hub
  ports:
    - name: http
      port: 80
      targetPort: 80
    - name: api
      port: 3001
      targetPort: 3001
```

**What it does:** Creates a stable internal address that always points to your pods.

**Why Services are needed:**
- Pods die and restart with NEW IPs
- Service gives you a consistent address: `k8s-hub.k8s-hub.svc.cluster.local`
- Load balances traffic across all matching pods

**Service types:**

| Type | What it does | When to use |
|---|---|---|
| ClusterIP | Internal only | Default — most common |
| NodePort | Exposes on node IP + high port | Debugging, no load balancer |
| LoadBalancer | Creates cloud load balancer | Production on AWS/GCP/Azure |
| ExternalName | Maps to external DNS | Pointing to external services |

### 4. ingress.yaml

Routes external HTTP traffic into your cluster:

```
User → http://your-server-ip
  → Ingress Controller (Traefik in K3s)
  → matches path "/"
  → forwards to Service "k8s-hub" on port 80
  → Pod responds
```

### 5. networkpolicy.yaml

Pod firewall — controls which pods can talk to each other:

```
Before: Any pod → Any pod (no restrictions)
After:  k8s-hub pods only accept from:
  ✅ Traefik (Ingress controller)
  ✅ Other k8s-hub pods
  ✅ DNS (port 53)
  ✅ HTTPS outbound (port 443)
  ❌ Everything else BLOCKED
```

### 6. pdb.yaml

PodDisruptionBudget — protects against voluntary disruptions:

```
With replicas: 2 and minAvailable: 1:
  Node drain: K8s evicts 1 pod, waits for new one, then evicts second
  Result: Zero downtime during maintenance
```

### 7. hpa.yaml

HorizontalPodAutoscaler — auto-scales based on CPU/memory:

```yaml
minReplicas: 2
maxReplicas: 6
metrics:
  - cpu target: 70%
  - memory target: 80%
```

**How it works:**
```
Formula: desiredReplicas = ceil(currentReplicas * (currentCPU / targetCPU))

Example: 2 pods at 80% CPU, target 70%
desired = ceil(2 * (80/70)) = ceil(2.29) = 3 pods
```

## How to Work With Manifests

```bash
# Apply all manifests
kubectl apply -f k3s/manifests/

# Check status
kubectl get all -n k8s-hub
kubectl get pods -n k8s-hub -w    # Watch pods in real-time

# Debug a pod
kubectl describe pod <name> -n k8s-hub
kubectl logs <pod> -n k8s-hub
kubectl logs <pod> -c frontend -n k8s-hub   # Specific container

# Delete everything
kubectl delete -f k3s/manifests/
```

## Common Mistakes

❌ Using `:latest` tag — always pin versions (`nginx:1.25`)
❌ No resource limits — one pod can starve all others
❌ No probes — K8s doesn't know if your app is healthy
❌ Hardcoding secrets — use Secrets or External Secrets Operator
❌ No NetworkPolicy — any pod can reach any other pod
❌ Single replica — one crash = downtime
