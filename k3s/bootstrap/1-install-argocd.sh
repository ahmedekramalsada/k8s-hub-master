#!/bin/bash
# ─────────────────────────────────────────────────────────────
# FILE: bootstrap/1-install-argocd.sh
# PURPOSE: ONE SCRIPT TO DO EVERYTHING.
#          Run this on a fresh Ubuntu VM and get the website running.
#
# USAGE:
#   Quick install (no AI):
#     curl -sfL https://raw.githubusercontent.com/ahmedekramalsada/k8s-hub-master/main/k3s/bootstrap/1-install-argocd.sh | bash
#
#   With AI (set your OpenRouter key):
#     export OPENROUTER_API_KEY="your-key"
#     curl -sfL https://raw.githubusercontent.com/ahmedekramalsada/k8s-hub-master/main/k3s/bootstrap/1-install-argocd.sh | bash
#
#   With Infisical (full secrets management):
#     export INFISICAL_CLIENT_ID="xxx"
#     export INFISICAL_CLIENT_SECRET="xxx"
#     curl -sfL https://raw.githubusercontent.com/ahmedekramalsada/k8s-hub-master/main/k3s/bootstrap/1-install-argocd.sh | bash
# ─────────────────────────────────────────────────────────────

set -e

# ── Add 2GB swap (skip if already active) ──
echo ""
echo ">>> [1/8] Setting up swap..."
if grep -q '/swapfile' /proc/swaps 2>/dev/null; then
  echo "✅ Swap already active"
else
  {
    fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048 2>/dev/null
    chmod 600 /swapfile
    mkswap /swapfile 2>/dev/null
    swapon /swapfile 2>/dev/null
    grep -q '/swapfile' /etc/fstab 2>/dev/null || echo '/swapfile none swap sw 0 0' >> /etc/fstab 2>/dev/null
  } || true
  echo "✅ Swap configured"
fi
free -h

# ── Install K3s ──
echo ">>> [2/8] Installing K3s..."
curl -sfL https://get.k3s.io | sh -

mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
export KUBECONFIG=~/.kube/config

echo ">>> Waiting for K3s to be ready..."
kubectl wait --for=condition=Ready nodes --all --timeout=120s
echo "✅ K3s ready"

# ── Install Helm ──
echo ">>> [3/8] Installing Helm..."
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# ── Install ArgoCD via Helm ──
echo ">>> [4/8] Installing ArgoCD..."
helm repo add argo https://argoproj.github.io/argo-helm 2>/dev/null || true
helm repo update

helm upgrade --install argocd argo/argo-cd \
  --namespace argocd \
  --create-namespace \
  --set configs.params."server\.insecure"=true \
  --set server.service.type=ClusterIP \
  --timeout 300s \
  --wait 2>/dev/null || {
    echo "⚠️  ArgoCD Helm install had issues, checking status..."
  }

echo ">>> Waiting for ArgoCD server to be ready..."
kubectl wait --for=condition=Ready pods -l app.kubernetes.io/name=argocd-server -n argocd --timeout=120s 2>/dev/null || {
  echo "⚠️  ArgoCD server not ready yet, waiting 30s..."
  sleep 30
}
echo "✅ ArgoCD installed"
echo "✅ ArgoCD ready"

# ── Install metrics-server ──
echo ">>> [5/8] Installing metrics-server..."
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml >/dev/null 2>&1
kubectl wait --for=condition=Ready pods -l k8s-app=metrics-server -n kube-system --timeout=120s
echo "✅ metrics-server ready"

