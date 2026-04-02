# ☸️ K8s Hub — Kubernetes YAML Generator & Learning Platform

All-in-one platform to **generate production-ready Kubernetes manifests** and **learn K8s interactively**.

![K8s Hub](https://img.shields.io/badge/K8s-Hub-blueviolet) ![Docker](https://img.shields.io/badge/Docker-Ready-blue) ![React](https://img.shields.io/badge/React-18-61dafb) ![K3s](https://img.shields.io/badge/K3s-Deploy-green)

---

## 📑 Table of Contents

- [Features](#-features)
- [Quick Start (Docker)](#-quick-start-docker)
- [Local Development](#-local-development)
- [Architecture](#-architecture)
- [AI Configuration](#-ai-configuration)
- [K3s Deployment with ArgoCD](#-k3s-deployment-with-argocd)
- [Azure DevOps CI/CD](#-azure-devops-cicd)
- [Project Structure](#-project-structure)
- [Deployment Options](#-deployment-options)

---

## 🚀 Features

### YAML Generator (25+ Resource Types)
| Category | Resources |
|---|---|
| **Workloads** | Deployment, Pod, StatefulSet, DaemonSet, Job, CronJob, ReplicaSet |
| **Networking** | Service, Ingress, NetworkPolicy |
| **Config** | ConfigMap, Secret |
| **Storage** | PersistentVolumeClaim, PersistentVolume, StorageClass |
| **Security** | ServiceAccount, Role, RoleBinding, ClusterRole |
| **Cluster** | Namespace, PodDisruptionBudget, LimitRange, ResourceQuota |
| **Scaling** | HPA, VPA |
| **GitOps** | ArgoCD App, Kustomization |
| **Observability** | ServiceMonitor |

### Other Features
- **Bundle Manager** — group resources, download as single YAML, export as Helm chart
- **Starter Templates** — Full Web App, PostgreSQL, GitOps Stack, and more
- **Import YAML** — paste or upload existing manifests, auto-parse to form
- **Diff View** — compare two YAML files side-by-side
- **Snippets** — save and reuse YAML configurations
- **Security Scoring** — per-resource security grade (A-F) with fix suggestions
- **Validation Engine** — inline errors, warnings, dependency checks
- **Image Intelligence** — auto-detect ports, env vars, resource limits from image name
- **Learn K8s** — interactive modules with labs, quizzes, cheat sheets
- **AI Assistant** — review, explain, debug YAML (requires OpenRouter API key)
- **Helm Export** — generate Chart.yaml + values.yaml from bundle
- **Environment Presets** — dev/staging/prod defaults
- **Keyboard Shortcuts** — Ctrl+S save, Ctrl+K AI, Ctrl+B add to bundle

---

## 🐳 Quick Start (Docker)

### 1. Clone & Configure
```bash
git clone https://github.com/YOUR_USERNAME/k8s-hub.git
cd k8s-hub

# Copy environment template
cp .env.docker .env

# Edit .env — at minimum set FRONTEND_URL
# Optional: add OPENROUTER_API_KEY for AI features
```

### 2. Run
```bash
docker-compose up --build -d
```

### 3. Access
- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3001/health

### Without AI Key
Everything works except AI chat — generator, validation, templates, bundles, learning all work standalone.

---

## 💻 Local Development

### Prerequisites
- Node.js 20+
- npm

### Frontend
```bash
npm install
npm run dev
# Runs at http://localhost:5173
```

### Backend
```bash
cd backend
npm install
npm run dev
# Runs at http://localhost:3001
```

### Environment
Create `backend/.env`:
```
PORT=3001
FRONTEND_URL=http://localhost:5173
OPENROUTER_API_KEY=your_key_here   # optional
```

Vite proxies `/api` to backend automatically (see `vite.config.js`).

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                        │
└───────────────────────┬─────────────────────────────────┘
                        │
            ┌───────────▼───────────┐
            │   Nginx (port 80)     │
            │   - Static files      │
            │   - /api/ → backend   │
            └───────────┬───────────┘
                        │ proxy_pass
            ┌───────────▼───────────┐
            │   Backend (port 3001) │
            │   - /api/config       │
            │   - /api/ai/chat      │
            │   - /health           │
            └───────────┬───────────┘
                        │
            ┌───────────▼───────────┐
            │   OpenRouter API      │
            │   (external)          │
            └───────────────────────┘
```

---

## 🤖 AI Configuration

### Where to put the API key

**Docker:** Edit `.env` file:
```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx
```

**Local Development:** Edit `backend/.env`:
```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx
```

**Kubernetes:** The key is pulled from a Kubernetes Secret via External Secrets Operator. See `k3s/manifests/external-secret.yaml`.

### Get a Key
1. Go to [openrouter.ai](https://openrouter.ai)
2. Create a free account
3. Generate an API key
4. Add credits (some models are free)

### Supported Models
The AI uses OpenRouter which gives access to many models. Default: `arcee-ai/trinity-large-preview:free` (free tier).

---

## ☸️ K3s Deployment with ArgoCD

### Prerequisites
- A VM with K3s installed
- A GitHub/GitLab repo with this code

### Step 1: Bootstrap
```bash
# Run on your K3s server
chmod +x k3s/bootstrap/1-install-argocd.sh
./k3s/bootstrap/1-install-argocd.sh
```

This installs K3s + ArgoCD.

### Step 2: Configure
Edit these files — replace `YOUR_USERNAME/YOUR_REPO`:
- `k3s/bootstrap/2-root-app.yaml` (line 20)
- `k3s/apps/website.yaml` (line 23)

Edit `k3s/manifests/deployment.yaml` — replace `YOUR_DOCKERHUB_USER` with your Docker Hub username.

### Step 3: Apply Root App
```bash
kubectl apply -f k3s/bootstrap/2-root-app.yaml
```

ArgoCD will now:
1. Read `k3s/apps/website.yaml`
2. Watch `k3s/manifests/` in your Git repo
3. Auto-deploy all manifests to your cluster

### Step 4: Create Secrets
```bash
# For the OpenRouter API key (optional)
kubectl create secret generic k8s-hub-secrets \
  --namespace k8s-hub \
  --from-literal=openrouter-api-key=sk-or-v1-xxxxx
```

Or use External Secrets Operator (see `k3s/manifests/external-secret.yaml`).

### ArgoCD UI
```bash
# Get the URL and password
kubectl get svc -n argocd
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
```

---

## 🔧 Azure DevOps CI/CD

### Setup

1. **Create Service Connection:**
   - Go to Project Settings → Service Connections
   - New → Docker Registry → Docker Hub
   - Name it `Docker Hub`
   - Enter your Docker Hub credentials

2. **Create Variable Group:**
   - Go to Pipelines → Library
   - New variable group: `dockerhub-credentials`
   - Add variables:
     - `DOCKERHUB_USERNAME` = your Docker Hub username
     - `DOCKERHUB_TOKEN` = your Docker Hub access token (mark as secret)

3. **Create Pipeline:**
   - Go to Pipelines → New Pipeline
   - Select your repo
   - Choose "Existing Azure Pipelines YAML file"
   - Select `/azure-pipelines.yml`

### What It Does
- Triggers on push to `main` branch
- Builds frontend Docker image → pushes to `youruser/k8s-hub`
- Builds backend Docker image → pushes to `youruser/k8s-hub-backend`
- Tags with build ID + `latest`

### Manual Trigger
```bash
# You can also build locally
docker build -t youruser/k8s-hub:latest .
docker build -t youruser/k8s-hub-backend:latest ./backend
docker push youruser/k8s-hub:latest
docker push youruser/k8s-hub-backend:latest
```

---

## 📁 Project Structure

```
k8s-hub/
├── src/
│   ├── main.jsx                    # App entry point
│   ├── generator/
│   │   ├── app.jsx                 # Main generator app
│   │   ├── Dashboard.jsx           # Resource card picker
│   │   ├── forms.jsx               # Resource-specific forms
│   │   ├── generators.js           # YAML generators + validation
│   │   ├── components.jsx          # Shared UI components
│   │   └── schemas.js              # Zod validation schemas
│   ├── pages/
│   │   ├── LandingPage.jsx         # Marketing landing
│   │   ├── LearnApp.jsx            # Learning platform
│   │   └── ChatPage.jsx            # Full-page AI chat
│   ├── learn/
│   │   ├── pages/                  # Learn module pages
│   │   ├── components/             # Learn UI components
│   │   ├── content/                # Module content
│   │   └── config/                 # Module definitions
│   ├── components/
│   │   ├── GlobalNav.jsx           # Top navigation
│   │   ├── AIAssistant.jsx         # Floating AI chat
│   │   └── ToastContext.jsx        # Toast notifications
│   └── styles/
│       ├── design-system.css       # CSS variables & tokens
│       ├── components.css          # Reusable component styles
│       └── animations.css          # Animation keyframes
├── backend/
│   └── src/
│       └── index.js                # Express API server
├── k3s/                            # K3s deployment manifests
│   ├── bootstrap/                  # ArgoCD installation
│   ├── apps/                       # ArgoCD application definitions
│   └── manifests/                  # Kubernetes manifests
├── nginx/
│   └── default.conf.template       # Nginx config
├── Dockerfile                      # Frontend multi-stage build
├── docker-compose.yml              # Full stack orchestration
├── azure-pipelines.yml             # CI/CD pipeline
├── .env.docker                     # Docker environment template
└── vite.config.js                  # Vite configuration
```

---

## 🚢 Deployment Options

| Method | Command | Best For |
|---|---|---|
| **Docker Compose** | `docker-compose up -d` | Local / small server |
| **K3s + ArgoCD** | See [K3s section](#-k3s-deployment-with-argocd) | Production on VPS/VM |
| **Any K8s** | Apply `k3s/manifests/*.yaml` | Any Kubernetes cluster |
| **Azure DevOps** | Push to `main` branch | CI/CD with Docker Hub |
| **Manual** | `npm run build` → serve `dist/` | Static hosting (no AI) |

---

## 📝 Environment Variables

### Frontend (Docker)
| Variable | Default | Description |
|---|---|---|
| `BACKEND_URL` | `http://backend:3001` | Backend service URL |

### Backend
| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Server port |
| `FRONTEND_URL` | `http://localhost:5173` | CORS allowed origin |
| `OPENROUTER_API_KEY` | _(empty)_ | AI features API key |

---

## 📄 License

MIT
