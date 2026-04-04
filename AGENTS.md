# AGENTS.md — K8s Hub Repository Guide

## Project Overview

K8s Hub is a Kubernetes YAML Generator & Learning Platform with a React frontend and Express.js backend.

- **Frontend:** React 18 + Vite, no TypeScript, inline CSS-in-JS styling
- **Backend:** Express.js (Node.js), plain JavaScript
- **State Management:** Zustand (global), React.Context (theme, AI)
- **Styling:** CSS files + inline styles (design system in `src/styles/`)
- **No test framework configured** — no linting or formatting tools present

## Directory Structure

```
k8s-hub-master/
├── src/
│   ├── main.jsx                    # App entry: ErrorBoundary, ThemeProvider, AIProvider, Router
│   ├── contexts/                   # React Context providers
│   │   └── ThemeContext.jsx        # Global dark/light theme state
│   ├── utils/                      # Shared utilities
│   │   ├── storage.js              # Safe localStorage get/set with 'k8s_' prefix
│   │   ├── yaml.js                 # YAML download, copy, filename helpers
│   │   └── constants.js            # Routes, API endpoints, storage keys, AI constants
│   ├── ai/                         # Unified AI system
│   │   ├── AIContext.jsx           # React Context: messages, send, model, panel state
│   │   ├── AIFloatingWidget.jsx    # Floating chat widget (appears on all pages)
│   │   └── prompts.js              # Centralized system prompts + model list
│   ├── generator/                  # Core YAML generator feature
│   │   ├── app.jsx                 # Main orchestrator (all views wired together)
│   │   ├── generators.js           # 25+ YAML generators, lint engine, security scoring
│   │   ├── components.jsx          # Reusable UI (Input, Btn, KVList, YAMLPanel, etc.)
│   │   ├── forms.jsx               # Resource-specific form components
│   │   ├── schemas.js              # Zod validation schemas
│   │   ├── store.js                # Zustand store + React Flow state
│   │   ├── Dashboard.jsx           # Resource card picker
│   │   ├── LineNumbers.jsx         # YAML line number gutter
│   │   └── KeyboardShortcuts.jsx   # Keyboard shortcuts help modal
│   ├── pages/
│   │   ├── LandingPage.jsx         # Marketing homepage (hero, features, how it works, footer)
│   │   ├── LearnApp.jsx            # Learning platform router
│   │   ├── ChatPage.jsx            # Full-page AI chat (uses AIContext)
│   │   └── DocsPage.jsx            # In-app documentation (20+ topics)
│   ├── learn/                      # Learning platform: 7 modules with theory, quiz, labs
│   ├── components/                 # Shared components
│   │   ├── GlobalNav.jsx           # Top navigation bar (uses ThemeContext)
│   │   ├── Footer.jsx              # Site footer with links
│   │   └── ToastContext.jsx        # Toast notification system
│   └── styles/
│       ├── design-system.css       # CSS variables, color tokens, dark/light themes
│       ├── components.css          # Reusable class styles (.btn, .card, .input, etc.)
│       └── animations.css          # Keyframe animations
├── backend/
│   ├── src/index.js                # Express API: health, config, AI proxy, /metrics
│   ├── package.json                # express, cors, axios, dotenv, express-rate-limit, prom-client
│   └── Dockerfile                  # Node.js 20-alpine, non-root user, healthcheck
├── k3s/
│   ├── manifests/                  # K8s resource manifests
│   │   ├── namespace.yaml          # Namespace: k8s-hub
│   │   ├── deployment.yaml         # Deployment: 2 containers (frontend+backend), PSS Restricted
│   │   ├── service.yaml            # ClusterIP Service: ports 80, 3001
│   │   ├── ingress.yaml            # Ingress: HTTP, TLS placeholders ready
│   │   ├── networkpolicy.yaml      # Pod firewall: allow Traefik + DNS + HTTPS only
│   │   ├── pdb.yaml                # PodDisruptionBudget: minAvailable 1
│   │   ├── hpa.yaml                # HorizontalPodAutoscaler: 2-6 replicas, CPU 70%, mem 80%
│   │   ├── servicemonitor.yaml     # Prometheus ServiceMonitor: scrape /metrics every 15s
│   │   ├── secret-store.yaml       # ESO ClusterSecretStore → Infisical
│   │   └── external-secret.yaml    # ExternalSecret: pulls OPENROUTER_API_KEY
│   ├── apps/                       # ArgoCD Application definitions
│   │   ├── website.yaml            # App → k3s/manifests/
│   │   ├── eso.yaml                # App → external-secrets Helm chart
│   │   └── monitoring.yaml         # App → kube-prometheus-stack Helm chart
│   ├── overlays/                   # Kustomize environment overlays
│   │   ├── base/kustomization.yaml # Base: references all manifests
│   │   ├── dev/kustomization.yaml  # Dev: 1 replica, low resources, dev- prefix
│   │   └── prod/kustomization.yaml # Prod: 3 replicas, higher limits, prod- prefix
│   └── bootstrap/                  # One-time cluster setup
│       ├── 1-install-argocd.sh     # Installs K3s, ArgoCD, ESO, metrics-server, Helm
│       └── 2-root-app.yaml         # ArgoCD App-of-Apps → k3s/apps/
├── docker-compose.yml              # Full stack: frontend (8080) + backend (3001)
├── azure-pipelines.yml             # CI/CD: validate → build → Trivy scan → push → update manifests
├── Dockerfile                      # Multi-stage: node:20-alpine build → nginx:1.27-alpine serve
├── docs/devops/                    # 10 comprehensive DevOps learning guides
│   ├── 01-docker.md                # Docker, Dockerfiles, docker-compose explained
│   ├── 02-kubernetes-manifests.md  # All K8s manifests explained line by line
│   ├── 03-gitops-argocd.md         # ArgoCD, App of Apps, bootstrap
│   ├── 04-secrets-management.md    # ESO, Infisical, secrets flow
│   ├── 05-cicd-pipeline.md         # Azure Pipelines, Trivy scanning
│   ├── 06-monitoring.md            # Prometheus, Grafana, ServiceMonitor
│   ├── 07-networking.md            # Services, Ingress, NetworkPolicy, DNS
│   ├── 08-security.md              # PSS Restricted, capabilities, seccomp, RBAC
│   ├── 09-scaling.md               # HPA, VPA, KEDA, PDB interaction
│   └── 10-kustomize.md             # Base+Overlay, patches, ArgoCD integration
├── AGENTS.md                       # This file
├── .gitignore
├── .dockerignore
└── .env.example
```

