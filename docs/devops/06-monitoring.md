# Monitoring with Prometheus and Grafana

## Why Monitoring Matters

Without monitoring, you are flying blind. You won't know when:
- Pods are crashing or restarting
- CPU/memory is running out
- Response times are degrading
- Disk is filling up

Monitoring gives you **visibility** into what's happening inside your cluster.

## Prometheus Architecture

Prometheus is a time-series database that collects metrics by **scraping** HTTP endpoints.

```
┌──────────────┐   scrape    ┌──────────────┐
│  Prometheus  │ ──────────▶ │  /metrics    │
│  (stores &   │  every 15s  │  endpoint    │
│   queries)   │ ◀────────── │  on each pod │
└──────┬───────┘             └──────────────┘
       │
       │ PromQL queries
       ▼
┌──────────────┐
│  Grafana     │
│  (dashboards)│
└──────────────┘
```

### Key Concepts

| Concept | Description |
|---|---|
| **Scrape** | HTTP GET to `/metrics` endpoint, returns plain text metrics |
| **Target** | An endpoint that Prometheus scrapes |
| **Metric types** | Counter (always increases), Gauge (goes up/down), Histogram (distribution) |
| **PromQL** | Prometheus Query Language for querying and aggregating metrics |
| **Retention** | How long metrics are stored (this project: `3d`) |

Example PromQL queries:
```promql
# Current CPU usage percentage
rate(container_cpu_usage_seconds_total{namespace="k8s-hub"}[5m]) * 100

# Memory usage in bytes
container_memory_usage_bytes{namespace="k8s-hub"}

# HTTP request rate
rate(http_requests_total{namespace="k8s-hub"}[5m])
```

## kube-prometheus-stack Components

The project installs `kube-prometheus-stack` via ArgoCD (`k3s/apps/monitoring.yaml`). This single Helm chart deploys:

| Component | Purpose |
|---|---|
| **Prometheus** | Collects, stores, and queries metrics |
| **Grafana** | Visualizes metrics in dashboards |
| **AlertManager** | Sends alerts (email, Slack, PagerDuty) |
| **Node Exporter** | Host-level metrics (CPU, memory, disk, network) |
| **kube-state-metrics** | K8s object metrics (pod status, deployment replicas, etc.) |

Resource allocation in this project:

```yaml
prometheus:
  prometheusSpec:
    resources:
      requests: { cpu: 200m, memory: 400Mi }
      limits:   { cpu: 500m, memory: 800Mi }
    retention: 3d
    storageSpec:
      volumeClaimTemplate:
        spec:
          accessModes: ["ReadWriteOnce"]
          resources:
            requests: { storage: 5Gi }

grafana:
  resources:
    requests: { cpu: 100m, memory: 128Mi }
    limits:   { cpu: 200m, memory: 256Mi }
  adminPassword: k8shub-admin
```

## ServiceMonitor: Auto-Discovery

Prometheus needs to know what to scrape. A `ServiceMonitor` tells Prometheus which services have metrics endpoints.

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: k8s-hub-metrics
  namespace: k8s-hub
  labels:
    app: k8s-hub
    release: prometheus          # Must match Prometheus label selector
spec:
  selector:
    matchLabels:
      app: k8s-hub               # Matches the Service with these labels
  endpoints:
    - port: api                  # References port name in the Service
      path: /metrics             # Metrics endpoint path
      interval: 15s              # Scrape every 15 seconds
      scrapeTimeout: 10s         # Fail if no response in 10s
```

**How discovery works:**
1. Prometheus finds ServiceMonitors with label `release: prometheus`
2. It looks for Services matching `selector.matchLabels` (`app: k8s-hub`)
3. It scrapes `/metrics` on the `api` port (3001) every 15 seconds

## The Backend /metrics Endpoint

The backend uses `prom-client` (Node.js Prometheus client) to expose metrics at `http://backend:3001/metrics`:

```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",path="/health"} 1523

# HELP process_cpu_user_seconds_total Total user CPU time
# TYPE process_cpu_user_seconds_total counter
process_cpu_user_seconds_total 45.23

# HELP nodejs_eventloop_lag_seconds Lag of event loop in seconds
# TYPE nodejs_eventloop_lag_seconds gauge
nodejs_eventloop_lag_seconds 0.003
```

## Key Metrics to Monitor

| Metric | Why it matters | Alert threshold |
|---|---|---|
| `container_cpu_usage` | Pod is overloaded | > 80% of limit |
| `container_memory_usage` | Pod may get OOMKilled | > 80% of limit |
| `kube_pod_status_restart_count` | Pod is crashing | > 3 restarts in 5m |
| `node_cpu_usage` | Node is overloaded | > 75% |
| `node_memory_usage` | Node may run out of memory | > 85% |
| `node_filesystem_usage` | Disk is filling up | > 80% |
| `http_request_duration_seconds` | API is slow | p99 > 1s |

## Accessing Grafana and Prometheus

```bash
# Grafana (default credentials: admin / k8shub-admin)
kubectl port-forward svc/prometheus-grafana -n monitoring 3000:80
# Open http://localhost:3000

# Prometheus UI
kubectl port-forward svc/prometheus-kube-prometheus-prometheus -n monitoring 9090:9090
# Open http://localhost:9090

# AlertManager
kubectl port-forward svc/prometheus-kube-prometheus-alertmanager -n monitoring 9093:9093
# Open http://localhost:9093
```

## Common Mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| Missing `release: prometheus` label | Prometheus doesn't discover ServiceMonitor | Add the label to ServiceMonitor metadata |
| Wrong port name in endpoint | "target not found" error | Port name must match the Service's port name |
| Insufficient resources | Prometheus pods crash with OOMKilled | Increase memory limits (512Mi minimum) |
| No persistent storage | Metrics lost on pod restart | Configure `storageSpec` with a PVC |
| Forgetting metrics-server | HPA doesn't work | Install metrics-server (done in bootstrap script) |
| Grafana password in plain text | Security risk | Use a Secret or ESO for Grafana credentials |
