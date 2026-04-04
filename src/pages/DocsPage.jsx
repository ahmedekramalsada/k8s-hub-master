import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';

const SECTIONS = [
  {
    title: 'Getting Started',
    icon: '🚀',
    items: [
      { id: 'what', label: 'What is K8s Hub?' },
      { id: 'quickstart', label: 'Quick Start (3 steps)' },
      { id: 'interface', label: 'Understanding the Interface' },
      { id: 'shortcuts', label: 'Keyboard Shortcuts' },
    ],
  },
  {
    title: 'YAML Generator',
    icon: '⚡',
    items: [
      { id: 'choosing-resources', label: 'Choosing a Resource Type' },
      { id: 'filling-forms', label: 'Filling Out Forms' },
      { id: 'understanding-yaml', label: 'Understanding Generated YAML' },
      { id: 'validation', label: 'Validation & Security Scoring' },
      { id: 'bundles', label: 'Bundles: Combining Resources' },
      { id: 'templates', label: 'Templates: Quick Start' },
      { id: 'import', label: 'Importing Existing YAML' },
      { id: 'helm', label: 'Exporting as Helm Chart' },
    ],
  },
  {
    title: 'Kubernetes Concepts',
    icon: '☸️',
    items: [
      { id: 'what-is-k8s', label: 'What is Kubernetes?' },
      { id: 'pods', label: 'Pods: The Smallest Unit' },
      { id: 'deployments', label: 'Deployments: Managing Pods' },
      { id: 'services', label: 'Services: Networking Pods' },
      { id: 'ingress', label: 'Ingress: External Access' },
      { id: 'configmaps-secrets', label: 'ConfigMaps & Secrets' },
      { id: 'storage', label: 'Storage: PVCs, PVs' },
      { id: 'security', label: 'Security: RBAC, NetworkPolicies' },
      { id: 'scaling', label: 'Scaling: HPA, VPA' },
      { id: 'gitops', label: 'GitOps: ArgoCD & Helm' },
    ],
  },
  {
    title: 'Deployment Guides',
    icon: '📦',
    items: [
      { id: 'docker-compose', label: 'Running Locally (Docker Compose)' },
      { id: 'k3s-argocd', label: 'Deploying to K3s + ArgoCD' },
      { id: 'any-cluster', label: 'Any Kubernetes Cluster' },
      { id: 'cicd', label: 'CI/CD with Azure Pipelines' },
      { id: 'ssl', label: 'SSL/HTTPS with cert-manager' },
      { id: 'monitoring', label: 'Monitoring: Prometheus + Grafana' },
    ],
  },
  {
    title: 'AI Assistant',
    icon: '🤖',
    items: [
      { id: 'ai-capabilities', label: 'What Can the AI Do?' },
      { id: 'ai-prompts', label: 'Best Prompts to Use' },
      { id: 'ai-limitations', label: 'AI Limitations' },
    ],
  },
  {
    title: 'FAQ',
    icon: '❓',
    items: [
      { id: 'faq-general', label: 'General Questions' },
      { id: 'faq-generator', label: 'Generator Issues' },
      { id: 'faq-deployment', label: 'Deployment Issues' },
    ],
  },
];