## Commands

### Frontend (root directory)
```bash
npm install          # Install frontend dependencies
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Production build → dist/
npm run preview      # Preview production build
```

### Backend (backend/ directory)
```bash
cd backend && npm install
npm run dev          # Start Express server (http://localhost:3001)
npm start            # Same as dev
```

### Docker
```bash
docker-compose up --build -d   # Full stack (frontend :8080, backend :3001)
docker-compose down            # Stop all services
```

### Kustomize
```bash
kubectl apply -k k3s/overlays/dev    # Deploy dev config
kubectl apply -k k3s/overlays/prod   # Deploy prod config
```

## Code Style Guidelines

### Imports
- ES modules (`import`/`export`) in frontend; CommonJS (`require`) in backend
- Import order: React → third-party → local imports (relative paths)
- All local imports use `.jsx` or `.js` extension explicitly
- Named exports preferred; default exports only for page components

### File Naming
- React components: `PascalCase.jsx`
- Context providers: `PascalContext.jsx`
- Utility files: `camelCase.js`
- CSS files: `kebab-case.css`
- K8s manifests: `kebab-case.yaml`

### Formatting
- **Indentation:** 2 spaces throughout
- **Semicolons:** Used consistently
- **String quotes:** Double quotes `"` for JSX; backticks for template literals
- **Arrow functions:** Preferred for callbacks; `function` for top-level exports