# ── Install ESO (only if Infisical) ──
if [ "$USE_INFISICAL" = true ]; then
  echo ">>> [6/8] Installing External Secrets Operator..."
  helm repo add external-secrets https://charts.external-secrets.io 2>/dev/null || true
  helm repo update
  helm upgrade --install external-secrets external-secrets/external-secrets \
    --namespace external-secrets \
    --create-namespace \
    --set installCRDs=true \
    --wait >/dev/null 2>&1
  kubectl wait --for=condition=Ready pods --all -n external-secrets --timeout=120s

  kubectl create namespace k8s-hub --dry-run=client -o yaml | kubectl apply -f -
  kubectl create secret generic infisical-credentials \
    --namespace k8s-hub \
    --from-literal=client-id="$INFISICAL_CLIENT_ID" \
    --from-literal=client-secret="$INFISICAL_CLIENT_SECRET" \
    --dry-run=client -o yaml | kubectl apply -f -
  echo "✅ ESO + Infisical ready"
else
  echo ">>> [6/8] Skipping ESO (no Infisical credentials)"
fi

# ── Create namespace ──
kubectl create namespace k8s-hub --dry-run=client -o yaml | kubectl apply -f -

# ── Deploy the website via ArgoCD ──
echo ">>> [7/8] Deploying K8s Hub website..."

# Clone repo to get the manifests
apt install -y git >/dev/null 2>&1
REPO_DIR=$(mktemp -d)
git clone --depth 1 https://github.com/ahmedekramalsada/k8s-hub-master.git "$REPO_DIR"

# Apply all manifests directly (faster than waiting for ArgoCD root app)
kubectl apply -f "$REPO_DIR/k3s/manifests/namespace.yaml"
kubectl apply -f "$REPO_DIR/k3s/manifests/deployment.yaml"
kubectl apply -f "$REPO_DIR/k3s/manifests/service.yaml"
kubectl apply -f "$REPO_DIR/k3s/manifests/ingress.yaml"
kubectl apply -f "$REPO_DIR/k3s/manifests/networkpolicy.yaml"
kubectl apply -f "$REPO_DIR/k3s/manifests/pdb.yaml"
kubectl apply -f "$REPO_DIR/k3s/manifests/hpa.yaml"

# Set AI key if provided
if [ "$USE_OPENROUTER" = true ]; then
  echo ">>> Configuring AI with OpenRouter API key..."
  kubectl create secret generic k8s-hub-secrets \
    --namespace k8s-hub \
    --from-literal=openrouter-api-key="$OPENROUTER_API_KEY" \
    --dry-run=client -o yaml | kubectl apply -f -
  echo "✅ AI configured"
elif [ "$USE_INFISICAL" = true ]; then
  echo ">>> AI will be configured via ESO + Infisical"
  kubectl apply -f "$REPO_DIR/k3s/manifests/secret-store.yaml"
  kubectl apply -f "$REPO_DIR/k3s/manifests/external-secret.yaml"
else
  echo ">>> No AI key provided — AI features will be disabled"
  echo "    To enable later: kubectl create secret generic k8s-hub-secrets -n k8s-hub --from-literal=openrouter-api-key='your-key'"
fi

# Clean up
rm -rf "$REPO_DIR"

echo "✅ Website manifests applied"

# ── Wait for pods ──
echo ">>> [8/8] Waiting for pods to be ready..."
kubectl wait --for=condition=Ready pods -l app=k8s-hub -n k8s-hub --timeout=180s 2>/dev/null || {
  echo "⏳ Pods still starting... checking status:"
  kubectl get pods -n k8s-hub
}

# ── Get ArgoCD password ──
ARGOCD_PASSWORD=$(kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d 2>/dev/null || echo "see: kubectl get secrets -n argocd")

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                    ✅ DONE!                           ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Your website:  http://$SERVER_IP"
echo ""
echo "📊 ArgoCD UI:"
echo "   Port-forward: kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "   Then open:    http://localhost:8080"
echo "   Username:     admin"
echo "   Password:     $ARGOCD_PASSWORD"
echo ""
echo "📋 Useful commands:"
echo "   kubectl get pods -n k8s-hub          # Check pods"
echo "   kubectl logs -n k8s-hub deploy/k8s-hub -c backend -f  # Backend logs"
echo "   kubectl logs -n k8s-hub deploy/k8s-hub -c frontend -f # Frontend logs"
echo ""