function DocContent({ sectionId }) {
  const content = {
    what: {
      title: 'What is K8s Hub?',
      body: `K8s Hub is an all-in-one Kubernetes platform that helps you generate production-ready YAML manifests and learn Kubernetes through interactive modules.

It has three main features:
1. YAML Generator — Pick a resource type, fill in a form, get production-ready YAML with validation and security scoring.
2. Learning Platform — 7 modules from Docker basics to Helm mastery, with hands-on labs and quizzes.
3. AI Assistant — Built-in AI tutor that reviews your YAML, suggests improvements, and explains concepts.

K8s Hub itself is deployed on Kubernetes using GitOps (ArgoCD), with external secrets management (ESO + Infisical), monitoring (Prometheus + Grafana), and CI/CD (Azure Pipelines).`,
    },
    quickstart: {
      title: 'Quick Start (3 Steps)',
      body: `Step 1: Choose a Resource
Go to the Generator and pick a resource type from the dashboard (e.g., Deployment, Service, Ingress).

Step 2: Configure with Forms
Fill in the form fields. The generator provides intelligent defaults, image detection, and real-time validation.

Step 3: Get Your YAML
Your YAML appears in the right panel. You can:
• Copy it to clipboard
• Download as .yaml file
• Add to a bundle (combine multiple resources)
• Validate it for errors and security issues
• Ask AI for review and suggestions`,
    },
    shortcuts: {
      title: 'Keyboard Shortcuts',
      body: `Ctrl+K — Open AI panel
Ctrl+B — Add current resource to bundle
Ctrl+S — Download current YAML
Ctrl+D — Download entire bundle
Ctrl+? — Show keyboard shortcuts (coming soon)`,
    },
    'what-is-k8s': {
      title: 'What is Kubernetes?',
      body: `Kubernetes (K8s) is an open-source container orchestration platform. It automates deploying, scaling, and managing containerized applications.

Think of it this way:
• Docker runs one container on one machine.
• Kubernetes runs hundreds of containers across many machines.

Kubernetes handles:
• Self-healing — Restart failed containers automatically
• Scaling — Add or remove containers based on demand
• Rolling updates — Deploy new versions without downtime
• Service discovery — Containers find each other automatically
• Secret management — Secure storage for passwords and keys
• Load balancing — Distribute traffic across containers

K8s Hub helps you write the YAML configuration files that tell Kubernetes what to run and how to run it.`,
    },
    pods: {
      title: 'Pods: The Smallest Unit',
      body: `A Pod is the smallest deployable unit in Kubernetes. It wraps one or more containers that share:
• Network — Same IP address, can talk via localhost
• Storage — Shared volumes
• Lifecycle — They start and stop together

Key facts:
• Pods are ephemeral — they die and don't restart on their own
• You rarely create Pods directly — use Deployments instead
• Each Pod gets a unique IP address
• Pods are scheduled onto Nodes (physical/virtual machines)

Example Pod:
  kubectl run nginx --image=nginx:alpine

In K8s Hub: Choose "Pod" from the dashboard to generate a Pod manifest.`,
    },
    deployments: {
      title: 'Deployments: Managing Pods',
      body: `A Deployment manages multiple Pod replicas. It's the most common way to run applications in Kubernetes.

What Deployments give you:
• Replicas — Run multiple copies for high availability
• Rolling updates — Update without downtime
• Rollbacks — Go back to a previous version if something breaks
• Self-healing — Replace crashed pods automatically

Key fields:
• replicas — How many copies to run
• strategy — RollingUpdate (default) or Recreate
• selector — Labels to find which Pods to manage
• template — The Pod specification

In K8s Hub: Choose "Deployment" from the dashboard. Fill in name, image, replicas, ports, and resources.`,
    },
    services: {
      title: 'Services: Networking Pods',
      body: `A Service provides a stable network endpoint for your Pods. Since Pods are ephemeral (they die and restart with new IPs), Services give you a consistent address.

Service types:
• ClusterIP (default) — Internal only, reachable within the cluster
• NodePort — Exposes on every node's IP at a high port
• LoadBalancer — Creates a cloud load balancer
• ExternalName — Maps to an external DNS name

How it works:
1. Service finds Pods using label selectors
2. Routes traffic to healthy Pods
3. Load balances across all matching Pods

In K8s Hub: Choose "Service" and select the type. Link it to your Deployment's labels.`,
    },
    ingress: {
      title: 'Ingress: External Access',
      body: `An Ingress routes external HTTP traffic into your cluster. It's like a reverse proxy managed by Kubernetes.

How it works:
User → Ingress Controller (Traefik/Nginx) → Ingress Rules → Service → Pod

Key concepts:
• Ingress Controller — The actual proxy (Traefik in K3s, Nginx elsewhere)
• Host rules — Route by domain name (app.example.com)
• Path rules — Route by URL path (/api → backend, / → frontend)
• TLS — HTTPS encryption with certificates

In K8s Hub: Choose "Ingress" and add your domain, paths, and TLS settings.`,
    },
    'configmaps-secrets': {
      title: 'ConfigMaps & Secrets',
      body: `ConfigMaps store non-sensitive configuration (environment variables, config files).
Secrets store sensitive data (passwords, API keys, TLS certificates).

Key differences:
• ConfigMaps — Plain text, for non-sensitive config
• Secrets — Base64 encoded (NOT encrypted!), for sensitive data

Best practices:
• Never commit Secrets to Git
• Use External Secrets Operator (ESO) to pull secrets from a secret manager
• Use ConfigMaps for application configuration
• Mount as environment variables or files

In K8s Hub: Choose "ConfigMap" or "Secret" and add your key-value pairs.`,
    },
    scaling: {
      title: 'Scaling: HPA, VPA',
      body: `HPA (Horizontal Pod Autoscaler) — Adds/removes Pod replicas based on metrics.
• Scales out (more pods) when CPU/memory is high
• Scales in (fewer pods) when traffic drops
• Requires metrics-server installed

VPA (Vertical Pod Autoscaler) — Adjusts resource requests/limits.
• Increases CPU/memory limits if Pod needs more
• Decreases limits if Pod is over-provisioned
• Can restart Pods to apply changes

KEDA — Event-driven autoscaling.
• Scales based on external events (queue length, HTTP requests)
• Can scale to zero (no pods when idle)

In K8s Hub: Choose "HPA" and set min/max replicas and CPU target.`,
    },
    gitops: {
      title: 'GitOps: ArgoCD & Helm',
      body: `GitOps means: Git is the single source of truth for your infrastructure.

How it works:
1. You push YAML changes to Git
2. ArgoCD detects the change
3. ArgoCD syncs the cluster to match Git
4. If someone manually changes the cluster, ArgoCD reverts it (selfHeal)

Benefits:
• Audit trail — Every change is a git commit
• Rollback — git revert to undo changes
• Consistency — Cluster always matches Git
• Collaboration — Pull requests for infrastructure changes

Helm is a package manager for Kubernetes. It templates YAML files with values.
Kustomize overlays base configs with environment-specific changes.

In K8s Hub: Choose "ArgoCD App" to generate ArgoCD manifests, or export your bundle as a Helm chart.`,
    },
    'docker-compose': {
      title: 'Running Locally (Docker Compose)',
      body: `Prerequisites: Docker and Docker Compose installed.

1. Clone the repository
2. Create .env file from .env.example
3. Run: docker-compose up --build -d
4. Open: http://localhost:8080

The compose file runs two services:
• frontend — React app served by Nginx (port 8080)
• backend — Express API server (port 3001)

To stop: docker-compose down`,
    },
    'k3s-argocd': {
      title: 'Deploying to K3s + ArgoCD',
      body: `Prerequisites: A Linux server with SSH access.

1. Install K3s: curl -sfL https://get.k3s.io | sh -
2. Run the bootstrap script: ./k3s/bootstrap/1-install-argocd.sh
3. Edit k3s/bootstrap/2-root-app.yaml with your Git repo URL
4. Apply: kubectl apply -f k3s/bootstrap/2-root-app.yaml
5. ArgoCD will sync your manifests automatically

The bootstrap installs:
• ArgoCD — GitOps controller
• External Secrets Operator — Secret management
• metrics-server — Required for HPA`,
    },
    monitoring: {
      title: 'Monitoring: Prometheus + Grafana',
      body: `K8s Hub includes a monitoring stack via ArgoCD:

1. kube-prometheus-stack (Helm chart) installs:
   • Prometheus — Metrics collection
   • Grafana — Dashboards
   • AlertManager — Alerts
   • Node Exporter — Host metrics
   • kube-state-metrics — K8s object metrics

2. Access Grafana:
   kubectl port-forward svc/prometheus-grafana -n monitoring 3000:80
   Login: admin / k8shub-admin

3. Access Prometheus:
   kubectl port-forward svc/prometheus-kube-prometheus-prometheus -n monitoring 9090:9090

4. Your app exposes metrics at /metrics on port 3001.
   The ServiceMonitor tells Prometheus to scrape them.`,
    },
    'ai-capabilities': {
      title: 'What Can the AI Do?',
      body: `The AI assistant (powered by OpenRouter) can:
• Review your YAML for errors and best practices
• Suggest security improvements
• Explain Kubernetes concepts
• Help debug issues (CrashLoopBackOff, OOMKilled, etc.)
• Generate YAML from descriptions
• Compare configurations

The AI has context about your current YAML, resource type, and validation errors.`,
    },
    'ai-prompts': {
      title: 'Best Prompts to Use',
      body: `Effective prompts:
• "Review my YAML for production readiness"
• "What security issues does my Deployment have?"
• "Explain the difference between Deployment and StatefulSet"
• "How do I debug CrashLoopBackOff?"
• "Write a NetworkPolicy that allows only Ingress traffic"
• "Optimize my resource requests and limits"

Tips:
• Be specific about what you want
• Include your YAML in the prompt
• Ask follow-up questions for clarification`,
    },
  };

  const c = content[sectionId];
  if (!c) return null;

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)',
        color: 'var(--text-primary)', marginBottom: 24,
        borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16,
      }}>{c.title}</h2>
      {c.body.split('\n\n').map((para, i) => (
        <p key={i} style={{
          color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 16,
        }}>
          {para.split('\n').map((line, j) => (
            <span key={j}>
              {j > 0 && <br />}
              {line.startsWith('• ') ? (
                <span style={{ display: 'block', marginLeft: 16 }}>{line}</span>
              ) : line.match(/^\d+\./) ? (
                <span style={{ display: 'block', marginLeft: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{line}</span>
              ) : line.startsWith('  ') ? (
                <code style={{ display: 'block', background: 'var(--yaml-bg)', padding: '8px 12px', borderRadius: 6, color: '#a0f0c0', fontFamily: 'var(--font-mono)', fontSize: 13, margin: '8px 0' }}>{line.trim()}</code>
              ) : (
                line
              )}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('what');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', background: 'var(--bg-app)', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: 280, flexShrink: 0, borderRight: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)', overflowY: 'auto', height: 'calc(100vh - 60px)',
        position: 'sticky', top: 60,
      }} className="hide-mobile">
        <div style={{ padding: '24px 20px 16px' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16,
            color: 'var(--text-primary)', marginBottom: 4,
          }}>Documentation</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Everything you need to know</p>
        </div>

        {SECTIONS.map(section => (
          <div key={section.title} style={{ marginBottom: 8 }}>
            <div style={{
              padding: '8px 20px', fontSize: 11, fontWeight: 700,
              color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>{section.icon}</span> {section.title}
            </div>
            {section.items.map(item => (
              <button key={item.id} onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }} style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '6px 20px 6px 32px',
                background: activeSection === item.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                border: 'none', borderLeft: activeSection === item.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeSection === item.id ? 'var(--color-primary-light)' : 'var(--text-muted)',
                cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)',
                transition: 'all 150ms ease',
              }}
                onMouseEnter={e => { if (activeSection !== item.id) e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { if (activeSection !== item.id) e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* Mobile sidebar toggle */}
      <button className="show-mobile" onClick={() => setSidebarOpen(!sidebarOpen)} style={{
        position: 'fixed', bottom: 20, left: 20, zIndex: 100,
        background: 'var(--color-primary)', border: 'none', borderRadius: '50%',
        width: 48, height: 48, color: 'white', fontSize: 20, cursor: 'pointer',
        display: 'none', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
      }}>📖</button>

      {/* Content */}
      <main style={{ flex: 1, maxWidth: 800, padding: '40px 32px', overflowY: 'auto' }}>
        <DocContent sectionId={activeSection} />
      </main>
    </div>
  );
}