### React Conventions
- Functional components with hooks; class component only for `ErrorBoundary`
- Props destructured: `function Input({ value, onChange, theme })`
- Inline styles heavily used — `style={{}}` with numeric pixel values
- State: `useState` for local, `zustand` for global, `React.Context` for shared (theme, AI)

### Naming Conventions
- **Variables/functions:** `camelCase`
- **Components:** `PascalCase`
- **Constants/DB objects:** `UPPER_SNAKE_CASE` (e.g., `IMAGE_DB`, `RESOURCE_META`)
- **Storage keys:** Use `STORAGE_KEYS` from `src/utils/constants.js`

## AI System Architecture

The AI system uses a unified React Context pattern:

```
AIProvider (in main.jsx)
  ├── AIContext (state: messages, loading, model, panelOpen, input)
  ├── AIFloatingWidget (floating chat on all pages)
  └── useAI() hook (used by ChatPage.jsx, generator/app.jsx)
```

Key files:
- `src/ai/AIContext.jsx` — Provider with `send()`, `clear()`, `exportChat()` methods
- `src/ai/prompts.js` — `SYSTEM_PROMPTS` object with prompts for every scenario
- `src/ai/AIFloatingWidget.jsx` — Floating widget with chat UI, model selector, quick prompts

The AI is enabled/disabled by checking `/api/config` endpoint. When disabled, the widget doesn't render.

## Security Standards

### Pod Security (PSS Restricted)
- `runAsNonRoot: true`, `runAsUser: 1001`
- `readOnlyRootFilesystem: true` (frontend), `false` (backend)
- `allowPrivilegeEscalation: false`, `capabilities.drop: ALL`
- `seccompProfile.type: RuntimeDefault`

### NetworkPolicy
- Deny all ingress by default
- Allow only from Traefik and same-namespace pods
- Allow egress only to DNS (53) and HTTPS (443)

### Secrets
- Never commit secrets to Git
- Use ESO + Infisical for secret management
- K8s Secrets referenced via `secretKeyRef` with `optional: true`

## Git / CI/CD

### CI Pipeline (Azure Pipelines) — 4 stages:
1. **ValidateManifests** — yamllint on all K8s YAML
2. **BuildFrontend** — Docker build + push + Trivy scan
3. **BuildBackend** — Docker build + push + Trivy scan
4. **UpdateManifests** — Update image tags in git → triggers ArgoCD

### GitOps (ArgoCD)
- App-of-Apps pattern: `2-root-app.yaml` → `k3s/apps/`
- Auto-sync with `prune: true` and `selfHeal: true`
- Sources: plain YAML (`website.yaml`) and Helm charts (`eso.yaml`, `monitoring.yaml`)

### Kustomize Overlays
- `base/` — Shared configuration (all manifests)
- `dev/` — 1 replica, low resources, `dev-` name prefix
- `prod/` — 3 replicas, higher limits, `prod-` name prefix

## Backend Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check with AI status |
| GET | `/api/config` | Returns `{ aiEnabled: boolean, provider: "openrouter" }` |
| POST | `/api/ai/chat` | AI chat proxy to OpenRouter (rate limited: 20/min) |
| GET | `/metrics` | Prometheus metrics (prom-client format) |

## Important Notes for Future Sessions

1. **The user is learning DevOps** — always explain what you're doing and why
2. **The project is deployed on K3s** at server IP 43.157.50.97 (no domain yet)
3. **The user wants to make this public** — prioritize security, monitoring, and documentation
4. **AI uses OpenRouter** — the free model `google/gemma-3-27b-it:free` is the default
5. **The frontend and backend run in the same pod** — they communicate via localhost:3001
6. **Backend code is baked into Docker images** — NO ConfigMap injection (was removed)
7. **Always commit after making changes** — use descriptive commit messages
8. **The user wants to learn everything** — create documentation for new features
