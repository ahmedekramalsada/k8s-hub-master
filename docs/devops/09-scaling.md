# Scaling in Kubernetes

## Horizontal Pod Autoscaler (HPA)

HPA automatically increases or decreases the number of pod replicas based on metrics like CPU and memory usage.

### How HPA Works

```
┌──────────────┐   CPU/memory   ┌──────────────┐   query      ┌──────────────┐
│  Pods        │ ──────────────▶ │  metrics-    │ ◀────────── │  HPA          │
│  (running)   │   data          │  server      │             │  Controller   │
└──────────────┘                 └──────────────┘             └──────┬───────┘
                                                                     │
                                        ┌──────────────┐            │
                                        │  Deployment  │ ◀──────────┘
                                        │  (scale up/  │   adjusts replicas
                                        │   down)      │
                                        └──────────────┘
```

1. **metrics-server** collects CPU/memory from each pod (via kubelet)
2. **HPA controller** checks every 15 seconds
3. If average CPU > target → scale up
4. If average CPU < target → scale down
5. Never goes below `minReplicas` or above `maxReplicas`

### The Scaling Formula

```
desiredReplicas = ceil(currentReplicas × (currentMetricValue / targetMetricValue))
```

**Example:** 2 pods at 80% CPU, target is 70%:
```
desired = ceil(2 × (80 / 70)) = ceil(2.29) = 3 pods
```

### This Project's HPA (`k3s/manifests/hpa.yaml`)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: k8s-hub-hpa
  namespace: k8s-hub
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: k8s-hub
  minReplicas: 2
  maxReplicas: 6
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Pods
          value: 1
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Pods
          value: 1
          periodSeconds: 120
```

| Setting | Value | Why |
|---|---|---|
| `minReplicas` | 2 | Always have at least 2 pods for HA |
| `maxReplicas` | 6 | Cap to prevent runaway scaling |
| CPU target | 70% | Scale up before pods are overloaded |
| Memory target | 80% | Secondary metric, higher threshold |
| Scale-up window | 60s | Wait 60s before adding more pods |
| Scale-down window | 300s | Wait 5 minutes before removing pods (prevents flapping) |
| Scale-up rate | 1 pod per 60s | Gradual scale-up |
| Scale-down rate | 1 pod per 120s | Slow, cautious scale-down |

### Stabilization Window

The stabilization window prevents rapid oscillation (scale up, then immediately down):

```
Traffic spike at T=0:
  T=0s   → CPU hits 80%
  T=60s  → HPA adds 1 pod (stabilization window passed)
  T=120s → CPU still high, adds another pod
  T=180s → Traffic drops
  T=480s → HPA removes 1 pod (300s scale-down window)
  T=600s → HPA removes another pod
```

## Vertical Pod Autoscaler (VPA)

VPA adjusts resource **requests and limits** on existing pods (not the replica count).

| HPA | VPA |
|---|---|
| Changes number of replicas | Changes CPU/memory requests/limits |
| Good for variable traffic | Good for right-sizing resources |
| Requires resource requests | Recommends optimal requests |
| Can coexist with VPA | Cannot coexist with HPA on same resource |

**Rule:** Use HPA or VPA on a Deployment, not both on the same metric.

## KEDA: Event-Driven Scaling

KEDA (Kubernetes Event-Driven Autoscaling) scales based on external events, not just CPU/memory:

| Scaler | Triggers on |
|---|---|
| Cron | Time-based (scale up at 9am, down at 6pm) |
| RabbitMQ | Queue length |
| Kafka | Topic lag |
| AWS SQS | Message count |
| HTTP | Request rate |

Example: scale to 0 when no traffic, scale up when requests arrive.

## Cluster Autoscaler

Cluster Autoscaler adds or removes **nodes** from the cluster when pods can't be scheduled due to insufficient resources.

```
HPA scales pods → pods pending (no node capacity) → Cluster Autoscaler adds a node
Traffic drops → HPA removes pods → node underutilized → Cluster Autoscaler removes node
```

## metrics-server Requirement

HPA requires metrics-server to be installed. This project installs it in the bootstrap script:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl wait --for=condition=Ready pods -l k8s-app=metrics-server -n kube-system --timeout=120s
```

Verify it's working:
```bash
kubectl top pods -n k8s-hub
# NAME       CPU(cores)   MEMORY(bytes)
# k8s-hub    45m          92Mi
```

## PDB Interaction with HPA

The PodDisruptionBudget (`k3s/manifests/pdb.yaml`) works with HPA to ensure availability during scaling:

```yaml
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: k8s-hub
```

With `minReplicas: 2` and `minAvailable: 1`:
- HPA can scale down to 2 pods (its minimum)
- During node drain, PDB ensures at least 1 pod stays running
- HPA and PDB don't conflict because HPA's minimum ≥ PDB's minimum

## When to Use Each Scaling Method

| Scenario | Tool | Why |
|---|---|---|
| Traffic spikes during the day | HPA | Scales pods based on CPU/memory |
| Pods are over/under-provisioned | VPA | Right-sizes resource requests |
| Scale based on queue depth | KEDA | Event-driven, not resource-based |
| Cluster runs out of capacity | Cluster Autoscaler | Adds nodes automatically |
| Predictable traffic patterns | KEDA Cron | Scale on schedule |
| Cost optimization | HPA + Cluster Autoscaler | Scale down pods and nodes when idle |

## Common Mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| No metrics-server installed | HPA shows `<unknown>` for metrics | Install metrics-server |
| No resource requests on containers | HPA can't calculate utilization | Always set `resources.requests` |
| `minReplicas` < `minAvailable` in PDB | Conflicting constraints | Ensure HPA min ≥ PDB min |
| Too aggressive scale-down | Pods flapping up and down | Increase `stabilizationWindowSeconds` |
| `maxReplicas` too high | Cluster runs out of resources | Set realistic max based on node capacity |
| Using HPA + VPA on same resource | They fight each other | Use HPA for replicas, VPA for requests (different resources) |
| Forgetting `behavior` config | Rapid scale oscillation | Always configure stabilization windows |
