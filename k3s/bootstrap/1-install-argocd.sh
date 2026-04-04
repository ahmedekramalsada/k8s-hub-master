#!/bin/bash
# ─────────────────────────────────────────────────────────────
# FILE: bootstrap/1-install-argocd.sh
# PURPOSE: Run this ONCE on a fresh VM after K3s is installed.
#          It installs K3s, ArgoCD, and ESO.
#
# BEFORE RUNNING:
#   1. Get Infisical Machine Identity credentials:
#      - Go to Infisical → Access Control → Machine Identities
#      - Create identity with Universal Auth
#      - Grant read access to your project
#      - Save Client ID and Client Secret
#
#   2. Set environment variables:
#      export INFISICAL_CLIENT_ID="your-client-id"
#      export INFISICAL_CLIENT_SECRET="your-client-secret"
#
# HOW TO RUN:
#   chmod +x bootstrap/1-install-argocd.sh
#   export INFISICAL_CLIENT_ID="xxx"
#   export INFISICAL_CLIENT_SECRET="xxx"
#   ./bootstrap/1-install-argocd.sh
# ─────────────────────────────────────────────────────────────

set -e

# ── Validate environment ──
if [ -z "$INFISICAL_CLIENT_ID" ] || [ -z "$INFISICAL_CLIENT_SECRET" ]; then
  echo "❌ Missing Infisical credentials!"
  echo ""
  echo "Set these before running:"
  echo "  export INFISICAL_CLIENT_ID=\"your-client-id\""
  echo "  export INFISICAL_CLIENT_SECRET=\"your-client-secret\""
  echo ""
  echo "Get them from: Infisical → Access Control → Machine Identities"
  exit 1
fi

# ── Add 2GB swap ──
echo ">>> Setting up swap..."
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
echo "✅ Swap enabled"
free -h

# ── Install K3s ──
echo ">>> Installing K3s..."
curl -sfL https://get.k3s.io | sh -

echo ">>> Setting up kubeconfig..."
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
export KUBECONFIG=~/.kube/config

# ── Install ArgoCD ──
echo ">>> Creating ArgoCD namespace..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

echo ">>> Installing ArgoCD..."
kubectl apply -n argocd -f \
  https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

echo ">>> Waiting for ArgoCD to be ready..."
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s

# ── Install metrics-server (required for HPA) ──
echo ">>> Installing metrics-server..."
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

echo ">>> Waiting for metrics-server to be ready..."
kubectl wait --for=condition=Ready pods -l k8s-app=metrics-server -n kube-system --timeout=120s

# ── Install Helm ──
echo ">>> Installing Helm..."
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# ── Install External Secrets Operator ──
echo ">>> Installing External Secrets Operator..."
helm repo add external-secrets https://charts.external-secrets.io 2>/dev/null || true
helm repo update

helm upgrade --install external-secrets external-secrets/external-secrets \
  --namespace external-secrets \
  --create-namespace \
  --set installCRDs=true \
  --set webhook.enabled=true \
  --set certController.enabled=true \
  --wait

echo ">>> Waiting for ESO to be ready..."
kubectl wait --for=condition=Ready pods --all -n external-secrets --timeout=120s

# ── Create Infisical credentials secret ──
echo ">>> Creating Infisical credentials secret..."
kubectl create namespace k8s-hub --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic infisical-credentials \
  --namespace k8s-hub \
  --from-literal=client-id="$INFISICAL_CLIENT_ID" \
  --from-literal=client-secret="$INFISICAL_CLIENT_SECRET" \
  --dry-run=client -o yaml | kubectl apply -f -

# ── Get ArgoCD password ──
ARGOCD_PASSWORD=$(kubectl get secret argocd-initial-admin-secret \
  -n argocd \
  -o jsonpath="{.data.password}" | base64 -d)

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ Bootstrap complete!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "ArgoCD:"
echo "  URL:      https://$(curl -s ifconfig.me):443"
echo "  Username: admin"
echo "  Password: $ARGOCD_PASSWORD"
echo ""
echo "External Secrets Operator: ✅ Installed"
echo "Infisical credentials:     ✅ Created in namespace k8s-hub"
echo ""
echo "Next steps:"
echo "  1. Edit k3s/bootstrap/2-root-app.yaml"
echo "     → Set your Git repo URL"
echo "  2. Edit k3s/manifests/secret-store.yaml"
echo "     → Set your Infisical projectSlug and environmentSlug"
echo "  3. Apply the root app:"
echo "     kubectl apply -f bootstrap/2-root-app.yaml"
echo ""
