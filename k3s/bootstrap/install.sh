#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# K8s Hub — One-Click Installer
# PURPOSE: Install K3s, ArgoCD, and deploy the website on a fresh VM
#
# USAGE:
#   No AI:
#     curl -sfL https://raw.githubusercontent.com/ahmedekramalsada/k8s-hub-master/main/k3s/bootstrap/install.sh | bash
#
#   With AI:
#     export OPENROUTER_API_KEY="your-key"
#     curl -sfL https://raw.githubusercontent.com/ahmedekramalsada/k8s-hub-master/main/k3s/bootstrap/install.sh | bash
#
#   With Infisical:
#     export INFISICAL_CLIENT_ID="xxx"
#     export INFISICAL_CLIENT_SECRET="xxx"
#     curl -sfL https://raw.githubusercontent.com/ahmedekramalsada/k8s-hub-master/main/k3s/bootstrap/install.sh | bash
# ═══════════════════════════════════════════════════════════════════

set -e

SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_SERVER_IP")
USE_INFISICAL=false
USE_OPENROUTER=false

if [ -n "$INFISICAL_CLIENT_ID" ] && [ -n "$INFISICAL_CLIENT_SECRET" ]; then
  USE_INFISICAL=true
  echo ">>> Infisical credentials detected"
fi

if [ -n "$OPENROUTER_API_KEY" ]; then
  USE_OPENROUTER=true
  echo ">>> OpenRouter API key detected"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║         K8s Hub — One-Click Installer                 ║"
echo "║         Server: $SERVER_IP                            ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# ── Swap ──
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

# ── K3s ──
echo ">>> [2/8] Installing K3s..."
curl -sfL https://get.k3s.io | sh -
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
export KUBECONFIG=~/.kube/config
kubectl wait --for=condition=Ready nodes --all --timeout=120s
echo "✅ K3s ready"

# ── Helm ──
echo ">>> [3/8] Installing Helm..."
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# ── ArgoCD ──
echo ">>> [4/8] Installing ArgoCD..."
helm repo add argo https://argoproj.github.io/argo-helm 2>/dev/null || true
helm repo update
helm upgrade --install argocd argo/argo-cd \
  --namespace argocd --create-namespace \
  --set configs.params."server\.insecure"=true \
  --set server.service.type=ClusterIP \
  --timeout 300s --wait 2>/dev/null || true
kubectl wait --for=condition=Ready pods -l app.kubernetes.io/name=argocd-server -n argocd --timeout=120s 2>/dev/null || sleep 30
echo "✅ ArgoCD ready"

# ── metrics-server ──
echo ">>> [5/8] Installing metrics-server..."
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml >/dev/null 2>&1
kubectl wait --for=condition=Ready pods -l k8s-app=metrics-server -n kube-system --timeout=120s
echo "✅ metrics-server ready"

# ── ESO ──
if [ "$USE_INFISICAL" = true ]; then
  echo ">>> [6/8] Installing External Secrets Operator..."
  helm repo add external-secrets https://charts.external-secrets.io 2>/dev/null || true
  helm repo update
  helm upgrade --install external-secrets external-secrets/external-secrets \
    --namespace external-secrets --create-namespace --set installCRDs=true --wait >/dev/null 2>&1
  kubectl wait --for=condition=Ready pods --all -n external-secrets --timeout=120s
  kubectl create namespace k8s-hub --dry-run=client -o yaml | kubectl apply -f -
  kubectl create secret generic infisical-credentials --namespace k8s-hub \
    --from-literal=client-id="$INFISICAL_CLIENT_ID" \
    --from-literal=client-secret="$INFISICAL_CLIENT_SECRET" \
    --dry-run=client -o yaml | kubectl apply -f -
  echo "✅ ESO + Infisical ready"
else
  echo ">>> [6/8] Skipping ESO (no Infisical credentials)"
fi

# ── Deploy website ──
echo ">>> [7/8] Deploying K8s Hub website..."
kubectl create namespace k8s-hub --dry-run=client -o yaml | kubectl apply -f -

kubectl apply -f https://raw.githubusercontent.com/ahmedekramalsada/k8s-hub-master/main/k3s/manifests/deployment.yaml
kubectl apply -f https://raw.githubusercontent.com/ahmedekramalsada/k8s-hub-master/main/k3s/manifests/service.yaml
kubectl apply -f https://raw.githubusercontent.com/ahmedekramalsada/k8s-hub-master/main/k3s/manifests/ingress.yaml
kubectl apply -f https://raw.githubusercontent.com/ahmedekramalsada/k8s-hub-master/main/k3s/manifests/networkpolicy.yaml
kubectl apply -f https://raw.githubusercontent.com/ahmedekramalsada/k8s-hub-master/main/k3s/manifests/pdb.yaml
kubectl apply -f https://raw.githubusercontent.com/ahmedekramalsada/k8s-hub-master/main/k3s/manifests/hpa.yaml

if [ "$USE_OPENROUTER" = true ]; then
  kubectl create secret generic k8s-hub-secrets --namespace k8s-hub \
    --from-literal=openrouter-api-key="$OPENROUTER_API_KEY" \
    --dry-run=client -o yaml | kubectl apply -f -
  echo "✅ AI configured"
elif [ "$USE_INFISICAL" = true ]; then
  kubectl apply -f https://raw.githubusercontent.com/ahmedekramalsada/k8s-hub-master/main/k3s/manifests/secret-store.yaml
  kubectl apply -f https://raw.githubusercontent.com/ahmedekramalsada/k8s-hub-master/main/k3s/manifests/external-secret.yaml
  echo "✅ AI via ESO + Infisical"
else
  echo ">>> No AI key — AI features disabled"
  echo "    Enable later: kubectl create secret generic k8s-hub-secrets -n k8s-hub --from-literal=openrouter-api-key='your-key'"
fi

echo "✅ Website deployed"

# ── Wait for pods ──
echo ">>> [8/8] Waiting for pods..."
kubectl wait --for=condition=Ready pods -l app=k8s-hub -n k8s-hub --timeout=180s 2>/dev/null || {
  echo "⏳ Pods still starting..."
  kubectl get pods -n k8s-hub
}

# ── Done ──
ARGOCD_PASSWORD=$(kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d 2>/dev/null || echo "check: kubectl get secrets -n argocd")

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                    ✅ DONE!                           ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Website:  http://$SERVER_IP"
echo ""
echo "📊 ArgoCD:   kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "             http://localhost:8080  (admin / $ARGOCD_PASSWORD)"
echo ""
echo "📋 Commands:"
echo "   kubectl get pods -n k8s-hub"
echo "   kubectl logs -n k8s-hub deploy/k8s-hub -c backend -f"
echo ""
