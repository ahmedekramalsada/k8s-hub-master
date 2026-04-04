# GitOps with ArgoCD

## What is GitOps?

GitOps is an operational framework that treats **Git as the single source of truth** for infrastructure and application configuration. Instead of running `kubectl apply` manually, you commit YAML files to a Git repository and an operator (ArgoCD) automatically syncs the cluster to match.

| Traditional (Push) | GitOps (Pull) |
|---|---|
| `kubectl apply -f` from your laptop | ArgoCD pulls from Git |
| No audit trail | Every change is a git commit |
| Drift goes unnoticed | Drift is auto-detected and corrected |
| Manual rollback | `git revert` to rollback |

## ArgoCD Architecture

ArgoCD runs inside your cluster as a set of pods in the `argocd` namespace. It continuously compares the **desired state** (what's in Git) with the **live state** (what's running on the cluster) and reconciles any differences.

```
┌──────────────┐     git pull      ┌──────────────┐
│  Git Repo    │ ◄──────────────── │  ArgoCD      │
│  (k3s/apps/) │                   │  Controller  │
└──────────────┘                   └──────┬───────┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │  Kubernetes  │
                                   │  Cluster     │
                                   └──────────────┘
```

## The App of Apps Pattern

This project uses the **App of Apps** pattern. Instead of managing dozens of ArgoCD Applications individually, you create ONE root application that points to a directory containing other Application definitions.

The flow: `2-root-app.yaml` → reads `k3s/apps/` → deploys `website.yaml` + `eso.yaml` + `monitoring.yaml`

### Root Application (`k3s/bootstrap/2-root-app.yaml`)

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/ahmedekramalsada/k8s-hub-master.git
    targetRevision: main        # watches the main branch
    path: k3s/apps              # folder containing child apps
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

### Child Applications

**website.yaml** — deploys the app manifests (Deployment, Service, Ingress, etc.):

```yaml
spec:
  source:
    repoURL: https://github.com/ahmedekramalsada/k8s-hub-master.git
    targetRevision: main
    path: k3s/manifests           # points to raw YAML files
  destination:
    namespace: k8s-hub
```

**eso.yaml** — installs External Secrets Operator via Helm:

```yaml
spec:
  source:
    repoURL: https://charts.external-secrets.io
    chart: external-secrets        # Helm chart, not a git path
    targetRevision: 0.14.1
```

**monitoring.yaml** — installs kube-prometheus-stack via Helm:

```yaml
spec:
  source:
    repoURL: https://prometheus-community.github.io/helm-charts
    chart: kube-prometheus-stack
    targetRevision: 58.4.0
```

## Auto-Sync: Prune and SelfHeal

Every ArgoCD Application in this project uses the same sync policy:

```yaml
syncPolicy:
  automated:
    prune: true        # deletes resources removed from Git
    selfHeal: true     # reverts manual kubectl changes
  syncOptions:
    - CreateNamespace=true
```

| Setting | What it does | Example |
|---|---|---|
| `prune: true` | If you delete a YAML file from Git, ArgoCD deletes the resource from the cluster | Remove `pdb.yaml` → PDB is deleted |
| `selfHeal: true` | If someone runs `kubectl edit` on the cluster, ArgoCD reverts it to the Git version | `kubectl scale --replicas=5` → reverted to Git's value |
| `CreateNamespace=true` | Auto-creates target namespaces if they don't exist | `k8s-hub` namespace created automatically |

## The Bootstrap Process

The file `k3s/bootstrap/1-install-argocd.sh` is a one-time setup script that runs on a fresh VM:

```bash
# 1. Validates Infisical credentials are set
if [ -z "$INFISICAL_CLIENT_ID" ] || [ -z "$INFISICAL_CLIENT_SECRET" ]; then
  echo "❌ Missing Infisical credentials!"
  exit 1
fi

# 2. Adds 2GB swap (needed for small VMs)
sudo fallocate -l 2G /swapfile

# 3. Installs K3s
curl -sfL https://get.k3s.io | sh -

# 4. Installs ArgoCD
kubectl apply -n argocd -f \
  https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 5. Installs metrics-server (required for HPA)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# 6. Installs External Secrets Operator via Helm
helm upgrade --install external-secrets external-secrets/external-secrets \
  --namespace external-secrets --create-namespace --set installCRDs=true --wait

# 7. Creates the Infisical credentials K8s Secret
kubectl create secret generic infisical-credentials \
  --namespace k8s-hub \
  --from-literal=client-id="$INFISICAL_CLIENT_ID" \
  --from-literal=client-secret="$INFISICAL_CLIENT_SECRET"
```

After running the script, you apply the root app manually:

```bash
kubectl apply -f bootstrap/2-root-app.yaml
```

From that point on, ArgoCD manages everything automatically.

## Using ArgoCD CLI and UI

### ArgoCD UI

Access the UI via port-forward or the public IP:

```bash
# Get the initial admin password
kubectl get secret argocd-initial-admin-secret -n argocd \
  -o jsonpath="{.data.password}" | base64 -d

# Port-forward to access locally
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Open https://localhost:8080
```

### ArgoCD CLI

```bash
# Login
argocd login localhost:8080 --username admin --insecure

# List applications
argocd app list

# Sync an application
argocd app sync k8s-hub

# View application status
argocd app get k8s-hub

# Watch live sync progress
argocd app wait k8s-hub --health
```

## Common Mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| Wrong `repoURL` in root app | "repository not found" error | Verify the URL is publicly accessible or add a repo credential |
| Forgetting `targetRevision` | Deploys from wrong branch | Always set `targetRevision: main` or a specific commit SHA |
| `prune: true` with finalizers | Resources stuck in Terminating | Add `resources-finalizer.argocd.argoproj.io` to child apps (see `website.yaml`) |
| Manual `kubectl edit` on cluster | Changes silently reverted | Use Git to make changes, not kubectl |
| Not setting `CreateNamespace=true` | "namespace not found" errors | Add it to `syncOptions` |
| ArgoCD can't reach private repo | Authentication errors | Add the repo via `argocd repo add` with credentials |
