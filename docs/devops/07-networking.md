# Kubernetes Networking

## The Kubernetes Networking Model

Kubernetes has a simple networking requirement: **every pod gets a unique IP and can reach every other pod without NAT**. This is called a "flat network."

| Rule | Description |
|---|---|
| Pod-to-Pod | Any pod can reach any other pod by IP |
| Node-to-Pod | Nodes can reach all pods |
| Pod-to-Node | Pods can reach their own node |

No port mapping, no NAT, no complex routing — just direct IP communication.

## Services: Stable Network Endpoints

Pods are ephemeral — they get new IPs when restarted. Services provide a stable DNS name and load-balance across matching pods.

### Service Types

| Type | Use Case | External Access |
|---|---|---|
| `ClusterIP` (default) | Internal communication only | No |
| `NodePort` | Expose on a port on each node | Yes, `NodeIP:NodePort` |
| `LoadBalancer` | Cloud provider load balancer | Yes, external IP |
| `ExternalName` | Alias for external DNS | Redirects to external service |

### This Project's Service (`k3s/manifests/service.yaml`)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: k8s-hub
  namespace: k8s-hub
spec:
  type: ClusterIP
  selector:
    app: k8s-hub
  ports:
    - name: http
      port: 80               # Service port (what other pods use)
      targetPort: 80         # Container port (frontend nginx)
      protocol: TCP
    - name: api
      port: 3001             # Service port for backend
      targetPort: 3001       # Container port (Express.js)
      protocol: TCP
```

The Service routes traffic to any pod with label `app: k8s-hub`. DNS name: `k8s-hub.k8s-hub.svc.cluster.local`.

## Ingress and Ingress Controllers

A **Service** exposes one service. An **Ingress** routes external traffic to multiple services based on paths or hostnames.

An **Ingress Controller** is the actual software that implements Ingress rules. K3s ships with **Traefik** built in.

### This Project's Ingress (`k3s/manifests/ingress.yaml`)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: k8s-hub
  namespace: k8s-hub
  annotations:
    # traefik.ingress.kubernetes.io/router.middlewares: k8s-hub-redirect-scheme@kubernetescrd
spec:
  rules:
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: k8s-hub
                port:
                  number: 80
  # tls:
  #   - hosts:
  #       - your-domain.com
  #     secretName: k8s-hub-tls
```

**Production TODOs:**
1. Set a real domain in `host: your-domain.com`
2. Install cert-manager and create a ClusterIssuer
3. Uncomment the TLS section for HTTPS

## NetworkPolicy: Pod Firewall

By default, all pods can talk to all pods. NetworkPolicy restricts traffic like a firewall.

### This Project's NetworkPolicy (`k3s/manifests/networkpolicy.yaml`)

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: k8s-hub-netpol
  namespace: k8s-hub
spec:
  podSelector:
    matchLabels:
      app: k8s-hub
  policyTypes:
    - Ingress
    - Egress
```

This selects all pods with `app: k8s-hub` and applies both ingress and egress rules.

### Ingress Rules

```yaml
ingress:
  # Rule 1: Allow from Traefik (Ingress controller)
  - from:
      - namespaceSelector:
          matchLabels:
            kubernetes.io/metadata.name: kube-system
        podSelector:
          matchLabels:
            app.kubernetes.io/name: traefik
    ports:
      - protocol: TCP
        port: 80
      - protocol: TCP
        port: 3001

  # Rule 2: Allow from same-namespace pods (frontend ↔ backend)
  - from:
      - podSelector:
          matchLabels:
            app: k8s-hub
    ports:
      - protocol: TCP
        port: 80
      - protocol: TCP
        port: 3001
```

| Rule | What it allows | Why |
|---|---|---|
| 1 | Traefik → pods on ports 80, 3001 | External traffic via Ingress |
| 2 | Same-namespace pods → pods on ports 80, 3001 | Frontend calling backend |

### Egress Rules

```yaml
egress:
  # Rule 1: Allow DNS resolution
  - to:
      - namespaceSelector: {}
        podSelector:
          matchLabels:
            k8s-app: kube-dns
    ports:
      - protocol: UDP
        port: 53
      - protocol: TCP
        port: 53

  # Rule 2: Allow outbound HTTPS
  - to: []
    ports:
      - protocol: TCP
        port: 443
```

| Rule | What it allows | Why |
|---|---|---|
| 1 | DNS (port 53 UDP/TCP) | Service discovery, hostname resolution |
| 2 | HTTPS (port 443) to anywhere | Backend calls OpenRouter API |

## DNS in Kubernetes

CoreDNS runs in the `kube-system` namespace and provides automatic DNS:

| DNS Name | Resolves To |
|---|---|
| `k8s-hub.k8s-hub.svc.cluster.local` | The ClusterIP Service |
| `k8s-hub.k8s-hub` | Short form (same namespace) |
| `k8s-hub` | Shortest form (same namespace) |

## Traffic Flow

```
User → Server IP:80 → Traefik (Ingress Controller) → Service (ClusterIP) → Pod (frontend:80)
                                                                    → Pod (backend:3001)
```

## Common Mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| NetworkPolicy blocks all traffic | Pods can't communicate | Ensure ingress/egress rules cover needed traffic |
| Wrong `namespaceSelector` | Cross-namespace traffic blocked | Use `kubernetes.io/metadata.name: kube-system` for system pods |
| Service `targetPort` doesn't match container | Connection refused | `targetPort` must match the container's `containerPort` |
| Missing `policyTypes` | Rules not enforced | Always include both `Ingress` and `Egress` |
| Ingress without host | Traffic goes to default backend | Set a `host` or understand default backend behavior |
| Forgetting DNS egress rule | Pods can't resolve any hostname | Always allow port 53 to kube-dns |
