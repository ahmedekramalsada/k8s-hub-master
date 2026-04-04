# AGENTS.md — K8s Hub Repository Guide

## Project Overview

K8s Hub is a Kubernetes YAML Generator & Learning Platform with a React frontend and Express.js backend.

- **Frontend:** React 18 + Vite, no TypeScript, inline CSS-in-JS styling
- **Backend:** Express.js (Node.js), plain JavaScript
- **State Management:** Zustand
- **Styling:** CSS files + inline styles (design system in `src/styles/`)
- **No test framework configured** — no linting or formatting tools present

## Directory Structure

```
k8s-hub-master/
├── src/
│   ├── main.jsx                    # App entry point, routing, ErrorBoundary, ThemeProvider
│   ├── contexts/                   # React Context providers
│   │   └── ThemeContext.jsx        # Global dark/light theme state
│   ├── utils/                      # Shared utilities
│   │   ├── storage.js              # Safe localStorage get/set with prefix
│   │   ├── yaml.js                 # YAML download, copy, filename helpers
│   │   └── constants.js            # Routes, API endpoints, storage keys
│   ├── generator/                  # Core YAML generator feature
│   │   ├── app.jsx                 # Main generator orchestrator
│   │   ├── generators.js           # YAML generators, lint engine, security scoring
│   │   ├── components.jsx          # Reusable UI components (Input, Btn, KVList, etc.)
│   │   ├── forms.jsx               # Resource-specific form components
│   │   ├── schemas.js              # Zod validation schemas
│   │   ├── store.js                # Zustand store + React Flow state
│   │   ├── Dashboard.jsx           # Resource card picker
│   │   ├── nodes.jsx               # React Flow custom nodes
│   │   ├── VisualIDE.jsx           # Visual IDE view
│   │   └── Inspector.jsx           # Node property inspector
│   ├── pages/                      # Top-level pages
│   │   ├── LandingPage.jsx         # Marketing homepage (hero, features, how it works, footer)
│   │   ├── LearnApp.jsx            # Learning platform router
│   │   ├── ChatPage.jsx            # Full-page AI chat
│   │   └── DocsPage.jsx            # In-app documentation
│   ├── learn/                      # Learning platform submodule
│   │   ├── config/                 # Module definitions
│   │   ├── content/modules/N/      # Per-module theory, quiz, labs, scenarios, cheatsheet
│   │   ├── components/             # Learn-specific UI components
│   │   └── pages/                  # Learn page views
│   ├── components/                 # Shared components
│   │   ├── GlobalNav.jsx           # Top navigation bar
│   │   ├── Footer.jsx              # Site footer with links
│   │   ├── AIAssistant.jsx         # Floating AI chat widget (deprecated — being replaced)
│   │   └── ToastContext.jsx        # Toast notification system
│   └── styles/
│       ├── design-system.css       # CSS variables, color tokens, themes
│       ├── components.css          # Reusable class styles
│       └── animations.css          # Keyframe animations
├── backend/
│   ├── src/index.js                # Express API server (AI proxy, health, config)
│   └── Dockerfile                  # Node.js 20-alpine, non-root user
├── k3s/
│   ├── manifests/                  # K8s resource manifests
│   │   ├── namespace.yaml          # Namespace
│   │   ├── deployment.yaml         # Deployment (2 containers: frontend + backend)
│   │   ├── service.yaml            # ClusterIP Service
│   │   ├── ingress.yaml            # Ingress (HTTP, TLS placeholders ready)
│   │   ├── networkpolicy.yaml      # Pod firewall rules
│   │   ├── pdb.yaml                # PodDisruptionBudget
│   │   ├── hpa.yaml                # HorizontalPodAutoscaler
│   │   ├── servicemonitor.yaml     # Prometheus ServiceMonitor
│   │   ├── secret-store.yaml       # ESO ClusterSecretStore → Infisical
│   │   └── external-secret.yaml    # ExternalSecret pulling API keys
│   ├── apps/                       # ArgoCD Application definitions
│   │   ├── website.yaml            # App → k3s/manifests/
│   │   ├── eso.yaml                # App → ESO Helm chart
│   │   └── monitoring.yaml         # App → kube-prometheus-stack Helm chart
│   ├── overlays/                   # Kustomize environment overlays
│   │   ├── base/kustomization.yaml # Base config (all manifests)
│   │   ├── dev/kustomization.yaml  # Dev: 1 replica, low resources
│   │   └── prod/kustomization.yaml # Prod: 3 replicas, higher limits
│   └── bootstrap/                  # One-time cluster setup
│       ├── 1-install-argocd.sh     # K3s + ArgoCD + ESO + metrics-server
│       └── 2-root-app.yaml         # ArgoCD App-of-Apps
├── docker-compose.yml
├── azure-pipelines.yml             # CI/CD: build, Trivy scan, push, update manifests
├── Dockerfile                      # Multi-stage: node build → nginx serve
└── AGENTS.md                       # This file
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
cd backend
npm install          # Install backend dependencies
npm run dev          # Start Express server (http://localhost:3001)
npm start            # Same as dev (production entry)
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

### Single Test

No test framework is configured. To add tests, use Vitest:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
# Add to package.json: "test": "vitest"
# Run single test: npx vitest path/to/test.test.jsx
```

