// ═══════════════════════════════════════════════════════════════════
// K8S ULTIMATE GENERATOR — Part 4: app.jsx
// Main App — all views wired together
// Usage: This is the entry point. Import all other parts.
// ═══════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from "react";
import { GENERATORS, RESOURCE_META, CATEGORIES, validateYAML, generateHelmChart, checkDependencies, highlightYAML, ENV_PRESETS, productionChecklist, getTheme, rawYamlToString, lintResource, smartName } from "./generators.js";
import { TopNav, Sidebar, YAMLPanel, Btn, Input, Textarea, Select, KVList, SecurityBadge, Section, FieldGroup, YAMLImporter, ImportedResourceCard, GenericResourceEditor, MobileStyles, AIChips, QuickCreateModal } from "./components.jsx";
import { ResourceForm } from "./forms.jsx";
import { useToast } from "../components/ToastContext.jsx";
import { useAI } from "../ai/AIContext.jsx";
import { SYSTEM_PROMPTS, QUICK_PROMPTS } from "../ai/prompts.js";
import Dashboard from "./Dashboard.jsx";
import LineNumbers from "./LineNumbers.jsx";
import KeyboardShortcuts from "./KeyboardShortcuts.jsx";


// ═══════════════════════════════════════════════════════════════════
// TEMPLATES DATA
// ═══════════════════════════════════════════════════════════════════
const APP_TEMPLATES = {
  "Full Web App": {
    icon: "🌐", color: "#6366f1",
    desc: "Deployment + Service + Ingress + HPA + ConfigMap",
    resources: {
      Deployment: { name: "web-app", namespace: "production", image: "nginx:latest", replicas: "2", ports: [{ port: "80", name: "http", protocol: "TCP" }], cpuReq: "100m", cpuLim: "500m", memReq: "128Mi", memLim: "256Mi", enableProbe: true, probePath: "/", strategy: "RollingUpdate" },
      Service: { name: "web-app-service", namespace: "production", selector: "web-app", serviceType: "ClusterIP", ports: [{ port: "80", targetPort: "80", name: "http" }] },
      Ingress: { name: "web-app-ingress", namespace: "production", ingressClass: "traefik", rules: [{ host: "app.yourdomain.com", path: "/", service: "web-app-service", port: "80" }], tls: true, clusterIssuer: "letsencrypt-prod" },
      HPA: { name: "web-app-hpa", namespace: "production", target: "web-app", minReplicas: "2", maxReplicas: "10", cpuTarget: "70" },
      ConfigMap: { name: "web-app-config", namespace: "production", data: [{ k: "APP_ENV", v: "production" }, { k: "LOG_LEVEL", v: "info" }] },
    }
  },
  "PostgreSQL Database": {
    icon: "🗄️", color: "#06b6d4",
    desc: "StatefulSet + Service + Secret + PVC",
    resources: {
      StatefulSet: { name: "postgres", namespace: "default", image: "postgres:15", replicas: "1", ports: [{ port: "5432", name: "db", protocol: "TCP" }], storage: "20Gi", storageClass: "standard", mountPath: "/var/lib/postgresql/data", cpuReq: "250m", cpuLim: "500m", memReq: "256Mi", memLim: "512Mi", envVars: [{ k: "POSTGRES_DB", v: "mydb" }, { k: "POSTGRES_USER", v: "admin" }] },
      Service: { name: "postgres-service", namespace: "default", selector: "postgres", serviceType: "ClusterIP", ports: [{ port: "5432", targetPort: "5432", name: "db" }] },
      Secret: { name: "postgres-secret", namespace: "default", secretType: "Opaque", data: [{ k: "POSTGRES_PASSWORD", v: "changeme-use-strong-password" }] },
    }
  },
  "GitOps Stack": {
    icon: "🔄", color: "#818cf8",
    desc: "Namespace + ArgoCD App + ClusterIssuer",
    resources: {
      Namespace: { name: "production", labels: [{ k: "env", v: "production" }, { k: "managed-by", v: "argocd" }] },
      "ArgoCD App": { name: "my-app", namespace: "production", repoURL: "https://github.com/user/repo", branch: "HEAD", path: "k8s/", project: "default", prune: "true", selfHeal: "true" },
      ClusterIssuer: { name: "letsencrypt-prod", email: "admin@domain.com", ingressClass: "traefik", staging: false },
    }
  },
  "Secure Microservice": {
    icon: "🔐", color: "#ef4444",
    desc: "Deployment + Service + Secret + ConfigMap + NetworkPolicy + ServiceAccount + PDB",
    resources: {
      Namespace: { name: "backend", labels: [{ k: "env", v: "production" }] },
      ServiceAccount: { name: "api-sa", namespace: "backend", automount: "false" },
      Deployment: { name: "api", namespace: "backend", image: "myapi:v1.0.0", replicas: "2", ports: [{ port: "3000", name: "http", protocol: "TCP" }], serviceAccount: "api-sa", cpuReq: "100m", cpuLim: "500m", memReq: "128Mi", memLim: "256Mi", enableProbe: true, probePath: "/health", readOnlyRoot: true },
      Service: { name: "api-service", namespace: "backend", selector: "api", serviceType: "ClusterIP", ports: [{ port: "3000", targetPort: "3000", name: "http" }] },
      Secret: { name: "api-secret", namespace: "backend", secretType: "Opaque", data: [{ k: "API_KEY", v: "" }, { k: "DB_PASSWORD", v: "" }] },
      ConfigMap: { name: "api-config", namespace: "backend", data: [{ k: "NODE_ENV", v: "production" }, { k: "PORT", v: "3000" }] },
      NetworkPolicy: { name: "api-netpol", namespace: "backend", selector: "api", allowFrom: "frontend", port: "3000" },
      PodDisruptionBudget: { name: "api-pdb", namespace: "backend", selector: "api", budgetType: "minAvailable", budgetValue: "1" },
    }
  },
  "Scheduled Worker": {
    icon: "⏰", color: "#a78bfa",
    desc: "Namespace + CronJob + ConfigMap + ServiceAccount",
    resources: {
      Namespace: { name: "workers", labels: [{ k: "env", v: "production" }] },
      ServiceAccount: { name: "worker-sa", namespace: "workers", automount: "false" },
      ConfigMap: { name: "worker-config", namespace: "workers", data: [{ k: "BATCH_SIZE", v: "100" }, { k: "TIMEOUT", v: "300" }] },
      CronJob: { name: "nightly-worker", namespace: "workers", schedule: "0 2 * * *", image: "myworker:latest", command: "node worker.js", restartPolicy: "OnFailure", concurrency: "Forbid", successJobs: "3", failJobs: "1" },
    }
  },
  "Basic Nginx Setup": {
    icon: "🟢", color: "#4ade80",
    desc: "Deployment + Service (ClusterIP)",
    resources: {
      Deployment: { name: "nginx", namespace: "default", image: "nginx:latest", replicas: "2", ports: [{ port: "80", name: "http", protocol: "TCP" }], cpuReq: "100m", cpuLim: "250m", memReq: "128Mi", memLim: "256Mi" },
      Service: { name: "nginx-service", namespace: "default", selector: "nginx", serviceType: "ClusterIP", ports: [{ port: "80", targetPort: "80", name: "http" }] },
    }
  },
  "Blue-Green Deployment": {
    icon: "🔵", color: "#60a5fa",
    desc: "Two Deployments + Active Service",
    resources: {
      Deployment: { name: "app-blue", namespace: "default", image: "myapp:v1.0", replicas: "2", ports: [{ port: "8080", name: "http", protocol: "TCP" }], labels: [{ k: "app", v: "myapp" }, { k: "version", v: "blue" }] },
      Service: { name: "app-service", namespace: "default", selector: "app-blue", serviceType: "ClusterIP", ports: [{ port: "80", targetPort: "8080", name: "http" }], selectorKey: "version", selectorVal: "blue" },
    }
  },
};

// ═══════════════════════════════════════════════════════════════════
// HELPER — download file
// ═══════════════════════════════════════════════════════════════════
function downloadFile(content, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  a.download = filename;
  a.click();
}

