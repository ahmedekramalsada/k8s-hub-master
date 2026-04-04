import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer.jsx';

// ═══════════════════════════════════════════════════════════════════
// DOCUMENTATION CONTENT — Complete for all sections
// ═══════════════════════════════════════════════════════════════════

const DOCS = {
  // ── Getting Started ────────────────────────────────────────────
  what: {
    section: 'Getting Started',
    title: 'What is K8s Hub?',
    content: `K8s Hub is an all-in-one Kubernetes platform that helps you generate production-ready YAML manifests and learn Kubernetes through interactive modules.

## Three Main Features

### ⚡ YAML Generator
Pick a resource type, fill in an intuitive form, and get production-ready YAML with:
- Intelligent defaults and image detection
- Real-time validation and linting
- Security scoring (A-F grade) with fix suggestions
- Dependency checking between resources
- Import existing YAML and convert to forms
- Export as Helm charts or bundled manifests

### 📚 Learning Platform
7 comprehensive modules from Docker basics to Helm mastery:
- Theory lessons with clear explanations
- Hands-on labs with real-world scenarios
- Quizzes to test your knowledge
- Cheat sheets for quick reference
- Troubleshooting guides for common issues

### 🤖 AI Assistant
Built-in AI tutor powered by OpenRouter that can:
- Review your YAML for errors and best practices
- Suggest security improvements
- Explain Kubernetes concepts in context
- Help debug issues (CrashLoopBackOff, OOMKilled, etc.)
- Generate YAML from natural language descriptions

## Built With Best Practices

K8s Hub itself is deployed on Kubernetes using:
- **GitOps** — ArgoCD for automated deployments
- **External Secrets** — ESO + Infisical for secret management
- **Monitoring** — Prometheus + Grafana for observability
- **CI/CD** — Azure Pipelines with Trivy security scanning
- **Security** — Pod Security Standards, NetworkPolicies, RBAC`,
  },

  quickstart: {
    section: 'Getting Started',
    title: 'Quick Start (3 Steps)',
    content: `Get production-ready Kubernetes YAML in under a minute.

## Step 1: Choose a Resource

Go to the **Generator** and pick a resource type from the dashboard. You'll see categories like:

- **Workloads** — Deployment, Pod, StatefulSet, DaemonSet, Job, CronJob
- **Networking** — Service, Ingress, NetworkPolicy
- **Config** — ConfigMap, Secret
- **Storage** — PersistentVolumeClaim, PersistentVolume
- **Security** — ServiceAccount, Role, RoleBinding
- **Scaling** — HPA, VPA

Or use the search bar to find what you need quickly.

## Step 2: Configure with Forms

Fill in the form fields. The generator provides:

- **Intelligent defaults** — sensible values for every field
- **Image detection** — automatically detects ports, env vars, and resource limits from image names
- **Real-time validation** — inline errors and warnings as you type
- **Security scoring** — A-F grade with specific fix suggestions
- **Beginner mode** — hover over field labels for explanations

## Step 3: Get Your YAML

Your YAML appears in the right panel in real-time. You can:

- **Copy** — One-click copy to clipboard
- **Download** — Save as \`.yaml\` file
- **Add to Bundle** — Combine multiple resources into one file
- **Validate** — Run comprehensive checks for errors and best practices
- **Ask AI** — Get AI review and suggestions

## Pro Tips

- Use **Templates** for common setups (Full Web App, PostgreSQL, GitOps Stack)
- Use the **Wizard** if you're new to Kubernetes
- Use **Ctrl+S** to download, **Ctrl+B** to add to bundle`,
  },

  interface: {
    section: 'Getting Started',
    title: 'Understanding the Interface',
    content: `The K8s Hub interface is designed for efficiency and clarity.

## Layout Overview

### Generator View
The main workspace has three panels:

**Left Panel — Resource Sidebar**
- Search bar to find resources quickly
- Categorized list of all 25+ resource types
- Click any resource to switch to it
- Quick-create button (⚡) for fast setup

**Middle Panel — Form**
- Sticky header with resource name and actions
- Collapsible sections for different configuration areas
- Inline validation with error/warning indicators
- Security badge showing current grade
- "Add to Bundle" and "Bundle →" action buttons

**Right Panel — YAML Output**
- Syntax-highlighted YAML with line numbers
- Copy and download buttons
- Validation toggle for error checking
- AI quick action chips (Explain, Review, Security, Optimize)

### Dashboard View
The landing page for the generator shows:
- Search bar for all resources
- Recently used resources as quick-access pills
- Resource cards grouped by category
- Each card shows icon, name, description, and category tag
- Hover to reveal "Configure →" and "Quick" action buttons

### Environment Toolbar
Located below the top navigation:
- **Environment presets** — Dev, Staging, Production, Minimal
- **Beginner mode** — Toggle hints and explanations
- **Shortcuts** — View all keyboard shortcuts

## Navigation

- **Home** — Landing page with overview
- **Generator** — YAML generation workspace
- **Learn** — Interactive learning platform
- **AI Chat** — Full-page AI conversation
- **Docs** — This documentation`,
  },

  shortcuts: {
    section: 'Getting Started',
    title: 'Keyboard Shortcuts',
    content: `Speed up your workflow with keyboard shortcuts.

## Global Shortcuts

| Shortcut | Action |
|----------|--------|
| \`Ctrl+K\` | Toggle AI panel |
| \`Ctrl+B\` | Add current resource to bundle |
| \`Ctrl+S\` | Download current YAML |
| \`Ctrl+D\` | Download entire bundle |
| \`Ctrl+?\` | Show keyboard shortcuts help |

## Generator Shortcuts

| Shortcut | Action |
|----------|--------|
| \`Ctrl+Enter\` | Generate/refresh YAML |
| \`Escape\` | Close modals and panels |

## Tips

- All shortcuts work on both Windows and Mac (\`Cmd\` replaces \`Ctrl\` on Mac)
- Shortcuts are context-aware — they only work when relevant
- You can see all shortcuts anytime with \`Ctrl+?\``,
  },

  // ── YAML Generator ─────────────────────────────────────────────
  'choosing-resources': {
    section: 'YAML Generator',
    title: 'Choosing a Resource Type',
    content: `K8s Hub supports 25+ Kubernetes resource types organized into categories.

## Resource Categories

### Workloads
- **Deployment** — Most common way to run apps. Manages replica sets and rolling updates.
- **Pod** — Smallest unit. Use for testing or static workloads.
- **StatefulSet** — For stateful apps (databases). Stable network identity and ordered deployment.
- **DaemonSet** — Runs one pod per node. Used for log collectors, monitoring agents.
- **Job** — Run to completion. One-off tasks like migrations or batch processing.
- **CronJob** — Scheduled jobs. Like Linux crontab for Kubernetes.
- **ReplicaSet** — Low-level replica management. Usually managed by Deployments.

### Networking
- **Service** — Stable network endpoint for pods. Types: ClusterIP, NodePort, LoadBalancer.
- **Ingress** — HTTP/HTTPS routing from outside the cluster. Requires an Ingress Controller.
- **NetworkPolicy** — Firewall rules for pod-to-pod communication.

### Configuration
- **ConfigMap** — Non-sensitive configuration as key-value pairs or files.
- **Secret** — Sensitive data (passwords, keys). Base64 encoded (not encrypted!).

### Storage
- **PersistentVolumeClaim** — Request storage for your pods.
- **PersistentVolume** — Define available storage (usually done by admins).
- **StorageClass** — Define storage types with different performance characteristics.

### Security
- **ServiceAccount** — Identity for pods. Controls API access.
- **Role / RoleBinding** — Namespace-scoped permissions.
- **ClusterRole / ClusterRoleBinding** — Cluster-wide permissions.

### Cluster Management
- **Namespace** — Isolate resources into virtual clusters.
- **PodDisruptionBudget** — Ensure minimum available pods during disruptions.
- **LimitRange** — Default resource limits for a namespace.
- **ResourceQuota** — Total resource limits for a namespace.

### Scaling
- **HPA** — Horizontal Pod Autoscaler. Scale replicas based on CPU/memory.
- **VPA** — Vertical Pod Autoscaler. Adjust resource requests/limits.

### GitOps & Observability
- **ArgoCD App** — Define GitOps applications for ArgoCD.
- **Kustomization** — Flux CD configuration management.
- **ServiceMonitor** — Tell Prometheus to scrape your app's metrics.

## How to Choose

**Starting a web app?** → Deployment + Service + Ingress
**Running a database?** → StatefulSet + Service + Secret + PVC
**Setting up CI/CD?** → ArgoCD App + Namespace
**Securing a microservice?** → Deployment + ServiceAccount + NetworkPolicy + PDB`,
  },

  'filling-forms': {
    section: 'YAML Generator',
    title: 'Filling Out Forms',
    content: `Each resource type has a tailored form with relevant fields and intelligent defaults.

## Form Structure

### Core Configuration
Every form starts with essential fields:
- **Name** — Resource name (validated for Kubernetes naming rules)
- **Namespace** — Where the resource will be created
- **Labels** — Key-value pairs for identification and selection

### Image Intelligence
When you enter a container image (e.g., \`nginx:latest\`), the generator automatically detects:
- Default ports (nginx → port 80)
- Common environment variables
- Recommended resource requests and limits

This saves time and ensures you don't miss important configuration.

### Collapsible Sections
Forms are organized into collapsible sections:
- **Ports** — Container ports and protocols
- **Environment** — Env vars, secret references, configmap references
- **Resources** — CPU and memory requests/limits
- **Health Probes** — Liveness and readiness checks
- **Volumes** — Persistent storage mounts
- **Security** — Service accounts, user IDs, read-only filesystem

### Validation & Feedback
- **Inline errors** — Red borders with error messages for invalid input
- **Warnings** — Yellow banners for potential issues (e.g., using \`latest\` tag)
- **Security badge** — A-F grade with specific improvement suggestions
- **Lint panel** — Detailed list of all validation issues

## Best Practices

1. **Always set resource limits** — Prevents resource starvation
2. **Use specific image tags** — Avoid \`latest\` in production
3. **Enable health probes** — Kubernetes can detect and fix issues
4. **Set security context** — Run as non-root, read-only filesystem
5. **Use ConfigMaps and Secrets** — Don't hardcode configuration`,
  },

  'understanding-yaml': {
    section: 'YAML Generator',
    title: 'Understanding Generated YAML',
    content: `The YAML output panel shows your configuration in real-time with syntax highlighting.

## YAML Structure

Every Kubernetes manifest has four main parts:

\`\`\`yaml
apiVersion: apps/v1        # API version
kind: Deployment           # Resource type
metadata:                  # Metadata
  name: my-app
  namespace: production
  labels:
    app: my-app
spec:                      # Specification
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    spec:
      containers:
      - name: my-app
        image: nginx:1.25
        ports:
        - containerPort: 80
\`\`\`

### apiVersion
The API group and version. Common values:
- \`apps/v1\` — Deployments, StatefulSets, DaemonSets
- \`v1\` — Pods, Services, ConfigMaps, Secrets
- \`networking.k8s.io/v1\` — Ingress, NetworkPolicy
- \`autoscaling/v2\` — HPA
- \`batch/v1\` — Jobs, CronJobs

### metadata
Identifies the resource:
- **name** — Unique within the namespace
- **namespace** — Logical grouping
- **labels** — Key-value pairs for selection
- **annotations** — Non-identifying metadata

### spec
The desired state. What you want Kubernetes to create and maintain.

## Syntax Highlighting

The YAML panel uses color coding:
- **Keys** — Blue/purple for property names
- **String values** — Green for text values
- **Numbers** — Orange for numeric values
- **Booleans** — Pink for true/false
- **Comments** — Gray for comments

## Copy & Download

- **Copy** — Copies to clipboard with one click
- **Download** — Saves as \`resource-name.yaml\` file
- **Bundle** — Combine multiple resources with \`---\` separators`,
  },

  validation: {
    section: 'YAML Generator',
    title: 'Validation & Security Scoring',
    content: `K8s Hub validates your configuration in real-time and provides a security grade.

## Validation Engine

The validator checks for:

### Errors (❌)
Critical issues that will cause failures:
- Missing required fields (name, image, etc.)
- Invalid naming conventions
- Conflicting configurations
- Missing selectors or mismatched labels

### Warnings (⚠️)
Potential issues that should be addressed:
- Using \`latest\` image tag
- Missing resource limits
- No health probes configured
- Running as root user
- No security context defined

### Info (💡)
Helpful suggestions:
- Recommended labels to add
- Best practice recommendations
- Alternative configurations

## Security Scoring (A-F)

Each resource gets a security grade based on:

| Factor | Weight | What It Checks |
|--------|--------|----------------|
| Resource Limits | 20% | CPU and memory requests/limits set |
| Security Context | 25% | runAsNonRoot, readOnlyRootFilesystem, capabilities |
| Image Security | 15% | Specific tag, no latest, private registry |
| Health Probes | 15% | Liveness and readiness probes configured |
| Service Account | 10% | Dedicated service account, automount disabled |
| Network Policy | 15% | NetworkPolicy defined for the workload |

### Grade Scale
- **A** — Production ready, all best practices followed
- **B** — Good, minor improvements possible
- **C** — Acceptable for development
- **D** — Needs significant improvements
- **F** — Critical security issues

## AI-Powered Fixes

When validation finds issues, you can click the **🤖 fix** button next to any error or warning. The AI will:
1. Analyze the specific issue
2. Suggest a fix with explanation
3. Provide the corrected YAML`,
  },

  bundles: {
    section: 'YAML Generator',
    title: 'Bundles: Combining Resources',
    content: `Bundles let you combine multiple Kubernetes resources into a single deployable unit.

## What is a Bundle?

A bundle is a collection of related resources that work together. For example, a web application bundle might include:
- Deployment (the application)
- Service (network access)
- Ingress (external routing)
- HPA (auto-scaling)
- ConfigMap (configuration)

## How to Use Bundles

### Adding Resources
1. Configure a resource in the generator
2. Click **"+ Add to Bundle"** or press \`Ctrl+B\`
3. The resource is added with its current configuration
4. Switch to the Bundle view to see all resources

### Managing Resources
In the Bundle view:
- **Toggle resources** — Click to enable/disable individual resources
- **Edit resources** — Click a resource name to go back and modify it
- **Remove resources** — Toggle off to remove from bundle
- **Dependency warnings** — See if required resources are missing

### Downloading
- **Ctrl+D** — Download the entire bundle as a single YAML file
- Resources are separated by \`---\` markers
- Each resource has a comment header for identification

## Dependency Checking

The bundle validator checks for:
- **Missing dependencies** — e.g., Ingress without a Service
- **Label mismatches** — Service selectors not matching Deployment labels
- **Namespace consistency** — All resources in the same namespace
- **Circular references** — Resources that depend on each other

## Templates

Start with a pre-built template for common setups:
- **Full Web App** — Deployment + Service + Ingress + HPA + ConfigMap
- **PostgreSQL Database** — StatefulSet + Service + Secret + PVC
- **GitOps Stack** — Namespace + ArgoCD App + ClusterIssuer
- **Secure Microservice** — Full stack with RBAC + NetworkPolicy
- **Scheduled Worker** — CronJob + ConfigMap + Namespace`,
  },

  templates: {
    section: 'YAML Generator',
    title: 'Templates: Quick Start',
    content: `Templates are pre-configured bundles for common Kubernetes setups.

## Available Templates

### 🌐 Full Web App
A complete web application stack:
- **Deployment** — 2 replicas, nginx:latest, rolling update
- **Service** — ClusterIP on port 80
- **Ingress** — TLS with Let's Encrypt, Traefik class
- **HPA** — 2-10 replicas, 70% CPU target
- **ConfigMap** — APP_ENV=production, LOG_LEVEL=info

### 🗄️ PostgreSQL Database
Stateful database setup:
- **StatefulSet** — 1 replica, postgres:15, 20Gi storage
- **Service** — ClusterIP on port 5432
- **Secret** — Database credentials
- **PVC** — 20Gi persistent storage

### 🔄 GitOps Stack
GitOps infrastructure:
- **Namespace** — production environment
- **ArgoCD App** — Points to your Git repo
- **ClusterIssuer** — Let's Encrypt for TLS

### 🔐 Secure Microservice
Production-ready microservice:
- **Namespace** — backend isolation
- **ServiceAccount** — Dedicated identity
- **Deployment** — 2 replicas with security context
- **Service** — ClusterIP
- **Secret** — API keys and passwords
- **ConfigMap** — Environment configuration
- **NetworkPolicy** — Firewall rules
- **PDB** — Minimum 1 available

### ⏰ Scheduled Worker
Background job processing:
- **Namespace** — workers isolation
- **ServiceAccount** — Dedicated identity
- **ConfigMap** — Job configuration
- **CronJob** — Runs at 2 AM daily

### 🟢 Basic Nginx Setup
Simple starter:
- **Deployment** — 2 replicas
- **Service** — ClusterIP

### 🔵 Blue-Green Deployment
Zero-downtime deployment strategy:
- **Deployment** — Blue version
- **Service** — Points to blue version

## Using Templates

1. Go to the **Templates** view
2. Click on any template card
3. All resources are loaded into your bundle
4. Review and customize each resource
5. Download the complete bundle`,
  },

  import: {
    section: 'YAML Generator',
    title: 'Importing Existing YAML',
    content: `Import existing YAML manifests and convert them to editable forms.

## How to Import

1. Go to the **Import** view
2. Paste your YAML or upload a \`.yaml\` file
3. Click **Parse** to analyze the content
4. Each resource is detected and converted to a form

## What Gets Imported

The importer extracts:
- **Resource type** — Deployment, Service, etc.
- **Metadata** — Name, namespace, labels
- **Spec** — All configuration fields
- **Raw YAML** — Original formatting preserved

## Multi-Document Support

You can import multiple resources at once:
- Separate documents with \`---\`
- Each document becomes a separate resource
- All are added to your bundle automatically

## Import Options

### Paste YAML
- Paste directly into the text area
- Supports single or multi-document YAML
- Real-time preview of detected resources

### Upload File
- Click **Upload** to select a \`.yaml\` or \`.yml\` file
- Supports files up to 1MB
- Multiple files can be imported sequentially

## After Import

- Resources appear in your bundle
- Click any resource to edit it in the form
- Changes are reflected in the regenerated YAML
- Original YAML is preserved for download`,
  },

  helm: {
    section: 'YAML Generator',
    title: 'Exporting as Helm Chart',
    content: `Convert your bundle into a deployable Helm chart.

## What is Helm?

Helm is the package manager for Kubernetes. It:
- **Templates** YAML files with variables
- **Manages** releases and rollbacks
- **Shares** applications as charts
- **Configures** deployments with values files

## Export Process

1. Build your bundle with all desired resources
2. Go to the **Helm** view
3. Configure chart metadata:
   - **Chart name** — Name of your Helm chart
   - **Version** — Semantic version (e.g., 1.0.0)
   - **Description** — What the chart deploys
   - **App version** — Version of your application
4. Click **Generate** to create the chart

## Generated Structure

\`\`\`
my-chart/
├── Chart.yaml          # Chart metadata
├── values.yaml         # Default configuration values
└── templates/
    ├── deployment.yaml # Deployment template
    ├── service.yaml    # Service template
    └── ...             # Other resources
\`\`\`

## Values File

The \`values.yaml\` file contains all configurable parameters:
- Image names and tags
- Replica counts
- Resource limits
- Environment variables
- Service ports

## Installing the Chart

\`\`\`bash
# Install with defaults
helm install my-release ./my-chart

# Install with custom values
helm install my-release ./my-chart -f custom-values.yaml

# Upgrade
helm upgrade my-release ./my-chart
\`\`\``,
  },

  // ── Kubernetes Concepts ────────────────────────────────────────
  'what-is-k8s': {
    section: 'Kubernetes Concepts',
    title: 'What is Kubernetes?',
    content: `Kubernetes (K8s) is an open-source container orchestration platform originally designed by Google and now maintained by the Cloud Native Computing Foundation (CNCF).

## The Problem Kubernetes Solves

Before Kubernetes:
- Running containers on individual servers
- Manual scaling and deployment
- No automatic recovery from failures
- Complex networking between services
- Difficult configuration management

With Kubernetes:
- **Self-healing** — Restarts failed containers, replaces unresponsive nodes
- **Auto-scaling** — Adds or removes containers based on demand
- **Rolling updates** — Deploys new versions without downtime
- **Service discovery** — Containers find each other automatically
- **Secret management** — Secure storage for passwords and keys
- **Load balancing** — Distributes traffic across containers

## Core Concepts

### Cluster
A Kubernetes cluster is a set of machines (nodes) working together:
- **Control Plane** — Manages the cluster (scheduling, scaling, health)
- **Worker Nodes** — Run your applications (pods)

### Pod
The smallest deployable unit. A pod wraps one or more containers that share:
- Network — Same IP address
- Storage — Shared volumes
- Lifecycle — Start and stop together

### Deployment
Manages multiple pod replicas with:
- Rolling updates and rollbacks
- Self-healing (replaces failed pods)
- Scaling (adjusts replica count)

### Service
Provides a stable network endpoint for pods (which are ephemeral and get new IPs when recreated).

## K8s Hub's Role

K8s Hub helps you write the YAML configuration files that tell Kubernetes what to run and how to run it. Instead of memorizing YAML syntax and best practices, you fill in forms and get production-ready manifests.`,
  },

  pods: {
    section: 'Kubernetes Concepts',
    title: 'Pods: The Smallest Unit',
    content: `A Pod is the smallest deployable unit in Kubernetes.

## What is a Pod?

A pod wraps one or more containers that share:
- **Network namespace** — Same IP address, can communicate via localhost
- **Storage volumes** — Shared persistent storage
- **Lifecycle** — They start and stop together

## Key Facts

- Pods are **ephemeral** — they can die and don't restart on their own
- You rarely create Pods directly — use **Deployments** instead
- Each Pod gets a **unique IP address** within the cluster
- Pods are scheduled onto **Nodes** (physical or virtual machines)
- A Pod can contain **multiple containers** (sidecar pattern)

## When to Use Pods Directly

- Testing and debugging
- Running a one-off task
- When you need fine-grained control over the pod lifecycle

## Example

\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.25
    ports:
    - containerPort: 80
\`\`\`

## In K8s Hub

Choose **"Pod"** from the dashboard to generate a Pod manifest with all configuration options.`,
  },

  deployments: {
    section: 'Kubernetes Concepts',
    title: 'Deployments: Managing Pods',
    content: `A Deployment is the most common way to run applications in Kubernetes. It manages ReplicaSets and Pods automatically.

## What Deployments Give You

- **Replicas** — Run multiple copies for high availability
- **Rolling updates** — Update without downtime
- **Rollbacks** — Go back to a previous version if something breaks
- **Self-healing** — Replace crashed pods automatically
- **Declarative updates** — Describe desired state, Kubernetes makes it happen

## Key Fields

| Field | Purpose |
|-------|---------|
| \`replicas\` | How many pod copies to run |
| \`strategy\` | RollingUpdate (default) or Recreate |
| \`selector\` | Labels to find which Pods to manage |
| \`template\` | The Pod specification |

## Rolling Update Strategy

The default strategy updates pods one at a time:
1. Create a new pod with the updated version
2. Wait for it to become ready
3. Remove an old pod
4. Repeat until all pods are updated

## Example

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web-app
        image: nginx:1.25
        ports:
        - containerPort: 80
\`\`\`

## In K8s Hub

Choose **"Deployment"** from the dashboard. Fill in name, image, replicas, ports, and resources. The generator handles all the boilerplate YAML for you.`,
  },

  services: {
    section: 'Kubernetes Concepts',
    title: 'Services: Networking Pods',
    content: `A Service provides a stable network endpoint for your Pods.

## Why Services?

Pods are ephemeral — they die and restart with new IPs. Services give you:
- A **stable IP address** that doesn't change
- **Load balancing** across healthy pods
- **Service discovery** — other pods can find your service by name

## Service Types

| Type | Use Case |
|------|----------|
| **ClusterIP** (default) | Internal communication within the cluster |
| **NodePort** | Expose on each node's IP at a static port |
| **LoadBalancer** | Create a cloud provider load balancer |
| **ExternalName** | Map to an external DNS name |

## How It Works

1. Service finds Pods using **label selectors**
2. Routes traffic to **healthy Pods** only
3. **Load balances** across all matching Pods
4. Handles Pod creation/deletion transparently

## Example

\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: web-app-service
spec:
  type: ClusterIP
  selector:
    app: web-app
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
\`\`\`

This routes traffic from port 80 on the Service to port 8080 on matching Pods.

## In K8s Hub

Choose **"Service"** and select the type. Link it to your Deployment's labels for automatic discovery.`,
  },

  ingress: {
    section: 'Kubernetes Concepts',
    title: 'Ingress: External Access',
    content: `An Ingress routes external HTTP/HTTPS traffic into your cluster.

## How It Works

\`\`\`
User → Ingress Controller → Ingress Rules → Service → Pod
\`\`\`

## Key Concepts

### Ingress Controller
The actual proxy that handles traffic. Common options:
- **Traefik** — Default in K3s
- **Nginx** — Most popular, feature-rich
- **HAProxy** — High performance
- **AWS ALB** — Native AWS integration

### Host Rules
Route by domain name:
\`\`\`yaml
rules:
- host: app.example.com
  http:
    paths:
    - path: /
      pathType: Prefix
      backend:
        service:
          name: web-app-service
          port:
            number: 80
\`\`\`

### Path Rules
Route by URL path:
- \`/api\` → backend service
- \`/\` → frontend service
- \`/static\` → CDN or static file service

### TLS
HTTPS encryption with certificates:
- Manual certificates
- **cert-manager** with Let's Encrypt (automatic)

## In K8s Hub

Choose **"Ingress"** and add your domain, paths, and TLS settings. The generator creates production-ready ingress manifests.`,
  },

  'configmaps-secrets': {
    section: 'Kubernetes Concepts',
    title: 'ConfigMaps & Secrets',
    content: `ConfigMaps and Secrets store configuration for your applications.

## ConfigMaps

Store non-sensitive configuration:
- Environment variables
- Configuration files
- Command-line arguments

\`\`\`yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_ENV: production
  LOG_LEVEL: info
  DATABASE_URL: postgres://db:5432/myapp
\`\`\`

## Secrets

Store sensitive data:
- Passwords
- API keys
- TLS certificates
- OAuth tokens

\`\`\`yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  DB_PASSWORD: cGFzc3dvcmQxMjM=  # base64 encoded
  API_KEY: c2VjcmV0LWtleS12YWx1ZQ==
\`\`\`

## Key Differences

| Aspect | ConfigMap | Secret |
|--------|-----------|--------|
| **Data** | Plain text | Base64 encoded |
| **Security** | Not encrypted | Not encrypted (just encoded!) |
| **Use for** | Non-sensitive config | Sensitive data |
| **Size limit** | 1MB | 1MB |

## Best Practices

1. **Never commit Secrets to Git** — use External Secrets Operator
2. **Use ConfigMaps for application configuration**
3. **Mount as environment variables or files**
4. **Rotate secrets regularly**
5. **Use RBAC to control access to Secrets**

## In K8s Hub

Choose **"ConfigMap"** or **"Secret"** and add your key-value pairs. The generator handles encoding and formatting.`,
  },

  storage: {
    section: 'Kubernetes Concepts',
    title: 'Storage: PVCs, PVs, and StorageClasses',
    content: `Kubernetes provides persistent storage for stateful applications.

## Storage Hierarchy

### StorageClass
Defines the **type** of storage available:
- Standard (HDD)
- SSD (fast)
- NFS (network)
- Cloud provider specific (EBS, Azure Disk, GCE PD)

### PersistentVolume (PV)
A piece of storage in the cluster, provisioned by an admin:
- Backed by physical storage (disk, NFS, cloud volume)
- Independent of any pod's lifecycle

### PersistentVolumeClaim (PVC)
A **request** for storage by a user:
- Specifies size and access mode
- Kubernetes finds a matching PV
- If none exists, dynamically provisions one

## Access Modes

| Mode | Description |
|------|-------------|
| **ReadWriteOnce** | Mounted by one node (most common) |
| **ReadOnlyMany** | Mounted by many nodes, read-only |
| **ReadWriteMany** | Mounted by many nodes, read-write |

## Example PVC

\`\`\`yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-data
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: 20Gi
\`\`\`

## Using Storage in Pods

\`\`\`yaml
spec:
  containers:
  - name: postgres
    image: postgres:15
    volumeMounts:
    - name: data
      mountPath: /var/lib/postgresql/data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: postgres-data
\`\`\`

## In K8s Hub

Choose **"PersistentVolumeClaim"** to generate storage manifests. StatefulSet forms include built-in storage configuration.`,
  },

  security: {
    section: 'Kubernetes Concepts',
    title: 'Security: RBAC, NetworkPolicies, and Pod Security',
    content: `Kubernetes provides multiple layers of security for your cluster.

## Pod Security Standards

Three levels of security enforcement:

### Privileged
- Unrestricted — no security constraints
- Use only for system components

### Baseline
- Minimally restrictive — prevents known privilege escalations
- Good default for most workloads

### Restricted
- Heavily restricted — follows security best practices
- Required for sensitive workloads

## RBAC (Role-Based Access Control)

Controls who can do what in the cluster:

### Role (namespace-scoped)
\`\`\`yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "watch", "list"]
\`\`\`

### RoleBinding
Links a Role to a user or service account:
\`\`\`yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: production
subjects:
- kind: ServiceAccount
  name: my-app
  namespace: production
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
\`\`\`

## NetworkPolicy

Firewall rules for pod-to-pod communication:

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-policy
spec:
  podSelector:
    matchLabels:
      app: api
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - port: 3000
\`\`\`

This allows only pods with \`app: frontend\` to reach the API on port 3000.

## Security Best Practices

1. **Run as non-root** — Set \`runAsNonRoot: true\`
2. **Read-only filesystem** — Set \`readOnlyRootFilesystem: true\`
3. **Drop capabilities** — Drop ALL, add only what's needed
4. **Use dedicated ServiceAccounts** — Don't use the default
5. **Set resource limits** — Prevent resource abuse
6. **Use NetworkPolicies** — Restrict pod communication
7. **Scan images** — Check for vulnerabilities before deploying

## In K8s Hub

The **Security Scoring** system grades each resource A-F and suggests specific improvements. Use the **Secure Microservice** template for a fully hardened setup.`,
  },

  scaling: {
    section: 'Kubernetes Concepts',
    title: 'Scaling: HPA, VPA, and KEDA',
    content: `Kubernetes offers multiple ways to scale your applications.

## HPA — Horizontal Pod Autoscaler

Adds or removes Pod replicas based on metrics.

### How It Works
1. Monitors CPU/memory usage of pods
2. Compares against target thresholds
3. Scales up when usage exceeds target
4. Scales down when usage drops

### Example
\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
\`\`\`

### Requirements
- **metrics-server** must be installed
- Resource **requests** must be set on pods

## VPA — Vertical Pod Autoscaler

Adjusts resource requests and limits for pods.

### How It Works
1. Monitors actual resource usage
2. Recommends optimal requests/limits
3. Can auto-apply recommendations (recreates pods)

### When to Use
- When you're unsure about resource requirements
- For optimizing cost and performance
- After running workloads for a while to gather data

## KEDA — Event-Driven Autoscaling

Scales based on external events, not just CPU/memory.

### Event Sources
- **Message queues** — RabbitMQ, Kafka, SQS
- **HTTP requests** — Scale based on request rate
- **Cron schedules** — Scale at specific times
- **Database metrics** — Scale based on query load

### Key Feature: Scale to Zero
KEDA can scale deployments to **zero replicas** when there's no traffic, saving costs.

## In K8s Hub

Choose **"HPA"** to generate autoscaling manifests. Set min/max replicas and CPU/memory targets.`,
  },

  gitops: {
    section: 'Kubernetes Concepts',
    title: 'GitOps: ArgoCD & Helm',
    content: `GitOps means: Git is the single source of truth for your infrastructure.

## How GitOps Works

1. You push YAML changes to a Git repository
2. ArgoCD detects the change (polls every 3 minutes)
3. ArgoCD syncs the cluster to match Git
4. If someone manually changes the cluster, ArgoCD reverts it (selfHeal)

## Benefits

- **Audit trail** — Every change is a git commit with author and message
- **Rollback** — \`git revert\` to undo changes
- **Consistency** — Cluster always matches Git
- **Collaboration** — Pull requests for infrastructure changes
- **Disaster recovery** — Rebuild cluster from Git

## ArgoCD

### App of Apps Pattern
\`\`\`
Root App
├── Website App → k3s/manifests/
├── ESO App → external-secrets (Helm)
└── Monitoring App → kube-prometheus-stack (Helm)
\`\`\`

### Auto-Sync Configuration
\`\`\`yaml
syncPolicy:
  automated:
    prune: true      # Delete resources not in Git
    selfHeal: true   # Revert manual changes
  syncOptions:
    - CreateNamespace=true
\`\`\`

## Helm

A package manager for Kubernetes:
- **Charts** — Packages of pre-configured resources
- **Values** — Customizable parameters
- **Templates** — YAML with variable substitution
- **Releases** — Deployed instances of charts

## Kustomize

Overlays for environment-specific configuration:
- **Base** — Shared configuration
- **Dev overlay** — 1 replica, low resources
- **Prod overlay** — 3 replicas, higher limits

## In K8s Hub

Choose **"ArgoCD App"** to generate ArgoCD manifests, or export your bundle as a **Helm chart** from the Helm view.`,
  },

  // ── Deployment Guides ──────────────────────────────────────────
  'docker-compose': {
    section: 'Deployment Guides',
    title: 'Running Locally (Docker Compose)',
    content: `Run K8s Hub locally using Docker Compose.

## Prerequisites

- Docker installed
- Docker Compose installed (included with Docker Desktop)

## Quick Start

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/ahmedekramalsada/k8s-hub-master.git
cd k8s-hub-master
\`\`\`

### 2. Configure Environment
\`\`\`bash
cp .env.example .env
# Edit .env — at minimum set FRONTEND_URL
\`\`\`

### 3. Run
\`\`\`bash
docker-compose up --build -d
\`\`\`

### 4. Access
- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3001/health

## Architecture

\`\`\`
┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │
│  (Nginx :80) │     │ (Node :3001) │
└──────────────┘     └──────────────┘
\`\`\`

The compose file runs two services:
- **frontend** — React app served by Nginx (port 8080)
- **backend** — Express API server (port 3001)

## Stopping

\`\`\`bash
docker-compose down
\`\`\`

## With AI Features

Add your OpenRouter API key to \`.env\`:
\`\`\`
OPENROUTER_API_KEY=sk-or-v1-xxxxx
\`\`\`

Without an API key, everything works except the AI chat assistant.`,
  },

  'k3s-argocd': {
    section: 'Deployment Guides',
    title: 'Deploying to K3s + ArgoCD',
    content: `Deploy K8s Hub to a production K3s cluster with GitOps.

## Prerequisites

- A Linux server (Ubuntu 22.04+)
- SSH access to the server
- A GitHub/GitLab repository with the K8s Hub code

## Step 1: Install K3s

\`\`\`bash
curl -sfL https://get.k3s.io | sh -
# Verify installation
sudo k3s kubectl get nodes
\`\`\`

## Step 2: Bootstrap ArgoCD

\`\`\`bash
chmod +x k3s/bootstrap/1-install-argocd.sh
./k3s/bootstrap/1-install-argocd.sh
\`\`\`

This installs:
- **ArgoCD** — GitOps controller
- **External Secrets Operator** — Secret management
- **metrics-server** — Required for HPA

## Step 3: Configure Git Repository

Edit these files with your repository URL:
- \`k3s/bootstrap/2-root-app.yaml\` (line 20)
- \`k3s/apps/website.yaml\` (line 23)
- \`k3s/manifests/deployment.yaml\` — Replace Docker Hub username

## Step 4: Apply Root App

\`\`\`bash
kubectl apply -f k3s/bootstrap/2-root-app.yaml
\`\`\`

ArgoCD will now:
1. Read \`k3s/apps/website.yaml\`
2. Watch \`k3s/manifests/\` in your Git repo
3. Auto-deploy all manifests to your cluster

## Step 5: Create Secrets

\`\`\`bash
kubectl create secret generic k8s-hub-secrets \\
  --namespace k8s-hub \\
  --from-literal=openrouter-api-key=sk-or-v1-xxxxx
\`\`\`

## Access

\`\`\`bash
# Get ArgoCD password
kubectl get secret argocd-initial-admin-secret -n argocd \\
  -o jsonpath="{.data.password}" | base64 -d

# Access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
\`\`\``,
  },

  'any-cluster': {
    section: 'Deployment Guides',
    title: 'Any Kubernetes Cluster',
    content: `Deploy K8s Hub to any Kubernetes cluster using raw manifests.

## Prerequisites

- Any Kubernetes cluster (EKS, GKE, AKS, minikube, kind)
- \`kubectl\` configured to access your cluster

## Deploy with kubectl

\`\`\`bash
# Apply all manifests
kubectl apply -f k3s/manifests/namespace.yaml
kubectl apply -f k3s/manifests/deployment.yaml
kubectl apply -f k3s/manifests/service.yaml
kubectl apply -f k3s/manifests/ingress.yaml
\`\`\`

## Or use Kustomize

\`\`\`bash
# Development config
kubectl apply -k k3s/overlays/dev

# Production config
kubectl apply -k k3s/overlays/prod
\`\`\`

## Verify Deployment

\`\`\`bash
# Check pods
kubectl get pods -n k8s-hub

# Check services
kubectl get svc -n k8s-hub

# Check ingress
kubectl get ingress -n k8s-hub
\`\`\`

## Access

\`\`\`bash
# Port forward to access locally
kubectl port-forward svc/k8s-hub -n k8s-hub 8080:80
\`\`\`

Then open http://localhost:8080`,
  },

  cicd: {
    section: 'Deployment Guides',
    title: 'CI/CD with Azure Pipelines',
    content: `Automated build, test, and deploy pipeline.

## Pipeline Stages

1. **ValidateManifests** — yamllint on all Kubernetes YAML
2. **BuildFrontend** — Docker build + push + Trivy scan
3. **BuildBackend** — Docker build + push + Trivy scan
4. **UpdateManifests** — Update image tags in Git → triggers ArgoCD

## Setup

### 1. Create Service Connection
- Go to Project Settings → Service Connections
- New → Docker Registry → Docker Hub
- Name it \`Docker Hub\`
- Enter your Docker Hub credentials

### 2. Create Variable Group
- Go to Pipelines → Library
- New variable group: \`dockerhub-credentials\`
- Add variables:
  - \`DOCKERHUB_USERNAME\` = your Docker Hub username
  - \`DOCKERHUB_TOKEN\` = your Docker Hub access token (mark as secret)

### 3. Create Pipeline
- Go to Pipelines → New Pipeline
- Select your repository
- Choose "Existing Azure Pipelines YAML file"
- Select \`/azure-pipelines.yml\`

## What Happens on Push

1. Push to \`main\` branch
2. Pipeline validates all Kubernetes YAML
3. Builds frontend Docker image → pushes to Docker Hub
4. Builds backend Docker image → pushes to Docker Hub
5. Updates image tags in Git manifests
6. ArgoCD detects the change and deploys

## Security Scanning

Trivy scans both images for:
- OS package vulnerabilities
- Application dependencies
- Misconfigurations
- Secrets in images`,
  },

  ssl: {
    section: 'Deployment Guides',
    title: 'SSL/HTTPS with cert-manager',
    content: `Enable HTTPS with automatic certificate renewal.

## Install cert-manager

\`\`\`bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml
\`\`\`

## Create ClusterIssuer

\`\`\`yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: traefik
\`\`\`

## Update Ingress

Add TLS configuration to your Ingress:

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: k8s-hub
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - k8s.example.com
    secretName: k8s-hub-tls
  rules:
  - host: k8s.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: k8s-hub
            port:
              number: 80
\`\`\`

## Verify

\`\`\`bash
# Check certificate
kubectl get certificate -n k8s-hub

# Check certificate request
kubectl get certificaterequest -n k8s-hub
\`\`\``,
  },

  monitoring: {
    section: 'Deployment Guides',
    title: 'Monitoring: Prometheus + Grafana',
    content: `Full observability stack for your cluster and applications.

## What Gets Installed

The ArgoCD monitoring app installs \`kube-prometheus-stack\` which includes:
- **Prometheus** — Metrics collection and storage
- **Grafana** — Dashboards and visualization
- **AlertManager** — Alert routing and notification
- **Node Exporter** — Host-level metrics (CPU, memory, disk)
- **kube-state-metrics** — Kubernetes object metrics

## Access Grafana

\`\`\`bash
kubectl port-forward svc/prometheus-grafana -n monitoring 3000:80
\`\`\`

Login: \`admin\` / \`k8shub-admin\`

## Access Prometheus

\`\`\`bash
kubectl port-forward svc/prometheus-kube-prometheus-prometheus -n monitoring 9090:9090
\`\`\`

## Application Metrics

K8s Hub exposes metrics at \`/metrics\` on port 3001. The ServiceMonitor tells Prometheus to scrape them every 15 seconds.

\`\`\`yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: k8s-hub
  namespace: k8s-hub
spec:
  selector:
    matchLabels:
      app: k8s-hub
  endpoints:
  - port: api
    path: /metrics
    interval: 15s
\`\`\`

## Key Metrics

- **Request rate** — API requests per second
- **Response time** — P50, P95, P99 latencies
- **Error rate** — 4xx and 5xx responses
- **AI usage** — Token counts, model usage
- **Resource usage** — CPU and memory per pod`,
  },

  // ── AI Assistant ───────────────────────────────────────────────
  'ai-capabilities': {
    section: 'AI Assistant',
    title: 'What Can the AI Do?',
    content: `The AI assistant is powered by OpenRouter, giving access to multiple AI models.

## Capabilities

### YAML Review
- Analyze your YAML for errors and best practices
- Suggest security improvements
- Check for missing required fields
- Validate label selectors and references

### Concept Explanation
- Explain Kubernetes concepts in context
- Compare different resource types
- Describe how components work together
- Provide real-world examples

### Debugging Help
- Diagnose CrashLoopBackOff errors
- Explain OOMKilled issues
- Debug networking problems
- Troubleshoot storage issues

### YAML Generation
- Generate YAML from natural language descriptions
- Create complex multi-resource setups
- Suggest configurations for specific use cases

### Optimization
- Suggest resource limits based on workload type
- Recommend security hardening
- Propose architecture improvements
- Identify cost optimization opportunities

## Models

The default model is \`google/gemma-3-27b-it:free\` (free tier). OpenRouter provides access to many models including:
- Google Gemma
- Meta Llama
- Mistral
- And many more

## Setup

1. Get an API key from [openrouter.ai](https://openrouter.ai)
2. Add it to your \`backend/.env\` or Kubernetes secret
3. The AI features become available automatically

Without an API key, all other features work — only the AI chat is disabled.`,
  },

  'ai-prompts': {
    section: 'AI Assistant',
    title: 'Best Prompts to Use',
    content: `Get the most out of the AI assistant with effective prompts.

## Effective Prompts

### Review & Validation
- "Review my YAML for production readiness"
- "What security issues does my Deployment have?"
- "Check if my Service selector matches my Deployment labels"
- "Are my resource limits appropriate for this workload?"

### Learning & Explanation
- "Explain the difference between Deployment and StatefulSet"
- "How does a Service find my Pods?"
- "What happens when a Pod crashes?"
- "Explain how Ingress routing works"

### Troubleshooting
- "How do I debug CrashLoopBackOff?"
- "My Pod is OOMKilled — what should I do?"
- "Why can't my Pod reach the database?"
- "How do I fix a pending Pod?"

### Generation & Configuration
- "Write a NetworkPolicy that allows only Ingress traffic"
- "Create an HPA that scales between 2 and 10 replicas"
- "Generate a Secret for database credentials"
- "Write a ConfigMap for a Node.js application"

### Optimization
- "Optimize my resource requests and limits"
- "How can I make this Deployment more secure?"
- "Suggest improvements for high availability"
- "What labels should I add for better organization?"

## Tips

1. **Be specific** — "Review my Deployment YAML for security issues" is better than "Review this"
2. **Include context** — Paste your YAML in the prompt
3. **Ask follow-ups** — "Why is that a problem?" "How do I fix it?"
4. **Use the quick chips** — The AI chips (Explain, Review, Security, Optimize) are pre-configured for common tasks`,
  },

  'ai-limitations': {
    section: 'AI Assistant',
    title: 'AI Limitations',
    content: `Understanding what the AI can and cannot do.

## What the AI Cannot Do

- **Execute commands** — It cannot run kubectl commands on your cluster
- **Access your cluster** — It has no direct connection to your Kubernetes cluster
- **Guarantee correctness** — Always review AI-generated YAML before applying
- **Replace expertise** — It's an assistant, not a replacement for understanding Kubernetes

## Best Practices

1. **Always review** AI-generated YAML before applying to your cluster
2. **Test in development** before deploying to production
3. **Use validation** — Run the generated YAML through the validator
4. **Check security scores** — Ensure the AI's suggestions meet your security requirements
5. **Verify dependencies** — Make sure referenced resources exist

## When to Trust the AI

- ✅ Explaining concepts and best practices
- ✅ Suggesting common configurations
- ✅ Identifying obvious security issues
- ✅ Providing troubleshooting steps

## When to Double-Check

- ⚠️ Complex multi-resource setups
- ⚠️ Custom resource definitions
- ⚠️ Production-critical configurations
- ⚠️ Security-sensitive settings

## Rate Limits

The AI endpoint is rate-limited to 20 requests per minute to prevent abuse.`,
  },

  // ── FAQ ────────────────────────────────────────────────────────
  'faq-general': {
    section: 'FAQ',
    title: 'General Questions',
    content: `Common questions about K8s Hub.

## Is K8s Hub free?

Yes, K8s Hub is completely free and open-source under the MIT license.

## Do I need an AI API key?

No. All features work without an API key. The AI assistant is optional — you only need a key if you want AI-powered YAML review and explanations.

## Can I use K8s Hub without Kubernetes?

Yes! The YAML Generator works standalone. You can generate, validate, and download YAML without any Kubernetes cluster. The generated YAML can be applied to any Kubernetes cluster later.

## What Kubernetes versions are supported?

K8s Hub generates YAML compatible with Kubernetes 1.19+. The generated manifests use stable API versions that work across all modern Kubernetes distributions.

## Can I contribute?

Yes! K8s Hub is open-source. You can:
- Report bugs on GitHub
- Submit pull requests
- Suggest new features
- Improve documentation

## Is my data stored anywhere?

All data is stored locally in your browser (localStorage). Nothing is sent to external servers except AI chat requests (which go through OpenRouter).`,
  },

  'faq-generator': {
    section: 'FAQ',
    title: 'Generator Issues',
    content: `Troubleshooting common generator problems.

## Why is my YAML invalid?

Common causes:
- **Missing required fields** — Name, image, etc.
- **Invalid naming** — Must be lowercase, alphanumeric, dashes only
- **Missing selectors** — Deployments need label selectors
- **Port conflicts** — Multiple containers using the same port

## Why is my security score low?

The most common reasons:
- No resource limits set
- Running as root user
- No health probes configured
- Using \`latest\` image tag
- No security context defined

## How do I combine multiple resources?

Use the **Bundle** feature:
1. Configure each resource
2. Click "+ Add to Bundle" for each
3. Go to Bundle view to see all resources
4. Download the complete bundle

## Can I import existing YAML?

Yes! Use the **Import** view to paste or upload existing YAML. It will be parsed and converted to editable forms.

## Why can't I see the AI panel?

The AI panel only appears when:
- An OpenRouter API key is configured
- The backend is running and healthy
- The \`/api/config\` endpoint returns \`aiEnabled: true\``,
  },

  'faq-deployment': {
    section: 'FAQ',
    title: 'Deployment Issues',
    content: `Troubleshooting deployment problems.

## My pod is in CrashLoopBackOff

Common causes:
- **Application error** — Check logs: \`kubectl logs <pod-name>\`
- **Missing config** — Required environment variables not set
- **Wrong image** — Image doesn't exist or has wrong tag
- **Resource limits too low** — Pod gets OOMKilled

## My service can't reach my pods

Check:
1. **Label selectors match** — Service selector must match Pod labels
2. **Ports are correct** — Service port and targetPort must be right
3. **Pods are running** — Check \`kubectl get pods\`
4. **NetworkPolicy** — May be blocking traffic

## My ingress isn't working

Check:
1. **Ingress Controller installed** — Traefik, Nginx, etc.
2. **DNS resolves** — Domain points to the cluster
3. **Service exists** — Backend service is running
4. **TLS certificate** — cert-manager configured correctly

## ArgoCD shows OutOfSync

This means the cluster state differs from Git:
- Someone made manual changes
- A resource failed to apply
- Check the ArgoCD UI for details
- Click "Sync" to reconcile

## How do I update the deployment?

With GitOps:
1. Push changes to your Git repository
2. ArgoCD auto-detects and syncs
3. Or manually sync from the ArgoCD UI

Without GitOps:
\`\`\`bash
kubectl apply -f k3s/manifests/
\`\`\``,
  },
};