### Linting / Formatting

No linter or formatter is configured. If adding one:
```bash
npm install -D eslint prettier eslint-config-prettier
```

## Code Style Guidelines

### Imports

- Use ES modules (`import`/`export`) in frontend; CommonJS (`require`) in backend
- Import order: React → third-party libraries → local imports (relative paths)
- All local imports use `.jsx` or `.js` extension explicitly
- Named exports preferred; default exports only for page components and entry points

### File Naming

- React components: `PascalCase.jsx` (e.g., `GlobalNav.jsx`, `Footer.jsx`)
- Context providers: `PascalContext.jsx` (e.g., `ThemeContext.jsx`)
- Utility files: `camelCase.js` (e.g., `storage.js`, `yaml.js`)
- CSS files: `kebab-case.css` (e.g., `design-system.css`)
- K8s manifests: `kebab-case.yaml` (e.g., `networkpolicy.yaml`)

### Formatting

- **Indentation:** 2 spaces throughout
- **Semicolons:** Used consistently
- **String quotes:** Double quotes `"` for JSX; backticks for template literals
- **Arrow functions:** Preferred for callbacks; `function` for top-level exports
- **Trailing commas:** Generally present in multi-line arrays/objects

### React Conventions

- Functional components with hooks; class component only for `ErrorBoundary`
- Props destructured: `function Input({ value, onChange, theme })`
- Inline styles heavily used — `style={{}}` with numeric pixel values
- State: `useState` for local, `zustand` for global, `React.Context` for shared (theme)
- Event handlers: camelCase (`onClick`, `onChange`)

### Naming Conventions

- **Variables/functions:** `camelCase`
- **Components:** `PascalCase`
- **Constants/DB objects:** `UPPER_SNAKE_CASE` (e.g., `IMAGE_DB`, `RESOURCE_META`)
- **Storage keys:** Use `STORAGE_KEYS` from `src/utils/constants.js`
- **Theme object:** passed as `theme` prop; contains `bgCard`, `border`, `text`, etc.

### Types

- No TypeScript — plain JavaScript
- Zod used for validation schemas (`schemas.js`)
- Form data is loosely typed plain objects

### Error Handling

- **Frontend:** `ErrorBoundary` in `main.jsx`; try/catch in generators
- **Backend:** try/catch in route handlers; returns JSON `{ error: "message" }`
- **Toast notifications:** `useToast()` from `ToastContext.jsx`
- **CORS:** Configured with `FRONTEND_URL` env var, localhost fallback
- **Rate limiting:** 20 req/min per IP on AI chat endpoint

### CSS / Styling

- Design system: CSS custom properties in `design-system.css`
- Component classes in `components.css` (e.g., `.btn`, `.card`, `.input`)
- Heavy inline styles with theme objects for dark/light mode
- Responsive: mobile breakpoints at 768px
- Font: JetBrains Mono (monospace) throughout

### Backend Conventions

- Express.js with `cors`, `dotenv`, `axios`, `express-rate-limit`
- Middleware order: trust proxy → request logging → CORS → JSON parser → routes
- Graceful shutdown on `SIGTERM`/`SIGINT` with 10s timeout
- Environment variables: `PORT`, `FRONTEND_URL`, `OPENROUTER_API_KEY`, `NODE_ENV`

## Security Standards

### Pod Security (PSS Restricted)
- `runAsNonRoot: true`, `runAsUser: 1001`
- `readOnlyRootFilesystem: true` (frontend), `false` (backend)
- `allowPrivilegeEscalation: false`
- `capabilities.drop: ALL`
- `seccompProfile.type: RuntimeDefault`

### NetworkPolicy
- Deny all ingress by default
- Allow only from Traefik (Ingress controller) and same-namespace pods
- Allow egress only to DNS (port 53) and HTTPS (port 443)

### Secrets
- Never commit secrets to Git
- Use External Secrets Operator (ESO) + Infisical
- K8s Secrets referenced via `secretKeyRef` with `optional: true`

## Git / CI/CD

### CI Pipeline (Azure Pipelines)
1. **ValidateManifests** — yamllint on all K8s YAML
2. **BuildFrontend** — Docker build + push + Trivy scan
3. **BuildBackend** — Docker build + push + Trivy scan
4. **UpdateManifests** — Update image tags in git → triggers ArgoCD

### GitOps (ArgoCD)
- App-of-Apps pattern: `2-root-app.yaml` → `k3s/apps/`
- Auto-sync with `prune: true` and `selfHeal: true`
- Two deployment sources: plain YAML (`website.yaml`) and Helm charts (`eso.yaml`, `monitoring.yaml`)

### Kustomize Overlays
- `base/` — Shared configuration (all manifests)
- `dev/` — 1 replica, low resources, `dev-` name prefix
- `prod/` — 3 replicas, higher limits, `prod-` name prefix
