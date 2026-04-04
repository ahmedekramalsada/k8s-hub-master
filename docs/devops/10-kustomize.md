# Kustomize: YAML Customization Without Templating

## What is Kustomize?

Kustomize is a Kubernetes-native configuration management tool built into `kubectl`. It customizes raw YAML files **without templating** — no `{{ .Values }}` syntax, no Go templates. Just clean YAML with strategic merge patches.

```bash
# Kustomize is built into kubectl (no separate install needed)
kubectl apply -k k3s/overlays/dev
kubectl apply -k k3s/overlays/prod
```

## Kustomize vs Helm

| Feature | Kustomize | Helm |
|---|---|---|
| Syntax | Plain YAML + patches | Go templates (`{{ .Values }}`) |
| Learning curve | Low (just YAML) | Medium (templating language) |
| Best for | Customizing your own YAML | Packaging and distributing apps |
| Versioning | Git-based | Chart versioning |
| Built into kubectl | Yes (`kubectl apply -k`) | No (separate `helm` CLI) |
| Conditional logic | No | Yes (`{{ if }}`) |
| Loops | No | Yes (`{{ range }}`) |

**Rule of thumb:** Use Kustomize for environment-specific changes to your own manifests. Use Helm for third-party charts (like Prometheus, ESO).

## Base + Overlay Pattern

```
overlays/
├── base/              # Shared configuration (all environments)
│   └── kustomization.yaml
├── dev/               # Dev-specific patches
│   └── kustomization.yaml
└── prod/              # Prod-specific patches
    └── kustomization.yaml
```

### Base (`k3s/overlays/base/kustomization.yaml`)

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - ../../manifests/namespace.yaml
  - ../../manifests/deployment.yaml
  - ../../manifests/service.yaml
  - ../../manifests/ingress.yaml
  - ../../manifests/networkpolicy.yaml
  - ../../manifests/pdb.yaml
  - ../../manifests/hpa.yaml
  - ../../manifests/servicemonitor.yaml
  - ../../manifests/secret-store.yaml
  - ../../manifests/external-secret.yaml

commonLabels:
  managed-by: kustomize
```

The base references all manifest files and adds a `managed-by: kustomize` label to every resource.

## Dev Overlay (`k3s/overlays/dev/kustomization.yaml`)

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - ../base

namePrefix: dev-

patches:
  # Reduce replicas for dev
  - target:
      kind: Deployment
      name: k8s-hub
    patch: |
      - op: replace
        path: /spec/replicas
        value: 1

  # Reduce HPA limits for dev
  - target:
      kind: HorizontalPodAutoscaler
      name: k8s-hub-hpa
    patch: |
      - op: replace
        path: /spec/minReplicas
        value: 1
      - op: replace
        path: /spec/maxReplicas
        value: 3

  # Lower resource requests for dev
  - target:
      kind: Deployment
      name: k8s-hub
    patch: |
      - op: replace
        path: /spec/template/spec/containers/0/resources/requests/cpu
        value: 25m
      - op: replace
        path: /spec/template/spec/containers/0/resources/requests/memory
        value: 32Mi
      - op: replace
        path: /spec/template/spec/containers/1/resources/requests/cpu
        value: 25m
      - op: replace
        path: /spec/template/spec/containers/1/resources/requests/memory
        value: 32Mi
```

## Prod Overlay (`k3s/overlays/prod/kustomization.yaml`)

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - ../base

namePrefix: prod-