// ═══════════════════════════════════════════════════════════════════
// SEARCH INDEX — flattened for fast searching
// ═══════════════════════════════════════════════════════════════════

const SEARCH_INDEX = Object.entries(DOCS).map(([id, doc]) => ({
  id,
  title: doc.title,
  section: doc.section,
  preview: doc.content.substring(0, 120).replace(/[#*`]/g, ''),
}));

// ═══════════════════════════════════════════════════════════════════
// CONTENT RENDERER — Markdown-like rendering
// ═══════════════════════════════════════════════════════════════════

function ContentRenderer({ content }) {
  const blocks = useMemo(() => {
    const result = [];
    let current = { type: 'paragraph', lines: [] };

    content.split('\n').forEach(line => {
      // Code block
      if (line.startsWith('```')) {
        if (current.type === 'code') {
          result.push({ ...current });
          current = { type: 'paragraph', lines: [] };
        } else {
          if (current.lines.length) result.push({ ...current });
          current = { type: 'code', lang: line.slice(3), lines: [] };
        }
        return;
      }

      if (current.type === 'code') {
        current.lines.push(line);
        return;
      }

      // Heading
      if (line.startsWith('## ')) {
        if (current.lines.length) result.push({ ...current });
        result.push({ type: 'h2', text: line.slice(3) });
        current = { type: 'paragraph', lines: [] };
        return;
      }

      if (line.startsWith('### ')) {
        if (current.lines.length) result.push({ ...current });
        result.push({ type: 'h3', text: line.slice(4) });
        current = { type: 'paragraph', lines: [] };
        return;
      }

      // Table
      if (line.includes('|') && line.trim().startsWith('|')) {
        if (current.type !== 'table') {
          if (current.lines.length) result.push({ ...current });
          current = { type: 'table', rows: [] };
        }
        const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
        if (!cells.every(c => /^[-:]+$/.test(c))) {
          current.rows.push(cells);
        }
        return;
      }

      if (current.type === 'table') {
        result.push({ ...current });
        current = { type: 'paragraph', lines: [] };
      }

      // Empty line = paragraph break
      if (!line.trim()) {
        if (current.lines.length) result.push({ ...current });
        current = { type: 'paragraph', lines: [] };
        return;
      }

      current.lines.push(line);
    });

    if (current.lines.length || current.type === 'table') result.push({ ...current });
    if (current.type === 'code') result.push({ ...current });

    return result;
  }, [content]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {blocks.map((block, i) => {
        if (block.type === 'h2') {
          return (
            <h2 key={i} style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)',
              color: 'var(--text-primary)', marginTop: 16,
              borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12,
            }}>{block.text}</h2>
          );
        }

        if (block.type === 'h3') {
          return (
            <h3 key={i} style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)',
              color: 'var(--color-primary-light)', marginTop: 8,
            }}>{block.text}</h3>
          );
        }

        if (block.type === 'code') {
          return (
            <div key={i} className="code-window">
              <div className="code-header">
                <div className="window-controls">
                  <span className="wc-red" />
                  <span className="wc-yellow" />
                  <span className="wc-green" />
                </div>
                <span className="code-lang">{block.lang || 'yaml'}</span>
              </div>
              <pre>{block.lines.join('\n')}</pre>
            </div>
          );
        }

        if (block.type === 'table') {
          return (
            <div key={i} style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                {block.rows.map((row, ri) => (
                  <tr key={ri} style={{
                    background: ri === 0 ? 'var(--bg-card)' : 'transparent',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{
                        padding: '10px 14px',
                        fontWeight: ri === 0 ? 700 : 400,
                        color: ri === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontFamily: ri === 0 ? 'var(--font-mono)' : 'var(--font-body)',
                        fontSize: ri === 0 ? 12 : 13,
                      }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </table>
            </div>
          );
        }

        // Paragraph with inline formatting
        return (
          <p key={i} style={{
            color: 'var(--text-secondary)', fontSize: 14.5, lineHeight: 1.8, margin: 0,
          }}>
            {block.lines.map((line, li) => {
              // List items
              if (line.startsWith('• ') || line.startsWith('- ')) {
                return (
                  <span key={li} style={{ display: 'block', marginLeft: 16, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: -12, color: 'var(--color-primary)' }}>•</span>
                    <InlineFormat text={line.slice(2)} />
                  </span>
                );
              }

              // Numbered items
              const numMatch = line.match(/^(\d+)\.\s(.*)/);
              if (numMatch) {
                return (
                  <span key={li} style={{ display: 'block', marginLeft: 16 }}>
                    <strong style={{ color: 'var(--color-primary-light)', marginRight: 6 }}>{numMatch[1]}.</strong>
                    <InlineFormat text={numMatch[2]} />
                  </span>
                );
              }

              return (
                <span key={li}>
                  {li > 0 && <br />}
                  <InlineFormat text={line} />
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}

function InlineFormat({ text }) {
  // Bold: **text** or __text__
  // Code: `text`
  // Backslash: \
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} style={{
        background: 'rgba(99,102,241,0.1)', color: 'var(--color-primary-light)',
        padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: '0.9em',
      }}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

// ═══════════════════════════════════════════════════════════════════
// DOCS PAGE
// ═══════════════════════════════════════════════════════════════════

const DOC_SECTIONS = [
  { title: 'Getting Started', icon: '🚀', items: ['what', 'quickstart', 'interface', 'shortcuts'] },
  { title: 'YAML Generator', icon: '⚡', items: ['choosing-resources', 'filling-forms', 'understanding-yaml', 'validation', 'bundles', 'templates', 'import', 'helm'] },
  { title: 'Kubernetes Concepts', icon: '☸️', items: ['what-is-k8s', 'pods', 'deployments', 'services', 'ingress', 'configmaps-secrets', 'storage', 'security', 'scaling', 'gitops'] },
  { title: 'Deployment Guides', icon: '📦', items: ['docker-compose', 'k3s-argocd', 'any-cluster', 'cicd', 'ssl', 'monitoring'] },
  { title: 'AI Assistant', icon: '🤖', items: ['ai-capabilities', 'ai-prompts', 'ai-limitations'] },
  { title: 'FAQ', icon: '❓', items: ['faq-general', 'faq-generator', 'faq-deployment'] },
];

export default function DocsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // URL-based section selection
  const activeSection = searchParams.get('doc') || 'what';

  const setActiveSection = (id) => {
    setSearchParams({ doc: id });
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search results
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return SEARCH_INDEX.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.section.toLowerCase().includes(q) ||
      item.preview.toLowerCase().includes(q)
    );
  }, [search]);

  const doc = DOCS[activeSection];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 60, zIndex: 150,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(12px)',
      }}>
        <div className="container" style={{ padding: '16px var(--sp-6)', display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 480 }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              fontSize: 16, opacity: 0.4, pointerEvents: 'none',
            }}>🔍</span>
            <input
              className="input"
              placeholder="Search documentation... (e.g. deployment, service, ingress)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                height: 44, paddingLeft: 42, fontSize: 14,
                borderRadius: 'var(--radius-lg)',
                fontFamily: 'var(--font-body)',
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'var(--bg-input)', border: 'none', borderRadius: '50%',
                width: 24, height: 24, color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
              }}>✕</button>
            )}
          </div>

          {/* Mobile sidebar toggle */}
          <button className="show-mobile" onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            display: 'none', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', padding: '8px 14px', color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)',
          }}>📖 Contents</button>

          {/* Breadcrumb */}
          {doc && (
            <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
              <span>{DOC_SECTIONS.find(s => s.items.includes(activeSection))?.icon}</span>
              <span>{doc.section}</span>
              <span style={{ opacity: 0.4 }}>/</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{doc.title}</span>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {search && searchResults.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-lg)', maxHeight: 400, overflowY: 'auto', zIndex: 200,
          }}>
            {searchResults.map(result => (
              <button
                key={result.id}
                onClick={() => { setActiveSection(result.id); setSearch(''); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '12px 24px', background: 'transparent', border: 'none',
                  borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{result.title}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{result.section} — {result.preview}...</div>
              </button>
            ))}
          </div>
        )}

        {search && searchResults.length === 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-lg)', padding: '24px', textAlign: 'center', zIndex: 200,
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No results for "<strong>{search}</strong>"</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>Try different keywords</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto' }}>
        {/* ── Sidebar ───────────────────────────────────────────── */}
        <aside style={{
          width: 300, flexShrink: 0, borderRight: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)', overflowY: 'auto', height: 'calc(100vh - 140px)',
          position: 'sticky', top: 140,
        }} className="hide-mobile">
          <div style={{ padding: '20px 20px 12px' }}>
            <div style={{ color: 'var(--text-dim)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Contents
            </div>
          </div>

          {DOC_SECTIONS.map(section => (
            <div key={section.title} style={{ marginBottom: 4 }}>
              <div style={{
                padding: '6px 20px', fontSize: 11, fontWeight: 700,
                color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>{section.icon}</span> {section.title}
              </div>
              {section.items.map(itemId => {
                const item = DOCS[itemId];
                if (!item) return null;
                const isActive = activeSection === itemId;
                return (
                  <button key={itemId} onClick={() => setActiveSection(itemId)} style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '5px 20px 5px 32px',
                    background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
                    border: 'none', borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                    color: isActive ? 'var(--color-primary-light)' : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)',
                    transition: 'all 150ms ease', fontWeight: isActive ? 600 : 400,
                  }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    {item.title}
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        {/* ── Content ───────────────────────────────────────────── */}
        <main style={{ flex: 1, minWidth: 0, padding: '32px 40px 80px', maxWidth: 900 }}>
          {doc ? (
            <>
              {/* Section badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 'var(--radius-full)',
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                fontSize: 12, color: 'var(--color-primary-light)', fontFamily: 'var(--font-mono)',
                marginBottom: 16,
              }}>
                {DOC_SECTIONS.find(s => s.items.includes(activeSection))?.icon} {doc.section}
              </div>

              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-3xl)',
                color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.2,
              }}>{doc.title}</h1>

              {/* Navigation links */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
                {(() => {
                  const allItems = DOC_SECTIONS.flatMap(s => s.items);
                  const idx = allItems.indexOf(activeSection);
                  const prev = idx > 0 ? allItems[idx - 1] : null;
                  const next = idx < allItems.length - 1 ? allItems[idx + 1] : null;
                  return (
                    <>
                      {prev && DOCS[prev] && (
                        <button onClick={() => setActiveSection(prev)} style={{
                          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)', padding: '6px 14px',
                          color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12,
                          fontFamily: 'var(--font-body)', transition: 'all 150ms ease',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >← {DOCS[prev].title}</button>
                      )}
                      {next && DOCS[next] && (
                        <button onClick={() => setActiveSection(next)} style={{
                          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)', padding: '6px 14px',
                          color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12,
                          fontFamily: 'var(--font-body)', transition: 'all 150ms ease',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >{DOCS[next].title} →</button>
                      )}
                    </>
                  );
                })()}
              </div>

              <ContentRenderer content={doc.content} />
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', marginBottom: 8 }}>Page not found</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>The documentation page you're looking for doesn't exist.</p>
              <Link to="/docs" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary)', color: 'white',
                textDecoration: 'none', fontWeight: 600, fontSize: 14,
              }}>← Back to Documentation</Link>
            </div>
          )}
        </main>

        {/* ── Table of Contents (Right Sidebar) ─────────────────── */}
        {doc && (
          <aside className="hide-mobile" style={{
            width: 220, flexShrink: 0, padding: '32px 16px 32px 0',
            position: 'sticky', top: 140, height: 'fit-content',
          }}>
            <div style={{ color: 'var(--text-dim)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              On This Page
            </div>
            {doc.content.split('\n').filter(line => line.startsWith('## ')).map((heading, i) => (
              <a key={i} href={`#${heading}`} style={{
                display: 'block', padding: '4px 0 4px 12px',
                borderLeft: '2px solid var(--border-subtle)',
                color: 'var(--text-muted)', fontSize: 12, textDecoration: 'none',
                transition: 'all 150ms ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderLeftColor = 'var(--color-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderLeftColor = 'var(--border-subtle)'; }}
              >
                {heading.slice(3)}
              </a>
            ))}
          </aside>
        )}
      </div>

      {/* ── Mobile Sidebar Overlay ──────────────────────────────── */}
      {sidebarOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'var(--bg-overlay)', backdropFilter: 'blur(8px)',
          animation: 'fadeIn 150ms ease',
        }} onClick={() => setSidebarOpen(false)}>
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: 300, height: '100%',
            background: 'var(--bg-surface)',
            borderRight: '1px solid var(--border-subtle)',
            padding: '20px 0', overflowY: 'auto',
            animation: 'slideInLeft 300ms var(--ease-out-expo)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '0 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: 'var(--text-dim)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Contents</div>
              <button onClick={() => setSidebarOpen(false)} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                borderRadius: '50%', width: 32, height: 32, color: 'var(--text-secondary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>
            {DOC_SECTIONS.map(section => (
              <div key={section.title} style={{ marginBottom: 4 }}>
                <div style={{
                  padding: '6px 20px', fontSize: 11, fontWeight: 700,
                  color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span>{section.icon}</span> {section.title}
                </div>
                {section.items.map(itemId => {
                  const item = DOCS[itemId];
                  if (!item) return null;
                  const isActive = activeSection === itemId;
                  return (
                    <button key={itemId} onClick={() => setActiveSection(itemId)} style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '8px 20px 8px 32px',
                      background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
                      border: 'none', borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                      color: isActive ? 'var(--color-primary-light)' : 'var(--text-muted)',
                      cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)',
                      fontWeight: isActive ? 600 : 400,
                    }}>
                      {item.title}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