// ═══════════════════════════════════════════════════════════════════
// WIZARD VIEW — guided deployment flow for beginners
// ═══════════════════════════════════════════════════════════════════
function WizardView({ onLoadTemplate, onView, theme }) {
  const [step, setStep] = useState(0);
  const [wizForm, setWizForm] = useState({ what: "", name: "", image: "", env: "dev" });

  const PRESETS = {
    webapp: { label: "🌐 Web App", sub: "Deployment + Service + Ingress + HPA", template: "Full Web App" },
    db: { label: "🗄️ Database", sub: "StatefulSet + Service + Secret + PVC", template: "PostgreSQL Database" },
    worker: { label: "⏰ Background Worker", sub: "CronJob + ConfigMap + Namespace", template: "Scheduled Worker" },
    secure: { label: "🔐 Secure Microservice", sub: "Full stack with RBAC + NetworkPolicy", template: "Secure Microservice" },
    gitops: { label: "🔄 GitOps Stack", sub: "Namespace + ArgoCD + ClusterIssuer", template: "GitOps Stack" },
  };

  const steps = [
    { title: "What do you want to deploy?", key: "what" },
    { title: "Name your app & confirm", key: "confirm" },
  ];

  const card = (key, preset) => (
    <div key={key} onClick={() => { setWizForm(f => ({ ...f, what: key })); }}
      style={{ background: wizForm.what === key ? "#6366f120" : theme.bgCard, border: `2px solid ${wizForm.what === key ? "#6366f1" : theme.border}`, borderRadius: 12, padding: "18px 20px", cursor: "pointer", transition: "all 0.2s" }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{preset.label}</div>
      <div style={{ color: theme.textMuted, fontSize: 11 }}>{preset.sub}</div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "40px 32px", maxWidth: 780, margin: "0 auto", width: "100%" }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#818cf8", fontSize: 24, marginBottom: 4 }}>🧙 Deployment Wizard</div>
      <div style={{ color: theme.textMuted, fontSize: 12.5, marginBottom: 32 }}>New to Kubernetes? We'll set everything up for you.</div>

      {step === 0 && (
        <>
          <div style={{ color: theme.text, fontSize: 15, fontWeight: 700, marginBottom: 16 }}>What do you want to run?</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12, marginBottom: 28 }}>
            {Object.entries(PRESETS).map(([k, p]) => card(k, p))}
          </div>
          <button onClick={() => { if (wizForm.what) setStep(1); }}
            style={{ background: wizForm.what ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : theme.border, border: "none", borderRadius: 8, color: "white", cursor: wizForm.what ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, padding: "12px 28px", fontFamily: "'JetBrains Mono', monospace" }}>
            Next →
          </button>
        </>
      )}

      {step === 1 && PRESETS[wizForm.what] && (
        <>
          <div style={{ color: theme.text, fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Confirm your setup</div>
          <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <div style={{ color: "#818cf8", fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{PRESETS[wizForm.what].label}</div>
            <div style={{ color: theme.textMuted, fontSize: 11.5, marginBottom: 16 }}>This will create: {PRESETS[wizForm.what].sub}</div>
            <div style={{ color: theme.textDim, fontSize: 11, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, padding: 14, lineHeight: 1.8 }}>
              💡 The template uses sensible defaults. After loading, use the <strong>Build tab</strong> to customize each resource.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(0)} style={{ background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, cursor: "pointer", fontSize: 13, padding: "12px 20px", fontFamily: "'JetBrains Mono', monospace" }}>← Back</button>
            <button onClick={() => { onLoadTemplate(PRESETS[wizForm.what].template); onView("bundle"); }}
              style={{ flex: 1, background: "linear-gradient(135deg, #4f46e5, #7c3aed)", border: "none", borderRadius: 8, color: "white", cursor: "pointer", fontSize: 13, fontWeight: 700, padding: "12px 20px", fontFamily: "'JetBrains Mono', monospace" }}>
              🚀 Load Template & Open Bundle
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// LEARN VIEW — Cheat Sheet, Troubleshooter, kubectl Builder
// ═══════════════════════════════════════════════════════════════════
function LearnView({ theme }) {
  const [tab, setTab] = useState("cheatsheet");
  const { showToast } = useToast();

  const copyCmd = (cmd) => {
    navigator.clipboard.writeText(cmd).then(() => showToast('Command copied!', 'success'));
  };
  const [cmdAction, setCmdAction] = useState("get");
  const [cmdResource, setCmdResource] = useState("pods");
  const [cmdNs, setCmdNs] = useState("");
  const [cmdLabel, setCmdLabel] = useState("");
  const [cmdOutput, setCmdOutput] = useState("");

  const tabs = [
    { id: "cheatsheet", label: "📖 Cheat Sheet" },
    { id: "troubleshooter", label: "🐛 Troubleshooter" },
    { id: "kubectl", label: "🔨 kubectl Builder" },
    { id: "concepts", label: "💡 Concepts" },
  ];

  const cmdResult = `kubectl ${cmdAction} ${cmdResource}${cmdNs ? ` -n ${cmdNs}` : ""}${cmdLabel ? ` -l app=${cmdLabel}` : ""}${cmdOutput ? ` -o ${cmdOutput}` : ""}`;

  const CHEATSHEET = [
    {
      title: "📦 Get Resources", cmds: [
        ["kubectl get pods", "List all pods in current namespace"],
        ["kubectl get pods -n <ns>", "List pods in specific namespace"],
        ["kubectl get all -n <ns>", "Get all resources in namespace"],
        ["kubectl get pods -o wide", "Show nodes + IPs"],
        ["kubectl get pods --all-namespaces", "Pods in all namespaces"],
      ]
    },
    {
      title: "🔍 Inspect & Debug", cmds: [
        ["kubectl describe pod <name>", "Detailed pod info and events"],
        ["kubectl logs <pod> -f", "Stream pod logs"],
        ["kubectl logs <pod> -c <container>", "Logs from specific container"],
        ["kubectl exec -it <pod> -- /bin/sh", "Shell into a pod"],
        ["kubectl events -n <ns>", "See recent events"],
      ]
    },
    {
      title: "⚙️ Apply & Manage", cmds: [
        ["kubectl apply -f file.yaml", "Apply a YAML manifest"],
        ["kubectl apply -f file.yaml --dry-run=client", "Dry run — preview without applying"],
        ["kubectl delete -f file.yaml", "Delete from manifest"],
        ["kubectl rollout restart deployment/<name>", "Rolling restart"],
        ["kubectl rollout status deployment/<name>", "Watch rollout progress"],
        ["kubectl scale deployment/<name> --replicas=3", "Scale a deployment"],
      ]
    },
    {
      title: "🔌 Port & Networking", cmds: [
        ["kubectl port-forward pod/<name> 8080:80", "Forward pod port to localhost"],
        ["kubectl port-forward svc/<name> 8080:80", "Forward service port"],
        ["kubectl get svc -n <ns>", "List services"],
        ["kubectl get ingress -n <ns>", "List ingresses"],
      ]
    },
    {
      title: "🔐 Config & Secrets", cmds: [
        ["kubectl get secrets -n <ns>", "List secrets"],
        ["kubectl get configmap -n <ns>", "List configmaps"],
        ["kubectl create secret generic <name> --from-literal=KEY=val", "Create secret"],
        ["kubectl get secret <name> -o jsonpath='{.data.KEY}' | base64 -d", "Decode secret value"],
      ]
    },
    {
      title: "📊 Resource Usage", cmds: [
        ["kubectl top pods -n <ns>", "Pod CPU/memory usage (requires metrics-server)"],
        ["kubectl top nodes", "Node CPU/memory usage"],
        ["kubectl get hpa -n <ns>", "Horizontal Pod Autoscalers"],
      ]
    },
  ];

  const ISSUES = [
    {
      name: "CrashLoopBackOff", color: "#f87171", desc: "Pod keeps crashing and restarting.", fixes: [
        "kubectl logs <pod> — read the actual error",
        "Check: wrong command, missing env vars, or bad config",
        "kubectl describe pod <pod> — look at Exit Code",
        "Exit 1 = app error, Exit 137 = OOMKilled (increase memory)",
        "Exit 139 = segfault (image issue)",
      ]
    },
    {
      name: "ImagePullBackOff", color: "#fbbf24", desc: "Couldn't pull the container image.", fixes: [
        "Check image name and tag spelling",
        "Private registry? Add imagePullSecrets to pod spec",
        "kubectl create secret docker-registry regcred ...",
        "Check if image exists: docker pull <image>",
      ]
    },
    {
      name: "OOMKilled", color: "#f97316", desc: "Pod was killed due to out of memory.", fixes: [
        "Increase memory limit in resources.limits.memory",
        "kubectl top pods — check actual usage",
        "Look for memory leaks in your app",
        "Consider using VPA to auto right-size",
      ]
    },
    {
      name: "Pending (forever)", color: "#a78bfa", desc: "Pod scheduled but not running.", fixes: [
        "kubectl describe pod <name> — look at Events section",
        "Insufficient resources: kubectl describe nodes",
        "PVC not bound: kubectl get pvc — check StorageClass",
        "Node selector mismatch: wrong tolerations/affinity",
      ]
    },
    {
      name: "CreateContainerConfigError", color: "#60a5fa", desc: "Bad config/secret reference.", fixes: [
        "Secret or ConfigMap referenced doesn't exist in the namespace",
        "kubectl get secrets -n <ns> — verify name",
        "Check secretKeyRef / configMapKeyRef names in env",
      ]
    },
  ];

  const CONCEPTS = [
    { name: "Pod", icon: "🟢", color: "#4ade80", desc: "Smallest deployable unit. Wraps one or more containers. Ephemeral — dies and doesn't restart alone. Use Deployment for production.", cmd: "kubectl run demo --image=nginx:alpine" },
    { name: "Deployment", icon: "🚀", color: "#6366f1", desc: "Manages multiple Pod replicas. Handles rolling updates, rollbacks. Best choice for stateless apps (web servers, APIs).", cmd: "kubectl create deployment demo --image=nginx:alpine" },
    { name: "Service", icon: "🔌", color: "#10b981", desc: "Stable network endpoint for your pods. Pods die and restart with new IPs — Service keeps a consistent address.", cmd: "kubectl expose deployment demo --port=80" },
    { name: "Namespace", icon: "📁", color: "#64748b", desc: "Virtual cluster inside your cluster. Good for separating dev/staging/prod or different teams.", cmd: "kubectl create namespace production" },
    { name: "ConfigMap", icon: "⚙️", color: "#8b5cf6", desc: "Store config (not secrets) as key-value pairs. Inject as env vars or files into pods.", cmd: "kubectl create configmap my-config --from-literal=KEY=value" },
    { name: "Secret", icon: "🔐", color: "#ef4444", desc: "Like ConfigMap but base64-encoded. For passwords, API keys, TLS certs. Never commit to Git!", cmd: "kubectl create secret generic my-secret --from-literal=PASSWORD=abc123" },
    { name: "PVC", icon: "💾", color: "#f97316", desc: "Request for storage from the cluster. Like saying 'give me 10Gi of disk'. Backed by PV (PersistentVolume).", cmd: "kubectl get pvc -n default" },
    { name: "Ingress", icon: "🌐", color: "#f59e0b", desc: "HTTP router into the cluster. Maps domains/paths to Services. Requires an IngressController (nginx, traefik, etc.).", cmd: "kubectl get ingress -n default" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 2, padding: "10px 20px", borderBottom: `1px solid ${theme.border}`, background: theme.bgCard }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ background: tab === t.id ? "#6366f120" : "transparent", border: tab === t.id ? "1px solid #6366f140" : "1px solid transparent", borderRadius: 8, color: tab === t.id ? "#818cf8" : theme.textMuted, cursor: "pointer", fontSize: 11.5, padding: "7px 14px", fontFamily: "'JetBrains Mono', monospace", fontWeight: tab === t.id ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

        {/* CHEAT SHEET */}
        {tab === "cheatsheet" && (
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#818cf8", fontSize: 20, marginBottom: 20 }}>📖 kubectl Cheat Sheet</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(380px,1fr))", gap: 16 }}>
              {CHEATSHEET.map(section => (
                <div key={section.title} style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ padding: "10px 16px", borderBottom: `1px solid ${theme.border}`, color: "#818cf8", fontSize: 12.5, fontWeight: 700 }}>{section.title}</div>
                  <div style={{ padding: 12 }}>
                    {section.cmds.map(([cmd, desc]) => (
                      <div key={cmd} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, padding: "6px 8px", borderRadius: 6, cursor: "pointer" }}
                        onClick={() => copyCmd(cmd)}
                        onMouseEnter={e => e.currentTarget.style.background = "#6366f110"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <code style={{ color: "#4ade80", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", flex: 1, wordBreak: "break-all" }}>{cmd}</code>
                        <div style={{ color: theme.textDim, fontSize: 10, flexShrink: 0, maxWidth: 140 }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TROUBLESHOOTER */}
        {tab === "troubleshooter" && (
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#818cf8", fontSize: 20, marginBottom: 20 }}>🐛 Pod Troubleshooter</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {ISSUES.map(issue => (
                <div key={issue.name} style={{ background: theme.bgCard, border: `1px solid ${issue.color}30`, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: `1px solid ${issue.color}20`, background: `${issue.color}10`, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ background: `${issue.color}25`, border: `1px solid ${issue.color}50`, borderRadius: 6, color: issue.color, fontSize: 11.5, fontWeight: 700, padding: "3px 10px", fontFamily: "'JetBrains Mono', monospace" }}>{issue.name}</span>
                    <span style={{ color: theme.textMuted, fontSize: 11.5 }}>{issue.desc}</span>
                  </div>
                  <div style={{ padding: 14 }}>
                    {issue.fixes.map((fix, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < issue.fixes.length - 1 ? 8 : 0 }}>
                        <span style={{ color: issue.color, fontSize: 12, flexShrink: 0 }}>→</span>
                        <code style={{ color: fix.startsWith("kubectl") ? "#4ade80" : theme.text, fontSize: 11.5, fontFamily: fix.startsWith("kubectl") ? "'JetBrains Mono', monospace" : "inherit", lineHeight: 1.6 }}>{fix}</code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KUBECTL BUILDER */}
        {tab === "kubectl" && (
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#818cf8", fontSize: 20, marginBottom: 8 }}>🔨 kubectl Command Builder</div>
            <div style={{ color: theme.textMuted, fontSize: 12, marginBottom: 24 }}>Build kubectl commands interactively. Click a field to set it.</div>
            <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[{ label: "Action", val: cmdAction, opts: ["get", "describe", "logs", "delete", "apply", "exec", "scale", "rollout", "port-forward", "top"], setter: setCmdAction },
                { label: "Resource", val: cmdResource, opts: ["pods", "deployments", "services", "ingresses", "configmaps", "secrets", "nodes", "namespaces", "daemonsets", "statefulsets", "jobs", "cronjobs", "hpa", "pvc"], setter: setCmdResource },
                { label: "Output", val: cmdOutput, opts: ["", "wide", "yaml", "json", "jsonpath"], setter: setCmdOutput },
                { label: "Namespace", val: cmdNs, isInput: true, setter: setCmdNs, placeholder: "default" },
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ color: theme.textMuted, fontSize: 10.5, marginBottom: 6 }}>{f.label}</div>
                    {f.isInput ? (
                      <input value={f.val} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder}
                        style={{ width: "100%", background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 7, color: theme.text, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", padding: "8px 10px", outline: "none" }} />
                    ) : (
                      <select value={f.val} onChange={e => f.setter(e.target.value)}
                        style={{ width: "100%", background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 7, color: theme.text, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", padding: "8px 10px", outline: "none" }}>
                        {f.opts.map(o => <option key={o} value={o}>{o || "(default)"}</option>)}
                      </select>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: theme.textMuted, fontSize: 10.5, marginBottom: 6 }}>Label Selector (app=?)</div>
                <input value={cmdLabel} onChange={e => setCmdLabel(e.target.value)} placeholder="my-app"
                  style={{ width: "100%", background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 7, color: theme.text, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", padding: "8px 10px", outline: "none" }} />
              </div>
              <div style={{ background: theme.yamlBg, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <code style={{ flex: 1, color: "#4ade80", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", wordBreak: "break-all" }}>{cmdResult}</code>
                <button onClick={() => navigator.clipboard.writeText(cmdResult)}
                  style={{ background: "#6366f120", border: "1px solid #6366f140", borderRadius: 6, color: "#818cf8", cursor: "pointer", fontSize: 11, padding: "6px 12px", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>📋 Copy</button>
              </div>
            </div>
          </div>
        )}

        {/* CONCEPTS */}
        {tab === "concepts" && (
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#818cf8", fontSize: 20, marginBottom: 20 }}>💡 K8s Concepts</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 14 }}>
              {CONCEPTS.map(c => (
                <div key={c.name} style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 18, transition: "border-color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = c.color + "60"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = theme.border}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 20 }}>{c.icon}</span>
                    <span style={{ color: c.color, fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14 }}>{c.name}</span>
                  </div>
                  <div style={{ color: theme.text, fontSize: 11.5, lineHeight: 1.7, marginBottom: 12 }}>{c.desc}</div>
                  <div style={{ background: theme.yamlBg, border: `1px solid ${theme.border}`, borderRadius: 6, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                    <code style={{ flex: 1, color: "#4ade80", fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace" }}>{c.cmd}</code>
                    <button onClick={() => navigator.clipboard.writeText(c.cmd)}
                      style={{ background: "transparent", border: "none", color: theme.textDim, cursor: "pointer", fontSize: 11, padding: 2 }}>📋</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════
export default function App() {

  const [dark, setDark] = useState(() => localStorage.getItem("k8s_theme") !== "light");

  useEffect(() => {
    const val = dark ? "dark" : "light";
    document.documentElement.setAttribute('data-theme', val);
    localStorage.setItem("k8s_theme", val);
  }, [dark]);

  const [view, setView] = useState("dashboard");
  const [selected, setSelected] = useState("Deployment");
  const [recentResources, setRecentResources] = useState(() => { try { return JSON.parse(localStorage.getItem("k8s_recent") || "[]"); } catch { return []; } });
  const [search, setSearch] = useState("");
  const [forms, setForms] = useState(() => { try { return JSON.parse(localStorage.getItem("k8s_forms") || "{}"); } catch { return {}; } });
  const [bundle, setBundle] = useState(() => { try { return JSON.parse(localStorage.getItem("k8s_bundle") || "{}"); } catch { return {}; } });
  const [snippets, setSnippets] = useState(() => { try { return JSON.parse(localStorage.getItem("k8s_snippets") || "[]"); } catch { return []; } });
  const [copied, setCopied] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [diffA, setDiffA] = useState("");
  const [diffB, setDiffB] = useState("");
  const [importText, setImportText] = useState("");
  const [snippetName, setSnippetName] = useState("");
  const [envMode, setEnvMode] = useState(() => localStorage.getItem("k8s_env") || "dev");
  const [beginnerMode, setBeginnerMode] = useState(() => localStorage.getItem("k8s_beginner") === "true");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [quickCreateKind, setQuickCreateKind] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Use the new unified AI context
  const ai = useAI();

  const theme = getTheme(dark);

  // Open AI panel + pre-fill prompt
  const openAIPanel = (prompt) => {
    ai.setPanelOpen(true);
    if (prompt) ai.setInput(prompt);
    setTimeout(() => {
      const ta = document.querySelector(".ai-panel-input");
      if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
    }, 80);
  };

  // Quick Create: map modal field values → form state for each kind
  const handleQuickCreate = (kind, values) => {
    let formData = { name: values.name, namespace: values.namespace || "default" };
    if (kind === "Deployment") {
      formData = { ...formData, image: values.image, replicas: values.replicas || "2", ports: values.port ? [{ port: values.port, name: "http", protocol: "TCP" }] : [] };
    } else if (kind === "Service") {
      formData = { ...formData, selector: values.selector, serviceType: values.serviceType || "ClusterIP", ports: [{ port: values.port || "80", targetPort: values.targetPort || "80", name: "http" }] };
    } else if (kind === "Ingress") {
      formData = { ...formData, rules: [{ host: values.host, path: values.path || "/", service: values.serviceName || values.name, port: "80" }] };
    } else if (kind === "ConfigMap") {
      const data = [];
      if (values.key1) data.push({ k: values.key1, v: values.val1 || "" });
      if (values.key2) data.push({ k: values.key2, v: values.val2 || "" });
      formData = { ...formData, data };
    } else if (kind === "Secret") {
      const data = [];
      if (values.key1) data.push({ k: values.key1, v: values.val1 || "" });
      formData = { ...formData, secretType: "Opaque", data };
    } else if (kind === "CronJob") {
      formData = { ...formData, schedule: values.schedule, image: values.image, command: values.command || "", restartPolicy: "OnFailure" };
    } else if (kind === "HPA") {
      formData = { ...formData, target: values.target, minReplicas: values.minReplicas || "2", maxReplicas: values.maxReplicas || "10", cpuTarget: values.cpuTarget || "70" };
    } else if (kind === "PersistentVolumeClaim") {
      formData = { ...formData, storage: values.storage || "10Gi", storageClass: values.storageClass || "standard" };
    }
    setForms(f => ({ ...f, [kind]: formData }));
    setSelected(kind);
    setView("generator");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setAiPanelOpen(o => !o); }
      if ((e.metaKey || e.ctrlKey) && e.key === "b") { e.preventDefault(); if (view === "generator") addToBundle(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, selected]);

  // Persist to localStorage
  useEffect(() => { localStorage.setItem("k8s_forms", JSON.stringify(forms)); }, [forms]);
  useEffect(() => { localStorage.setItem("k8s_bundle", JSON.stringify(bundle)); }, [bundle]);
  useEffect(() => { localStorage.setItem("k8s_snippets", JSON.stringify(snippets)); }, [snippets]);
  useEffect(() => { localStorage.setItem("k8s_theme", dark ? "dark" : "light"); }, [dark]);
  useEffect(() => { localStorage.setItem("k8s_env", envMode); }, [envMode]);
  useEffect(() => { localStorage.setItem("k8s_beginner", beginnerMode); }, [beginnerMode]);

  // Apply env preset overrides to current form when env changes
  const applyEnvPreset = (env) => {
    setEnvMode(env);
    const overrides = ENV_PRESETS[env]?.overrides || {};
    setForms(f => ({ ...f, [selected]: { ...(f[selected] || {}), ...overrides } }));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); downloadCurrentYAML(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") { e.preventDefault(); downloadBundle(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); ai.setPanelOpen(o => !o); }
      if ((e.ctrlKey || e.metaKey) && e.key === "b") { e.preventDefault(); if (view === "generator") addToBundle(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "?") { e.preventDefault(); setShowShortcuts(s => !s); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [forms, selected, bundle, view]);

  const form = forms[selected] || {};
  const generator = GENERATORS[selected];
  const yaml = generator ? (() => { try { return generator(form); } catch (e) { return `# Error generating YAML: ${e.message}`; } })() : "# Select a resource type";
  const validation = validateYAML(yaml);
  const depWarnings = checkDependencies(bundle);

  const { showToast } = useToast();

  const updateForm = useCallback((type, newForm) => {
    setForms(f => ({ ...f, [type]: newForm }));
  }, []);

  const copy = (text) => {
    navigator.clipboard.writeText(text || yaml).then(() => {
      showToast('YAML copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy. Please try again.', 'error');
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCurrentYAML = () => downloadFile(yaml, `${selected.toLowerCase().replace(/[\s&]/g, "-")}.yaml`);

  const downloadBundle = () => {
    const entries = Object.entries(bundle);
    if (!entries.length) return;
    const all = entries.map(([type, f]) => {
      try {
        if (f._isImported) {
          // Prefer _rawYaml: preserves original quotes, comments, exact formatting
          // Fall back to rawYamlToString only if rawYaml is missing (e.g. visual-editor-only edit)
          const yamlStr = f._rawYaml || rawYamlToString(f._rawDoc);
          return `# ===== ${f._kind || type} =====\n${yamlStr}`;
        }
        return `# ===== ${type} =====\n${GENERATORS[type]?.(f) || ""}`;
      } catch { return `# Error generating ${type}`; }
    }).join("\n\n---\n\n");
    downloadFile(all, "k8s-bundle.yaml");
  };

  const addToBundle = () => {
    setBundle(b => ({ ...b, [selected]: form }));
  };

  const applyTemplate = (tplName) => {
    const tpl = APP_TEMPLATES[tplName];
    if (!tpl) return;
    setBundle(tpl.resources);
    const newForms = { ...forms };
    Object.entries(tpl.resources).forEach(([type, f]) => { newForms[type] = f; });
    setForms(newForms);
    setView("bundle");
  };

  const handleImport = (docs) => {
    if (!docs || !docs.length) return;

    if (Object.keys(bundle).length > 0) {
      if (!window.confirm("Your current bundle is not empty. Importing will overwrite existing resources of the same type. Continue?")) {
        return;
      }
    }

    const nextForms = { ...forms };
    const nextBundle = { ...bundle };

    docs.forEach(doc => {
      // Always use a unique key (kind + random) to avoid collisions on multi-import
      const typeKey = doc.kind + "_" + Math.floor(Math.random() * 10000);
      // Store raw parsed object + YAML string so nothing is lost on download
      const enriched = {
        ...doc.formData,
        _isImported: true,
        _rawDoc: doc.rawDoc,       // original parsed JS object
        _rawYaml: doc.rawYaml,    // original YAML string for display
        _kind: doc.kind,
        name: doc.rawDoc?.metadata?.name || doc.formData?.name || "",
      };
      nextForms[typeKey] = enriched;
      nextBundle[typeKey] = enriched;
    });

    setForms(nextForms);
    setBundle(nextBundle);
    setView("bundle");

    alert(`Successfully imported ${docs.length} resource(s) into your bundle!`);
  };

  const saveSnippet = () => {
    if (!snippetName.trim()) return;
    const newSnippet = { id: Date.now(), name: snippetName, type: selected, yaml, form: { ...form } };
    setSnippets(s => [...s, newSnippet]);
    setSnippetName("");
  };

  const loadSnippet = (snippet) => {
    setForms(f => ({ ...f, [snippet.type]: snippet.form }));
    setSelected(snippet.type);
    setView("generator");
  };

  const deleteSnippet = (id) => setSnippets(s => s.filter(x => x.id !== id));

  const handleCreateLinked = (type) => {
    setSelected(type);
    const n = smartName(form.name || "");
    const defaults = { Service: { name: n.service }, Secret: { name: n.secret }, ConfigMap: { name: n.configmap }, ServiceAccount: { name: n.sa }, ClusterIssuer: { name: "letsencrypt-prod" } };
    if (defaults[type]) setForms(f => ({ ...f, [type]: { namespace: form.namespace || "default", ...defaults[type] } }));
  };

  // Dashboard resource selection — track recent + open generator
  const handleDashboardSelect = (name) => {
    setSelected(name);
    setRecentResources(prev => {
      const next = [name, ...prev.filter(r => r !== name)].slice(0, 8);
      localStorage.setItem("k8s_recent", JSON.stringify(next));
      return next;
    });
    setView("generator");
  };

  // Diff
  const diffLines = () => {
    const a = diffA.split("\n"), b = diffB.split("\n");
    return Array.from({ length: Math.max(a.length, b.length) }, (_, i) => ({ a: a[i] ?? "", b: b[i] ?? "", changed: a[i] !== b[i] }));
  };

  const meta = RESOURCE_META[selected];
  const currentYaml = yaml;

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, display: "flex", flexDirection: "column", fontFamily: "'JetBrains Mono', monospace" }}>
      <MobileStyles />

      {/* Mobile Sidebar Overlay */}
      <div className={`mobile-sidebar-drawer ${showMobileSidebar ? "" : "mobile-sidebar-hidden"}`}>
        <Sidebar selected={selected} onSelect={s => { setSelected(s); setView("generator"); setShowMobileSidebar(false); }} search={search} onSearch={setSearch} theme={theme} onQuickCreate={kind => { setQuickCreateKind(kind); setShowMobileSidebar(false); }} />
        <button className="mobile-only touch-btn" onClick={() => setShowMobileSidebar(false)} style={{ position: "absolute", top: 12, right: 12, background: theme.bgInput, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer" }}>×</button>
      </div>
      {showMobileSidebar && <div className="mobile-only mobile-overlay" onClick={() => setShowMobileSidebar(false)}></div>}

      <TopNav view={view} onView={setView} darkMode={dark} onToggleTheme={() => setDark(!dark)} theme={theme} onToggleMobileSidebar={() => setShowMobileSidebar(true)} />

      {/* ── ENV TOOLBAR (compact, integrated) ─────────────────────── */}
      {view === "generator" && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderBottom: `1px solid ${theme.border}`, background: theme.bgCard, flexWrap: "wrap" }}>
          <span style={{ color: theme.textDim, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginRight: 2 }}>ENV</span>
          {Object.entries(ENV_PRESETS).map(([k, p]) => (
            <button key={k} onClick={() => applyEnvPreset(k)}
              style={{ background: envMode === k ? `${p.color}20` : "transparent", border: `1px solid ${envMode === k ? p.color + "60" : theme.border}`, borderRadius: 6, color: envMode === k ? p.color : theme.textMuted, cursor: "pointer", fontSize: 10.5, padding: "3px 10px", fontFamily: "'JetBrains Mono', monospace", fontWeight: envMode === k ? 700 : 400, transition: "all 150ms ease" }}>
              {p.icon} {p.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={() => setBeginnerMode(b => !b)}
            style={{ background: beginnerMode ? "#22d3ee20" : "transparent", border: `1px solid ${beginnerMode ? "#22d3ee50" : theme.border}`, borderRadius: 6, color: beginnerMode ? "#22d3ee" : theme.textMuted, cursor: "pointer", fontSize: 10.5, padding: "3px 10px", fontFamily: "'JetBrains Mono', monospace", transition: "all 150ms ease" }}>
            {beginnerMode ? "🎓 Beginner ON" : "🎓 Beginner"}
          </button>
          <button onClick={() => setShowShortcuts(s => !s)}
            style={{ background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: "pointer", fontSize: 10.5, padding: "3px 10px", fontFamily: "'JetBrains Mono', monospace", transition: "all 150ms ease" }}>
            ⌨️ Shortcuts
          </button>
        </div>
      )}

      {view === "generator" && (
        <div className="mobile-stacked" style={{ display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 96px)" }}>
          {/* Sidebar */}
          <div className="desktop-only" style={{ display: "flex", height: "100%" }}>
            <Sidebar selected={selected} onSelect={setSelected} search={search} onSearch={setSearch} theme={theme} onQuickCreate={setQuickCreateKind} />
          </div>

          {/* Form Panel — proper scrolling */}
          <div style={{ width: 420, flexShrink: 0, borderRight: `1px solid ${theme.border}`, overflowY: "auto", overflowX: "hidden", background: theme.bgCard, scrollBehavior: "smooth" }} className="mobile-stacked-fullwidth">
            {/* Sticky header */}
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${theme.border}`, background: theme.bgCard, display: "flex", alignItems: "center", gap: 8, position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(12px)" }}>
              <button onClick={() => setView("dashboard")} title="Back to all resources" style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "var(--text-muted)", cursor: "pointer", fontSize: 13, padding: "6px 10px", fontFamily: "'JetBrains Mono', monospace", transition: "all 150ms ease", display: "flex", alignItems: "center", gap: 4 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.color = "var(--color-primary-light)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                <span style={{ fontSize: 16 }}>←</span>
              </button>
              <span style={{ fontSize: 20, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))" }}>{meta?.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: meta?.color, fontSize: 14, lineHeight: 1.2 }}>{selected}</div>
                <div style={{ color: theme.textDim, fontSize: 10, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meta?.desc}</div>
              </div>
              <button onClick={() => setForms(f => ({ ...f, [selected]: {} }))} style={{ background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.textDim, cursor: "pointer", fontSize: 10, padding: "4px 8px", fontFamily: "'JetBrains Mono', monospace", transition: "all 150ms ease" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#ef444460"; e.currentTarget.style.color = "#ef4444"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textDim; }}
              >Clear</button>
              {ai.enabled && <button onClick={() => openAIPanel(`I'm configuring a Kubernetes ${selected}. Suggest best practices and improvements for my setup.`)} title="Ask AI for suggestions" style={{ background: "#6366f120", border: "1px solid #6366f140", borderRadius: 6, color: "#818cf8", cursor: "pointer", fontSize: 10, padding: "4px 8px", fontFamily: "'JetBrains Mono', monospace", transition: "all 150ms ease" }}>💡 AI</button>}
            </div>

            {/* Beginner mode inline hint (compact) */}
            {beginnerMode && (
              <div style={{ padding: "8px 16px", background: "#0c192b", borderBottom: "1px solid #1e3a5f", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14 }}>🎓</span>
                <span style={{ color: "#60a5fa", fontSize: 11, lineHeight: 1.4 }}>Hover over field labels for hints. Try the Wizard for guided help.</span>
                <button onClick={() => setView("wizard")} style={{ marginLeft: "auto", background: "#1e3a5f", border: "1px solid #2d5a8e", borderRadius: 6, color: "#60a5fa", cursor: "pointer", fontSize: 10, padding: "3px 8px", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>🧙 Wizard</button>
              </div>
            )}

            {/* Form content — scrollable */}
            <div style={{ padding: "12px 16px 24px" }} className="fade">
              <ResourceForm type={selected} form={form} onChange={(newForm) => updateForm(selected, newForm)} bundle={bundle} onCreateLinked={handleCreateLinked} theme={theme} />

              {/* Action buttons — sticky bottom feel */}
              <div style={{ display: "flex", gap: 6, marginTop: 16, paddingTop: 12, borderTop: `1px solid ${theme.border}`, position: "sticky", bottom: 0, background: theme.bgCard, padding: "12px 0" }}>
                <button onClick={addToBundle} style={{ flex: 1, background: theme.accentSoft, border: `1px solid ${theme.accent}40`, borderRadius: 8, color: theme.accent, cursor: "pointer", fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", padding: "10px", fontWeight: 600, transition: "all 150ms ease" }}
                  onMouseEnter={e => { e.currentTarget.style.background = theme.accent + "30"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = theme.accentSoft; }}
                >
                  + Add to Bundle
                </button>
                <button onClick={() => { setBundle(b => ({ ...b, [selected]: form })); setView("bundle"); }}
                  style={{ background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, cursor: "pointer", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", padding: "10px 12px", transition: "all 150ms ease" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted; }}
                >
                  Bundle →
                </button>
              </div>

              {/* Save Snippet */}
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <input value={snippetName} onChange={e => setSnippetName(e.target.value)} placeholder="Snippet name..." style={{ flex: 1, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 7, color: theme.text, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", padding: "8px 10px", outline: "none", transition: "border-color 150ms ease" }}
                  onFocus={e => { e.currentTarget.style.borderColor = theme.borderFocus; }}
                  onBlur={e => { e.currentTarget.style.borderColor = theme.border; }}
                />
                <button onClick={saveSnippet} style={{ background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 7, color: theme.textMuted, cursor: "pointer", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", padding: "8px 10px", transition: "all 150ms ease" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted; }}
                >💾 Save</button>
              </div>
            </div>
          </div>

          {/* YAML Output — proper scrolling */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Validation Bar */}
            {showValidation && (
              <div style={{ padding: "8px 16px", borderBottom: `1px solid ${theme.border}`, background: theme.bgCard, display: "flex", gap: 6, flexWrap: "wrap", maxHeight: 120, overflowY: "auto" }}>
                {validation.map((v, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, background: v.type === "error" ? "#1a0808" : v.type === "warning" ? "#1a1200" : v.type === "success" ? "#081a08" : "#081218", color: v.type === "error" ? "#f87171" : v.type === "warning" ? "#fbbf24" : v.type === "success" ? "#4ade80" : "#60a5fa", border: `1px solid ${v.type === "error" ? "#3a1010" : v.type === "warning" ? "#3a2800" : v.type === "success" ? "#1a3a1a" : "#103040"}` }}>
                      {v.type === "error" ? "❌" : v.type === "warning" ? "⚠️" : v.type === "success" ? "✅" : "💡"} {v.msg}
                    </span>
                    {ai.enabled && (v.type === "error" || v.type === "warning") && (
                      <button onClick={() => openAIPanel(`Fix this Kubernetes YAML ${v.type}: "${v.msg}"\n\nHere is the current YAML:\n\n${yaml}`)} title="Ask AI to fix this" style={{ background: "#6366f110", border: "1px solid #6366f130", borderRadius: 4, color: "#818cf8", cursor: "pointer", fontSize: 9.5, padding: "2px 6px", fontFamily: "'JetBrains Mono', monospace" }}>🤖 fix</button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <YAMLPanel
              yaml={yaml}
              resourceType={selected}
              theme={theme}
              onCopy={() => copy()}
              onDownload={downloadCurrentYAML}
              copied={copied}
              extraActions={<>
                <Btn onClick={() => setShowValidation(!showValidation)} theme={theme} variant={showValidation ? "success" : "ghost"} style={{ fontSize: 11, padding: "6px 10px" }}>🔍 Validate</Btn>
                {ai.enabled && <Btn onClick={() => openAIPanel(`Review this Kubernetes ${selected} YAML for issues, best practices, and security concerns:\n\n${yaml}`)} theme={theme} style={{ fontSize: 11, padding: "6px 10px", background: "#6366f120", border: "1px solid #6366f140", color: "#818cf8" }}>🤖 Ask AI</Btn>}
              </>}
            />
            {/* AI Quick Actions row below the YAML panel */}
            {ai.enabled && (
              <AIChips
                theme={theme}
                onAskAI={openAIPanel}
                chips={[
                  { label: "⚡ Explain", prompt: `Explain what this Kubernetes ${selected} does and when to use it:\n\n${yaml}` },
                  { label: "🔍 Review", prompt: `Review this Kubernetes ${selected} YAML for issues and improvements:\n\n${yaml}` },
                  { label: "🔐 Security", prompt: `Audit this Kubernetes ${selected} for security vulnerabilities and missing hardening:\n\n${yaml}` },
                  { label: "✨ Optimize", prompt: `Suggest production optimizations for this Kubernetes ${selected} (resources, reliability, performance):\n\n${yaml}` },
                ]}
              />
            )}
          </div>
        </div>
      )}

      {/* ── BUNDLE ───────────────────────────────────────────── */}
      {view === "bundle" && (
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Left sidebar — resource toggles */}
          <div style={{ width: 260, borderRight: `1px solid ${theme.border}`, overflowY: "auto", padding: "16px 12px", background: 'var(--bg-surface, theme.bgCard)', flexShrink: 0 }}>
            {/* Header */}
            <div style={{ padding: "0 6px", marginBottom: 12 }}>
              <div style={{ fontFamily: "var(--font-display, 'Syne')", fontWeight: 800, fontSize: 18, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📦</span> Bundle
              </div>
              <div style={{ color: 'var(--text-dim, theme.textDim)', fontSize: 12 }}>{Object.keys(bundle).length} resources • Ctrl+D download</div>
            </div>

            {/* Validation summary */}
            {depWarnings.length > 0 && (
              <div style={{
                margin: "0 6px 14px",
                background: "rgba(234,179,8,0.06)",
                border: "1px solid rgba(234,179,8,0.2)",
                borderRadius: 'var(--radius-md, 10px)',
                padding: "10px 12px",
              }}>
                <div style={{ color: 'var(--color-amber, #f59e0b)', fontSize: 11, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>⚠️ {depWarnings.length} Dependency Warning{depWarnings.length > 1 ? 's' : ''}</div>
                {depWarnings.slice(0, 5).map((w, i) => (
                  <div key={i} style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: 11, marginBottom: 3, lineHeight: 1.4 }}>
                    <strong style={{ color: 'var(--color-amber, #f59e0b)' }}>{w.resource}:</strong> {w.msg}
                  </div>
                ))}
                {depWarnings.length > 5 && <div style={{ color: 'var(--text-dim)', fontSize: 10 }}>+{depWarnings.length - 5} more...</div>}
              </div>
            )}

            {/* Resource list */}
            <div style={{ padding: "0 2px" }}>
              {Object.entries(RESOURCE_META).map(([name, m]) => {
                const inBundle = !!bundle[name];
                return (
                  <button key={name} onClick={() => {
                    if (inBundle) {
                      setBundle(b => { const n = { ...b }; delete n[name]; return n; });
                    } else {
                      setBundle(b => ({ ...b, [name]: forms[name] || {} }));
                    }
                  }} style={{
                    width: "100%", textAlign: "left",
                    background: inBundle ? m.color + '15' : "transparent",
                    border: inBundle ? `1px solid ${m.color}40` : "1px solid transparent",
                    borderRadius: 'var(--radius-sm, 6px)',
                    color: inBundle ? m.color : 'var(--text-dim, theme.textDim)',
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                    fontSize: 12, padding: "7px 10px", marginBottom: 2,
                    fontFamily: "var(--font-mono, 'JetBrains Mono')",
                    transition: "all 150ms ease",
                  }}>
                    <span style={{ fontSize: 14 }}>{m.icon}</span>
                    <span style={{ flex: 1, fontWeight: inBundle ? 600 : 400 }}>{name}</span>
                    {inBundle && <span style={{ color: 'var(--color-success, #22c55e)', fontSize: 14 }}>✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8, padding: "0 2px" }}>
              <button onClick={downloadBundle} style={{
                width: "100%", background: "linear-gradient(135deg, var(--color-primary-dark, #4f46e5), var(--color-secondary, #7c3aed))",
                border: "none", borderRadius: 'var(--radius-sm, 6px)', color: "white", cursor: "pointer",
                fontSize: 13, fontWeight: 700, padding: "11px", fontFamily: "var(--font-mono, 'JetBrains Mono')",
              }}>⬇️ Download All YAML</button>
              <button onClick={() => {
                const all = Object.entries(bundle).map(([type, f]) => {
                  try {
                    if (f._isImported) { return `# ===== ${f._kind || type} =====\n${f._rawYaml || rawYamlToString(f._rawDoc)}`; }
                    return `# ===== ${type} =====\n${GENERATORS[type]?.(f) || ""}`;
                  } catch { return ""; }
                }).join("\n\n---\n\n");
                copy(all);
              }} style={{
                width: "100%", background: "var(--bg-card, transparent)", border: `1px solid var(--border-subtle, ${theme.border})`,
                borderRadius: 'var(--radius-sm, 6px)', color: 'var(--text-secondary, theme.textMuted)', cursor: "pointer",
                fontSize: 13, padding: "9px", fontFamily: "var(--font-mono, 'JetBrains Mono')",
              }}>📋 Copy All</button>
              <button onClick={() => { const { chartYaml, valuesYaml } = generateHelmChart({ name: "my-chart" }); downloadFile(`# Chart.yaml\n${chartYaml}\n\n# values.yaml\n${valuesYaml}`, "helm-chart.yaml"); }} style={{
                width: "100%", background: "transparent", border: `1px solid var(--border-subtle, ${theme.border})`,
                borderRadius: 'var(--radius-sm, 6px)', color: 'var(--text-dim, theme.textMuted)', cursor: "pointer",
                fontSize: 13, padding: "9px", fontFamily: "var(--font-mono, 'JetBrains Mono')",
              }}>⛵ Export Helm</button>
              {Object.keys(bundle).length > 0 && (
                <button onClick={() => { if (window.confirm('Clear all bundle resources?')) setBundle({}); }} style={{
                  width: "100%", background: "transparent", border: `1px solid rgba(239,68,68,0.2)`,
                  borderRadius: 'var(--radius-sm, 6px)', color: 'var(--color-rose, #f87171)', cursor: "pointer",
                  fontSize: 13, padding: "9px", fontFamily: "var(--font-mono, 'JetBrains Mono')",
                }}>🗑️ Clear Bundle</button>
              )}
            </div>
          </div>

          {/* Main content — resource cards */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            {Object.keys(bundle).length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: 'var(--text-dim, theme.textDim)', flexDirection: "column", gap: 16 }}>
                <div style={{ fontSize: 64 }}>📦</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Your bundle is empty</div>
                <div style={{ fontSize: 13 }}>Add resources from the sidebar or go to the <button onClick={() => setView("dashboard")} style={{ background: 'none', border: 'none', color: 'var(--color-primary-light, #818cf8)', cursor: 'pointer', textDecoration: 'underline', fontSize: 13, fontFamily: 'inherit' }}>Resources Dashboard</button></div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {Object.entries(bundle).map(([type, f]) => {
                  let resourceYaml = "";
                  try {
                    if (f._isImported) {
                      resourceYaml = f._rawYaml || rawYamlToString(f._rawDoc) || `# No YAML for ${type}`;
                    } else {
                      resourceYaml = GENERATORS[type]?.(f) || `# No generator for ${type}`;
                    }
                  } catch (e) { resourceYaml = `# Error: ${e.message}`; }
                  const displayKind = f._kind || type;
                  const meta = RESOURCE_META[displayKind] || RESOURCE_META[type.split("_")[0]];
                  const typeHints = lintResource(displayKind, f);
                  const errorCount = typeHints.filter(h => h.level === 'error').length;
                  const warnCount = typeHints.filter(h => h.level === 'warning').length;

                  return (
                    <div key={type} style={{
                      background: 'var(--bg-card, theme.bgCard)',
                      border: `2px solid ${meta?.color ? meta.color + '25' : 'var(--border-subtle, ' + theme.border + ')'}`,
                      borderRadius: 'var(--radius-lg, 14px)',
                      overflow: "hidden",
                      transition: "border-color 200ms ease",
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = meta?.color + '50' || theme.border}
                      onMouseLeave={e => e.currentTarget.style.borderColor = meta?.color + '25' || theme.border}
                    >
                      {/* Card header */}
                      <div style={{
                        padding: "14px 18px", borderBottom: `1px solid var(--border-subtle, ${theme.border})`,
                        display: "flex", alignItems: "center", gap: 10,
                        background: meta?.color ? meta.color + '08' : 'transparent',
                      }}>
                        <span style={{ fontSize: 22 }}>{meta?.icon || "📄"}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: meta?.color || 'var(--color-primary-light)', fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display, 'Syne')" }}>{displayKind}</span>
                            <span style={{ color: 'var(--text-secondary, theme.textDim)', fontSize: 13 }}>{f.name || "(unnamed)"}</span>
                          </div>
                          {f._isImported && <span style={{ background: "rgba(59,130,246,0.12)", color: "var(--color-info, #38bdf8)", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700, marginTop: 4, display: 'inline-block' }}>IMPORTED</span>}
                        </div>

                        {/* Validation badges */}
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {errorCount > 0 && <span className="badge badge-danger" style={{ fontSize: 11 }}>{errorCount} err</span>}
                          {warnCount > 0 && <span className="badge badge-warning" style={{ fontSize: 11 }}>{warnCount} warn</span>}
                          {errorCount === 0 && warnCount === 0 && <span className="badge badge-success" style={{ fontSize: 11 }}>✓ ok</span>}
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => { setSelected(displayKind); setView("generator"); }} style={{
                            background: meta?.color + '20', border: `1px solid ${meta?.color}40`,
                            borderRadius: 6, color: meta?.color, cursor: "pointer",
                            fontSize: 11, fontWeight: 600, padding: "5px 10px",
                            fontFamily: "var(--font-mono, 'JetBrains Mono')",
                          }}>✏️ Edit</button>
                          <button onClick={() => navigator.clipboard.writeText(resourceYaml).then(() => showToast(`Copied ${displayKind}!`, 'success'))} style={{
                            background: "transparent", border: `1px solid var(--border-subtle, ${theme.border})`,
                            borderRadius: 6, color: 'var(--text-secondary, theme.textMuted)', cursor: "pointer",
                            fontSize: 11, padding: "5px 10px", fontFamily: "var(--font-mono, 'JetBrains Mono')",
                          }}>📋</button>
                          <button onClick={() => setBundle(b => { const n = { ...b }; delete n[type]; return n; })} style={{
                            background: "transparent", border: "1px solid rgba(239,68,68,0.2)",
                            borderRadius: 6, color: 'var(--color-rose, #f87171)', cursor: "pointer",
                            fontSize: 11, padding: "5px 10px", fontFamily: "var(--font-mono, 'JetBrains Mono')",
                          }}>✕</button>
                        </div>
                      </div>

                      {/* Inline lint hints */}
                      {typeHints.length > 0 && (
                        <div style={{ padding: "8px 18px", borderBottom: `1px solid var(--border-subtle, ${theme.border})`, display: "flex", flexDirection: "column", gap: 3 }}>
                          {typeHints.slice(0, 3).map((h, i) => (
                            <div key={i} style={{
                              display: "flex", alignItems: "center", gap: 6,
                              fontSize: 12, color: h.level === 'error' ? 'var(--color-rose, #ef4444)' : h.level === 'warning' ? 'var(--color-amber, #f59e0b)' : 'var(--color-info, #38bdf8)',
                            }}>
                              <span>{h.level === 'error' ? '❌' : h.level === 'warning' ? '⚠️' : '💡'}</span>
                              <span>{h.msg}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* YAML preview */}
                      <pre style={{
                        fontFamily: "var(--font-mono, 'JetBrains Mono')", fontSize: 12, lineHeight: 1.7,
                        padding: "14px 18px", overflow: "auto", maxHeight: 280,
                        color: "var(--yaml-text, #a0f0c0)", background: "var(--yaml-bg, theme.yamlBg)",
                        margin: 0,
                      }} dangerouslySetInnerHTML={{ __html: highlightYAML(resourceYaml) }} />

                      {/* AI chips */}
                      {ai.enabled && (
                        <AIChips theme={theme} onAskAI={openAIPanel} chips={[
                          { label: "⚡ Explain", prompt: `Explain what this Kubernetes ${displayKind} does:\n\n${resourceYaml}` },
                          { label: "🔍 Review", prompt: `Review this Kubernetes ${displayKind} for issues and best practices:\n\n${resourceYaml}` },
                          { label: "🔐 Security", prompt: `Audit this Kubernetes ${displayKind} for security problems:\n\n${resourceYaml}` },
                        ]} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TEMPLATES ────────────────────────────────────────── */}
      {view === "templates" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#818cf8", fontSize: 20, marginBottom: 6 }}>📋 Starter Templates</div>
          <div style={{ color: theme.textMuted, fontSize: 12, marginBottom: 24 }}>Production-ready configs. One click to load and customize.</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {Object.entries(APP_TEMPLATES).map(([name, t]) => (
              <div key={name} style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "20px", transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = t.color + "60"}
                onMouseLeave={e => e.currentTarget.style.borderColor = theme.border}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{t.icon}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: t.color, fontSize: 15, marginBottom: 6 }}>{name}</div>
                <div style={{ color: theme.textMuted, fontSize: 11.5, marginBottom: 14, lineHeight: 1.6 }}>{t.desc}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 16 }}>
                  {Object.keys(t.resources).map(r => (
                    <span key={r} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 4, color: RESOURCE_META[r]?.color || theme.textMuted, fontSize: 10, padding: "2px 7px" }}>
                      {RESOURCE_META[r]?.icon} {r}
                    </span>
                  ))}
                </div>
                <button onClick={() => applyTemplate(name)} style={{ width: "100%", background: `${t.color}20`, border: `1px solid ${t.color}40`, borderRadius: 7, color: t.color, cursor: "pointer", fontSize: 12, fontWeight: 600, padding: "10px", fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.target.style.background = `${t.color}35`; }}
                  onMouseLeave={e => { e.target.style.background = `${t.color}20`; }}>
                  Load Template →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── IMPORT YAML ────────────────────────────────────────── */}
      {view === "import" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "28px", display: "flex", gap: 24, flexDirection: "column", maxWidth: 900, margin: "0 auto", width: "100%" }}>
          <YAMLImporter onImport={handleImport} theme={theme} />

          {Object.keys(bundle).length > 0 && (
            <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "20px" }}>
              <h3 style={{ margin: "0 0 16px 0", color: theme.text, fontSize: 16 }}>Current Bundle Resources</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {Object.entries(bundle).map(([typeKey, f]) => {
                  const isKnown = !!RESOURCE_META[typeKey] || !!RESOURCE_META[typeKey.split('_')[0]] || !!RESOURCE_META[f.kind];
                  const kind = f.kind || typeKey.split('_')[0] || typeKey;
                  return (
                    <ImportedResourceCard
                      key={typeKey}
                      kind={f._kind || kind}
                      isKnown={isKnown}
                      theme={theme}
                      rawYaml={f._rawDoc ? rawYamlToString(f._rawDoc) : (f._rawYaml || "")}
                      rawDoc={f._rawDoc}
                      onDelete={() => {
                        setBundle(b => { const nb = { ...b }; delete nb[typeKey]; return nb; });
                        setForms(fms => { const nf = { ...fms }; delete nf[typeKey]; return nf; });
                      }}
                      onRawDocChange={(newDoc, newRawText) => {
                        // newRawText is the exact edited text (preserves quotes+comments)
                        // newRawText is null when coming from the visual editor (recompute from obj)
                        const updated = {
                          ...f,
                          _rawDoc: newDoc,
                          _rawYaml: newRawText !== null && newRawText !== undefined
                            ? newRawText                    // textarea edit: keep exact text
                            : rawYamlToString(newDoc),      // visual edit: reserialize (loses comments, acceptable)
                        };
                        updateForm(typeKey, updated);
                        setBundle(b => ({ ...b, [typeKey]: updated }));
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── HELM ─────────────────────────────────────────────── */}
      {view === "helm" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#818cf8", fontSize: 20, marginBottom: 6 }}>⛵ Helm Chart Generator</div>
          <div style={{ color: theme.textMuted, fontSize: 12, marginBottom: 24 }}>Convert your bundle into a Helm chart structure.</div>
          {(() => {
            const { chartYaml, valuesYaml } = generateHelmChart({ name: form.name || "my-chart" });
            return (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[["Chart.yaml", chartYaml], ["values.yaml", valuesYaml]].map(([fname, content]) => (
                  <div key={fname} style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ padding: "10px 16px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: theme.accent, fontSize: 12, fontWeight: 600 }}>{fname}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => navigator.clipboard.writeText(content)} style={{ background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 5, color: theme.textMuted, cursor: "pointer", fontSize: 10, padding: "3px 8px", fontFamily: "'JetBrains Mono', monospace" }}>📋 Copy</button>
                        <button onClick={() => downloadFile(content, fname)} style={{ background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 5, color: theme.textMuted, cursor: "pointer", fontSize: 10, padding: "3px 8px", fontFamily: "'JetBrains Mono', monospace" }}>⬇️ Download</button>
                      </div>
                    </div>
                    <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.7, padding: "16px 18px", color: "#a0f0c0", background: theme.yamlBg, overflow: "auto", minHeight: 300 }}>{content}</pre>
                  </div>
                ))}
              </div>
            );
          })()}
          <div style={{ marginTop: 20, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "16px 20px" }}>
            <div style={{ color: theme.accent, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>📁 Helm Chart Structure</div>
            <pre style={{ color: theme.textMuted, fontSize: 12, lineHeight: 1.8 }}>{`my-chart/
├── Chart.yaml        ← Chart metadata
├── values.yaml       ← Default values
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    ├── ingress.yaml
    ├── secret.yaml
    ├── configmap.yaml
    └── _helpers.tpl`}</pre>
            <div style={{ marginTop: 12, color: theme.textDim, fontSize: 11 }}>Install: <code style={{ color: "#4ade80" }}>helm install my-app ./my-chart --namespace production</code></div>
          </div>
        </div>
      )}

      {/* ── DIFF ─────────────────────────────────────────────── */}
      {view === "diff" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "20px" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#818cf8", fontSize: 18, marginBottom: 16 }}>🔀 YAML Diff Viewer</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            {[["VERSION A (original)", diffA, setDiffA], ["VERSION B (updated)", diffB, setDiffB]].map(([label, val, setter]) => (
              <div key={label}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ color: theme.textMuted, fontSize: 10.5 }}>{label}</div>
                  {label.includes("A") && yaml && (
                    <button onClick={() => setDiffA(yaml)} style={{ background: "#6366f120", border: "1px solid #6366f140", borderRadius: 4, color: "#818cf8", cursor: "pointer", fontSize: 9.5, padding: "1px 7px", fontFamily: "'JetBrains Mono', monospace" }}>← Use current YAML</button>
                  )}
                </div>
                <textarea value={val} onChange={e => setter(e.target.value)} placeholder="Paste YAML here..."
                  style={{ width: "100%", height: 160, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, padding: "12px", outline: "none", resize: "vertical" }} />
              </div>
            ))}
          </div>
          <div style={{ flex: 1, overflow: "auto", background: theme.yamlBg, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "16px 20px" }}>
            {!diffA && !diffB ? (
              <div style={{ color: theme.textDim, textAlign: "center", paddingTop: 40 }}>Paste YAML in both panels to see the diff</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>
                <tbody>
                  {diffLines().map((line, i) => (
                    <tr key={i}>
                      <td style={{ color: theme.textDim, padding: "1px 8px", userSelect: "none", width: 32, textAlign: "right", fontSize: 10 }}>{i + 1}</td>
                      <td style={{ padding: "1px 12px", borderRight: `1px solid ${theme.border}`, color: line.changed ? "#fca5a5" : "#4a6a4a", whiteSpace: "pre", background: line.changed ? "#1a060610" : "transparent", width: "50%" }}>
                        {line.changed && line.a && <span style={{ color: "#ef4444" }}>- </span>}{line.a}
                      </td>
                      <td style={{ padding: "1px 12px", color: line.changed ? "#86efac" : "#4a6a4a", whiteSpace: "pre", background: line.changed ? "#06180610" : "transparent" }}>
                        {line.changed && line.b && <span style={{ color: "#4ade80" }}>+ </span>}{line.b}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── SNIPPETS ─────────────────────────────────────────── */}
      {view === "snippets" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#818cf8", fontSize: 20, marginBottom: 6 }}>✂️ Snippet Library</div>
          <div style={{ color: theme.textMuted, fontSize: 12, marginBottom: 24 }}>Your saved YAML configurations. Save from the Generator panel.</div>
          {snippets.length === 0 ? (
            <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "40px", textAlign: "center", color: theme.textDim }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✂️</div>
              <div>No snippets saved yet.</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>In the Generator, type a name and click 💾 Save to save a snippet.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
              {snippets.map(s => (
                <div key={s.id} style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{RESOURCE_META[s.type]?.icon || "📄"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: theme.text, fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                      <div style={{ color: theme.textDim, fontSize: 10 }}>{s.type} • {new Date(s.id).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={() => loadSnippet(s)} style={{ background: theme.accentSoft, border: `1px solid ${theme.accent}40`, borderRadius: 5, color: theme.accent, cursor: "pointer", fontSize: 10, padding: "4px 8px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>Load</button>
                      <button onClick={() => { navigator.clipboard.writeText(s.yaml).then(() => showToast(`Copied snippet!`, 'success')) }} style={{ background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 5, color: theme.textMuted, cursor: "pointer", fontSize: 10, padding: "4px 8px", fontFamily: "'JetBrains Mono', monospace" }}>📋</button>
                      <button onClick={() => deleteSnippet(s.id)} style={{ background: "transparent", border: "1px solid #3a1010", borderRadius: 5, color: "#f87171", cursor: "pointer", fontSize: 10, padding: "4px 8px" }}>✕</button>
                    </div>
                  </div>
                  <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, lineHeight: 1.6, padding: "12px 16px", color: "#a0f0c0", background: theme.yamlBg, overflow: "auto", maxHeight: 200 }}>{s.yaml}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "wizard" && <WizardView onLoadTemplate={applyTemplate} onView={setView} theme={theme} />}
      {view === "learn" && <LearnView theme={theme} />}

      {/* ── QUICK CREATE MODAL ───────────────────────────────── */}
      {quickCreateKind && (
        <QuickCreateModal
          kind={quickCreateKind}
          theme={theme}
          onSubmit={handleQuickCreate}
          onClose={() => setQuickCreateKind(null)}
        />
      )}

      {/* Global AI component is now injected into main.jsx directly! */}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && <KeyboardShortcuts onClose={() => setShowShortcuts(false)} theme={theme} />}
    </div>
  );
}