patches:
  # More replicas for production
  - target:
      kind: Deployment
      name: k8s-hub
    patch: |
      - op: replace
        path: /spec/replicas
        value: 3

  # Higher HPA limits for production
  - target:
      kind: HorizontalPodAutoscaler
      name: k8s-hub-hpa
    patch: |
      - op: replace
        path: /spec/minReplicas
        value: 3
      - op: replace
        path: /spec/maxReplicas
        value: 10

  # Higher resource limits for production
  - target:
      kind: Deployment
      name: k8s-hub
    patch: |
      - op: replace
        path: /spec/template/spec/containers/0/resources/limits/cpu
        value: 500m
      - op: replace
        path: /spec/template/spec/containers/0/resources/limits/memory
        value: 256Mi
      - op: replace
        path: /spec/template/spec/containers/1/resources/limits/cpu
        value: 1000m
      - op: replace
        path: /spec/template/spec/containers/1/resources/limits/memory
        value: 512Mi

  # Stricter PDB for production
  - target:
      kind: PodDisruptionBudget
      name: k8s-hub-pdb
    patch: |
      - op: replace
        path: /spec/minAvailable
        value: 2
```

## Environment Comparison

| Setting | Base | Dev | Prod |
|---|---|---|---|
| Replicas | 2 (from deployment.yaml) | 1 | 3 |
| HPA min | 2 | 1 | 3 |
| HPA max | 6 | 3 | 10 |
| PDB minAvailable | 1 | 1 (inherited) | 2 |
| Frontend CPU limit | 200m | 200m (inherited) | 500m |
| Backend CPU limit | 500m | 500m (inherited) | 1000m |
| Name prefix | none | `dev-` | `prod-` |
| Resource names | `k8s-hub` | `dev-k8s-hub` | `prod-k8s-hub` |

## How namePrefix Works

The `namePrefix` field prepends a string to **every resource name** and updates all references:

```yaml
# Dev overlay adds namePrefix: dev-
# Before: name: k8s-hub
# After:  name: dev-k8s-hub

# References are also updated:
# Before: scaleTargetRef.name: k8s-hub
# After:  scaleTargetRef.name: dev-k8s-hub
```

This means you can deploy dev and prod side-by-side in the same cluster without name collisions.

## Strategic Merge Patches

Kustomize supports two patch formats:

### JSON Patch (used in this project)

```yaml
patches:
  - target:
      kind: Deployment
      name: k8s-hub
    patch: |
      - op: replace
        path: /spec/replicas
        value: 1
```

Uses RFC 6902 JSON Patch operations: `add`, `remove`, `replace`.

### Strategic Merge Patch (YAML)

```yaml
patches:
  - target:
      kind: Deployment
      name: k8s-hub
    patch: |
      apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: k8s-hub
      spec:
        replicas: 1
```

More readable but less precise for nested fields.

## How to Use

```bash
# Preview what Kustomize will generate (dry run)
kubectl kustomize k3s/overlays/dev

# Apply dev configuration
kubectl apply -k k3s/overlays/dev

# Apply prod configuration
kubectl apply -k k3s/overlays/prod

# Verify
kubectl get deployments -n k8s-hub
# NAME            READY   UP-TO-DATE   AVAILABLE
# dev-k8s-hub     1/1     1            1
```

## ArgoCD with Kustomize

ArgoCD natively supports Kustomize. To use it, point the `source.path` to the overlay directory:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: k8s-hub-dev
spec:
  source:
    repoURL: https://github.com/ahmedekramalsada/k8s-hub-master.git
    targetRevision: main
    path: k3s/overlays/dev       # Points to Kustomize overlay
  destination:
    namespace: k8s-hub
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

ArgoCD auto-detects `kustomization.yaml` and runs `kubectl kustomize` before applying.

## Common Mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| Missing resource in base | Resource not in output | Add it to `base/kustomization.yaml` resources list |
| Wrong JSON Patch path | "path not found" error | Verify the YAML path matches the resource structure |
| Forgetting `namePrefix` updates references | HPA can't find Deployment | Kustomize handles this automatically if names match |
| Using `kubectl apply -f` instead of `-k` | Kustomize not applied | Use `kubectl apply -k k3s/overlays/dev` |
| Overlapping patches on same field | Last patch wins, unpredictable | Use separate patch entries or strategic merge |
| Base references files with relative paths from wrong dir | "file not found" | Paths in base are relative to `base/`, not the overlay |
| ArgoCD not detecting Kustomize | Deploys raw YAML without patches | Ensure `kustomization.yaml` is in the `source.path` |
