// ═══════════════════════════════════════════════════════════════════
// K8S ULTIMATE GENERATOR — Part 1: generators.js
// All YAML generators, Image Intelligence, Linting, Security Score
// Import this file in app.jsx
// ═══════════════════════════════════════════════════════════════════

import yaml from "js-yaml";

// ───────────────────────────────────────────────────────────────────
// RAW YAML SERIALIZER — round-trips parsed JS objects back to YAML
// Used by the importer so downloaded YAML matches what was pasted in
// ───────────────────────────────────────────────────────────────────
export function rawYamlToString(parsedObj) {
  try {
    return yaml.dump(parsedObj, {
      indent: 2,
      lineWidth: -1,          // never wrap long lines
      noRefs: true,           // no YAML aliases
      quotingType: '"',       // prefer double quotes
      forceQuotes: false,     // only quote when necessary
      sortKeys: false,        // preserve key order
    }).trimEnd();
  } catch (e) {
    return `# Error serializing YAML: ${e.message}`;
  }
}


// ───────────────────────────────────────────────────────────────────
// IMAGE INTELLIGENCE DATABASE
// ───────────────────────────────────────────────────────────────────
export const IMAGE_DB = {
  postgres: { port: "5432", mountPath: "/var/lib/postgresql/data", cpuReq: "250m", cpuLim: "500m", memReq: "256Mi", memLim: "512Mi", envVars: [{ k: "POSTGRES_DB", v: "mydb" }, { k: "POSTGRES_USER", v: "admin" }, { k: "POSTGRES_PASSWORD", v: "changeme" }] },
  mysql: { port: "3306", mountPath: "/var/lib/mysql", cpuReq: "250m", cpuLim: "500m", memReq: "256Mi", memLim: "512Mi", envVars: [{ k: "MYSQL_DATABASE", v: "mydb" }, { k: "MYSQL_ROOT_PASSWORD", v: "changeme" }] },
  mariadb: { port: "3306", mountPath: "/var/lib/mysql", cpuReq: "250m", cpuLim: "500m", memReq: "256Mi", memLim: "512Mi", envVars: [{ k: "MYSQL_DATABASE", v: "mydb" }, { k: "MYSQL_ROOT_PASSWORD", v: "changeme" }] },
  redis: { port: "6379", mountPath: "/data", cpuReq: "100m", cpuLim: "200m", memReq: "128Mi", memLim: "256Mi", envVars: [] },
  mongodb: { port: "27017", mountPath: "/data/db", cpuReq: "250m", cpuLim: "500m", memReq: "256Mi", memLim: "512Mi", envVars: [{ k: "MONGO_INITDB_ROOT_USERNAME", v: "admin" }, { k: "MONGO_INITDB_ROOT_PASSWORD", v: "changeme" }] },
  mongo: { port: "27017", mountPath: "/data/db", cpuReq: "250m", cpuLim: "500m", memReq: "256Mi", memLim: "512Mi", envVars: [{ k: "MONGO_INITDB_ROOT_USERNAME", v: "admin" }, { k: "MONGO_INITDB_ROOT_PASSWORD", v: "changeme" }] },
  nginx: { port: "80", mountPath: "", cpuReq: "50m", cpuLim: "100m", memReq: "64Mi", memLim: "128Mi", envVars: [] },
  node: { port: "3000", mountPath: "", cpuReq: "100m", cpuLim: "500m", memReq: "128Mi", memLim: "256Mi", envVars: [{ k: "NODE_ENV", v: "production" }] },
  python: { port: "8000", mountPath: "", cpuReq: "100m", cpuLim: "500m", memReq: "128Mi", memLim: "256Mi", envVars: [{ k: "PYTHONUNBUFFERED", v: "1" }] },
  fastapi: { port: "8000", mountPath: "", cpuReq: "100m", cpuLim: "500m", memReq: "128Mi", memLim: "256Mi", envVars: [{ k: "PYTHONUNBUFFERED", v: "1" }] },
  django: { port: "8000", mountPath: "", cpuReq: "100m", cpuLim: "500m", memReq: "128Mi", memLim: "256Mi", envVars: [{ k: "DJANGO_SETTINGS_MODULE", v: "config.settings" }] },
  flask: { port: "5000", mountPath: "", cpuReq: "100m", cpuLim: "500m", memReq: "128Mi", memLim: "256Mi", envVars: [{ k: "FLASK_ENV", v: "production" }] },
  rabbitmq: { port: "5672", mountPath: "/var/lib/rabbitmq", cpuReq: "200m", cpuLim: "500m", memReq: "256Mi", memLim: "512Mi", envVars: [{ k: "RABBITMQ_DEFAULT_USER", v: "admin" }, { k: "RABBITMQ_DEFAULT_PASS", v: "changeme" }] },
  kafka: { port: "9092", mountPath: "/var/lib/kafka/data", cpuReq: "500m", cpuLim: "1", memReq: "512Mi", memLim: "1Gi", envVars: [{ k: "KAFKA_ZOOKEEPER_CONNECT", v: "zookeeper:2181" }] },
  elasticsearch: { port: "9200", mountPath: "/usr/share/elasticsearch/data", cpuReq: "500m", cpuLim: "1", memReq: "512Mi", memLim: "2Gi", envVars: [{ k: "discovery.type", v: "single-node" }, { k: "ES_JAVA_OPTS", v: "-Xms512m -Xmx512m" }] },
  grafana: { port: "3000", mountPath: "/var/lib/grafana", cpuReq: "100m", cpuLim: "200m", memReq: "128Mi", memLim: "256Mi", envVars: [{ k: "GF_SECURITY_ADMIN_PASSWORD", v: "changeme" }] },
  prometheus: { port: "9090", mountPath: "/prometheus", cpuReq: "200m", cpuLim: "500m", memReq: "256Mi", memLim: "512Mi", envVars: [] },
  wordpress: { port: "80", mountPath: "/var/www/html", cpuReq: "200m", cpuLim: "500m", memReq: "256Mi", memLim: "512Mi", envVars: [{ k: "WORDPRESS_DB_HOST", v: "mysql" }, { k: "WORDPRESS_DB_NAME", v: "wordpress" }] },
  nextjs: { port: "3000", mountPath: "", cpuReq: "200m", cpuLim: "500m", memReq: "256Mi", memLim: "512Mi", envVars: [{ k: "NODE_ENV", v: "production" }] },
};

export function detectImage(imageStr) {
  if (!imageStr) return null;
  const name = imageStr.toLowerCase().split(":")[0].split("/").pop();
  for (const [key, val] of Object.entries(IMAGE_DB)) {
    if (name.includes(key)) return { key, ...val };
  }
  return null;
}

export function smartName(appName) {
  const n = (appName || "my-app").toLowerCase().replace(/[^a-z0-9-]/g, "-");
  return {
    service: `${n}-service`,
    secret: `${n}-secret`,
    configmap: `${n}-config`,
    ingress: `${n}-ingress`,
    hpa: `${n}-hpa`,
    pvc: `${n}-pvc`,
    sa: `${n}-sa`,
  };
}

// ───────────────────────────────────────────────────────────────────
// LIVE LINTING ENGINE
// ───────────────────────────────────────────────────────────────────
export function lintResource(type, form) {
  const hints = [];
  const img = form.image || "";

  // ── Common checks for all container-based resources ──
  if (["Deployment", "Pod", "StatefulSet", "DaemonSet", "Job", "CronJob"].includes(type)) {
    if (img && !img.includes(":")) hints.push({ level: "warning", field: "image", msg: "No image tag specified — use name:version" });
    if (img.endsWith(":latest")) hints.push({ level: "warning", field: "image", msg: "Avoid :latest in production — pin to specific version" });
    if (!img) hints.push({ level: "info", field: "image", msg: "No container image specified" });
    if (!form.cpuLim && !form.memLim) hints.push({ level: "warning", field: "cpuLim", msg: "No resource limits — add CPU/memory limits for stability" });
    if (!form.ports?.length) hints.push({ level: "info", field: "ports", msg: "No ports defined — add at least one container port" });
    if (!form.enableProbe) hints.push({ level: "info", field: "enableProbe", msg: "No health probes — add liveness/readiness probes for reliability" });
    if (form.memReq && form.memLim) {
      const req = parseInt(form.memReq);
      const lim = parseInt(form.memLim);
      if (req > lim) hints.push({ level: "error", field: "memReq", msg: "Memory request cannot exceed memory limit" });
    }
    if (form.cpuReq && form.cpuLim) {
      const req = parseFloat(form.cpuReq);
      const lim = parseFloat(form.cpuLim);
      if (!isNaN(req) && !isNaN(lim) && req > lim) hints.push({ level: "error", field: "cpuReq", msg: "CPU request cannot exceed CPU limit" });
    }
    if (!form.name) hints.push({ level: "error", field: "name", msg: "Name is required" });
    if (form.name && !/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(form.name)) hints.push({ level: "error", field: "name", msg: "Name must be lowercase alphanumeric with dashes only" });
  }

  // ── Deployment-specific ──
  if (type === "Deployment") {
    const reps = parseInt(form.replicas) || 1;
    if (reps === 1) hints.push({ level: "info", field: "replicas", msg: "Single replica — consider 2+ for zero-downtime deployments" });
    if (reps > 20) hints.push({ level: "warning", field: "replicas", msg: "High replica count — make sure resources are sufficient" });
  }

  // ── StatefulSet-specific ──
  if (type === "StatefulSet") {
    if (!form.storage && !form.volumeMounts?.length) hints.push({ level: "warning", field: "storage", msg: "No persistent storage configured — StatefulSets usually need PVCs" });
    const reps = parseInt(form.replicas) || 1;
    if (reps > 10) hints.push({ level: "warning", field: "replicas", msg: "High replica count for StatefulSet — ensure storage backend can handle it" });
  }

  // ── DaemonSet-specific ──
  if (type === "DaemonSet") {
    if (!form.enableProbe) hints.push({ level: "warning", field: "enableProbe", msg: "DaemonSet without probes — if agent crashes, it won't restart properly" });
  }

  // ── Service-specific ──
  if (type === "Service") {
    if (form.serviceType === "LoadBalancer") hints.push({ level: "info", field: "serviceType", msg: "LoadBalancer creates a cloud load balancer (costs money) — consider Ingress" });
    if (form.serviceType === "NodePort") hints.push({ level: "info", field: "serviceType", msg: "NodePort exposes on all nodes (30000-32767) — avoid in production" });
    if (!form.ports?.length) hints.push({ level: "error", field: "ports", msg: "Service must have at least one port defined" });
    if (!form.selector) hints.push({ level: "warning", field: "selector", msg: "No selector defined — Service won't route traffic to any pods" });
  }

  // ── Ingress-specific ──
  if (type === "Ingress") {
    if (form.tls && !form.clusterIssuer) hints.push({ level: "warning", field: "clusterIssuer", msg: "TLS enabled but no ClusterIssuer specified — cert-manager won't issue certificate" });
    if (!form.tls) hints.push({ level: "info", field: "tls", msg: "No TLS configured — traffic will be unencrypted HTTP" });
    if (!form.rules?.length) hints.push({ level: "error", field: "rules", msg: "Ingress must have at least one routing rule" });
    if (form.rules?.some(r => !r.host)) hints.push({ level: "info", field: "rules", msg: "Rule without host — will match all incoming traffic" });
  }

  // ── HPA-specific ──
  if (type === "HPA") {
    const min = parseInt(form.minReplicas) || 1;
    const max = parseInt(form.maxReplicas) || 10;
    if (min > max) hints.push({ level: "error", field: "minReplicas", msg: "Min replicas cannot exceed max replicas" });
    if (!form.cpuTarget && !form.memTarget) hints.push({ level: "warning", field: "cpuTarget", msg: "No scaling metric defined — add CPU or memory target" });
    if (!form.target) hints.push({ level: "error", field: "target", msg: "No target deployment specified" });
    if (max > 50) hints.push({ level: "warning", field: "maxReplicas", msg: "Very high max replicas — ensure cluster capacity" });
  }

  // ── PVC-specific ──
  if (type === "PersistentVolumeClaim") {
    if (!form.storageClass) hints.push({ level: "info", field: "storageClass", msg: "No storageClass — will use cluster default storage class" });
    if (!form.size && !form.storage) hints.push({ level: "error", field: "size", msg: "Storage size is required" });
    if (!form.accessMode) hints.push({ level: "info", field: "accessMode", msg: "No access mode specified — defaults to ReadWriteOnce" });
  }

  // ── CronJob-specific ──
  if (type === "CronJob") {
    if (form.schedule) {
      const parts = form.schedule.split(" ");
      if (parts.length !== 5) hints.push({ level: "error", field: "schedule", msg: "Invalid cron format — must have 5 parts: minute hour day month weekday" });
    } else {
      hints.push({ level: "error", field: "schedule", msg: "Schedule is required for CronJob" });
    }
  }

  // ── Job-specific ──
  if (type === "Job") {
    if (!form.image) hints.push({ level: "error", field: "image", msg: "Container image is required for Job" });
    if (form.backoffLimit && parseInt(form.backoffLimit) > 10) hints.push({ level: "warning", field: "backoffLimit", msg: "High backoff limit — job may retry too many times" });
  }

  // ── Secret-specific ──
  if (type === "Secret") {
    if (!form.data?.length) hints.push({ level: "warning", field: "data", msg: "Secret has no data entries" });
    if (form.data?.some(d => d.k === "password" || d.k === "PASSWORD")) hints.push({ level: "info", field: "data", msg: "Consider using more specific key names (e.g. DB_PASSWORD)" });
  }

  // ── ConfigMap-specific ──
  if (type === "ConfigMap") {
    if (!form.data?.length) hints.push({ level: "warning", field: "data", msg: "ConfigMap has no data entries" });
  }

  // ── Namespace-specific ──
  if (type === "Namespace") {
    if (!form.name) hints.push({ level: "error", field: "name", msg: "Namespace name is required" });
    const reserved = ["default", "kube-system", "kube-public", "kube-node-lease"];
    if (reserved.includes(form.name)) hints.push({ level: "warning", field: "name", msg: `"${form.name}" is a reserved namespace` });
  }

  // ── ServiceAccount-specific ──
  if (type === "ServiceAccount") {
    if (form.automount !== "false") hints.push({ level: "info", field: "automount", msg: "Token auto-mounted — disable if pods don't need API access" });
  }

  // ── PDB-specific ──
  if (type === "PodDisruptionBudget") {
    if (!form.selector) hints.push({ level: "error", field: "selector", msg: "PDB requires a selector to know which pods to protect" });
    if (!form.minAvailable && !form.maxUnavailable) hints.push({ level: "error", field: "minAvailable", msg: "Set either minAvailable or maxUnavailable" });
  }

  // ── LimitRange-specific ──
  if (type === "LimitRange") {
    if (!form.defaultCpu && !form.defaultMem) hints.push({ level: "info", field: "defaultCpu", msg: "No default limits set — add CPU/memory defaults" });
  }

  // ── ResourceQuota-specific ──
  if (type === "ResourceQuota") {
    if (!form.cpuLim && !form.memLim && !form.pods) hints.push({ level: "warning", field: "cpuLim", msg: "No quota limits defined — add at least one limit" });
  }

  // ── Generic check: name required for all ──
  if (!form.name && !["PodDisruptionBudget", "LimitRange", "ResourceQuota"].includes(type)) {
    // Already caught by container-based check above
  }

  return hints;
}

// ───────────────────────────────────────────────────────────────────
// SECURITY SCORE ENGINE
// ───────────────────────────────────────────────────────────────────
export function calcSecurityScore(type, form) {
  let score = 100;
  const issues = [];
  const passes = [];

  // ── Container-based resources share common security checks ──
  if (["Deployment", "Pod", "StatefulSet", "DaemonSet", "Job", "CronJob"].includes(type)) {
    const img = form.image || "";
    if (!form.cpuLim || !form.memLim) { score -= 15; issues.push("No resource limits set"); }
    else passes.push("Resource limits configured");

    if (img.endsWith(":latest") || !img.includes(":")) { score -= 15; issues.push("Image not pinned to specific version"); }
    else if (img) passes.push("Image version pinned");

    if (!form.enableProbe) { score -= 10; issues.push("No liveness/readiness probes"); }
    else passes.push("Health probes configured");

    if (!form.serviceAccount) { score -= 5; issues.push("Using default service account"); }
    else passes.push("Custom service account assigned");

    if (form.runAsRoot === "true" || form.runAsUser === "0") { score -= 25; issues.push("Container runs as root (dangerous!)"); }
    else passes.push("Not running as root");

    if (form.readOnlyRoot === "true") passes.push("Read-only root filesystem");
    else { score -= 5; issues.push("Root filesystem not read-only"); }

    if (form.runAsNonRoot === "true") passes.push("runAsNonRoot enforced");
  }

  if (type === "ServiceAccount") {
    if (form.automount === "true") { score -= 20; issues.push("Service account token auto-mounted"); }
    else passes.push("Token auto-mount disabled");
  }

  if (type === "Ingress") {
    if (form.tls) passes.push("HTTPS/TLS enabled");
    else { score -= 20; issues.push("No TLS — traffic is unencrypted"); }
    if (form.clusterIssuer) passes.push("Certificate auto-managed via cert-manager");
  }

  if (type === "Secret") {
    passes.push("Using Kubernetes Secret for sensitive data");
    if (form.data?.length > 0) passes.push("Secret has data entries");
  }

  if (type === "Service") {
    if (form.serviceType === "ClusterIP") passes.push("Service uses ClusterIP (internal only)");
    if (form.serviceType === "LoadBalancer") { score -= 5; issues.push("LoadBalancer exposes service externally"); }
  }

  if (type === "NetworkPolicy") {
    if (form.ingress?.length || form.egress?.length) passes.push("Network rules defined");
    else { score -= 10; issues.push("No ingress/egress rules defined"); }
  }

  if (type === "PodDisruptionBudget") {
    passes.push("PDB protects against voluntary disruptions");
  }

  const finalScore = Math.max(0, score);
  const grade = finalScore >= 90 ? "A" : finalScore >= 75 ? "B" : finalScore >= 60 ? "C" : finalScore >= 40 ? "D" : "F";
  const color = finalScore >= 90 ? "#4ade80" : finalScore >= 75 ? "#a3e635" : finalScore >= 60 ? "#fbbf24" : finalScore >= 40 ? "#fb923c" : "#f87171";
  return { score: finalScore, grade, color, issues, passes };
}

// ───────────────────────────────────────────────────────────────────
// YAML BUILDER HELPERS
// ───────────────────────────────────────────────────────────────────
function indent(str, spaces) {
  return str.split("\n").map(l => " ".repeat(spaces) + l).join("\n");
}

function buildPortsBlock(ports = []) {
  const validPorts = ports.filter(p => p.port);
  if (!validPorts.length) return "        ports:\n        - containerPort: 80";
  return "        ports:\n" + validPorts.map(p =>
    `        - containerPort: ${p.port}${p.name ? `\n          name: ${p.name}` : ""}${p.protocol && p.protocol !== "TCP" ? `\n          protocol: ${p.protocol}` : ""}`
  ).join("\n");
}

function buildEnvBlock(envVars = [], secretRefs = [], cmRefs = []) {
  const lines = [];
  envVars.filter(e => e.k).forEach(e => lines.push(`        - name: ${e.k}\n          value: "${e.v || ""}"`));
  secretRefs.filter(s => s.envKey && s.secretName && s.secretKey).forEach(s =>
    lines.push(`        - name: ${s.envKey}\n          valueFrom:\n            secretKeyRef:\n              name: ${s.secretName}\n              key: ${s.secretKey}`)
  );
  cmRefs.filter(c => c.envKey && c.cmName && c.cmKey).forEach(c =>
    lines.push(`        - name: ${c.envKey}\n          valueFrom:\n            configMapKeyRef:\n              name: ${c.cmName}\n              key: ${c.cmKey}`)
  );
  if (!lines.length) return "";
  return "        env:\n" + lines.join("\n");
}

function buildResources(f) {
  if (!f.cpuReq && !f.memReq && !f.cpuLim && !f.memLim) return "";
  const req = [];
  const lim = [];
  if (f.cpuReq) req.push(`            cpu: "${f.cpuReq}"`);
  if (f.memReq) req.push(`            memory: "${f.memReq}"`);
  if (f.cpuLim) lim.push(`            cpu: "${f.cpuLim}"`);
  if (f.memLim) lim.push(`            memory: "${f.memLim}"`);
  let block = "        resources:";
  if (req.length) block += "\n          requests:\n" + req.join("\n");
  if (lim.length) block += "\n          limits:\n" + lim.join("\n");
  return block;
}

function buildProbes(f) {
  if (!f.enableProbe) return "";
  const port = f.ports?.[0]?.port || 80;
  const path = f.probePath || "/";
  const delay = f.probeDelay || 15;
  return `        livenessProbe:
          httpGet:
            path: ${path}
            port: ${port}
          initialDelaySeconds: ${delay}
          periodSeconds: 20
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: ${path}
            port: ${port}
          initialDelaySeconds: 5
          periodSeconds: 10
          failureThreshold: 3`;
}

function buildVolumeMounts(mounts = []) {
  const valid = mounts.filter(m => m.name && m.path);
  if (!valid.length) return "";
  return "        volumeMounts:\n" + valid.map(m =>
    `        - name: ${m.name}\n          mountPath: ${m.path}${m.readOnly ? "\n          readOnly: true" : ""}`
  ).join("\n");
}

function buildVolumes(vols = []) {
  const valid = vols.filter(v => v.name && v.type);
  if (!valid.length) return "";
  return "      volumes:\n" + valid.map(v => {
    if (v.type === "configMap") return `      - name: ${v.name}\n        configMap:\n          name: ${v.source || v.name}`;
    if (v.type === "secret") return `      - name: ${v.name}\n        secret:\n          secretName: ${v.source || v.name}`;
    if (v.type === "emptyDir") return `      - name: ${v.name}\n        emptyDir: {}`;
    if (v.type === "hostPath") return `      - name: ${v.name}\n        hostPath:\n          path: ${v.source || "/data"}`;
    return `      - name: ${v.name}\n        persistentVolumeClaim:\n          claimName: ${v.source || v.name}`;
  }).join("\n");
}

function buildInitContainers(inits = []) {
  const valid = inits.filter(i => i.name && i.image);
  if (!valid.length) return "";
  return "      initContainers:\n" + valid.map(i =>
    `      - name: ${i.name}\n        image: ${i.image}${i.command ? `\n        command: ["/bin/sh", "-c", "${i.command}"]` : ""}`
  ).join("\n");
}

// Returns pod-level securityContext block (runAsNonRoot, runAsUser, seccompProfile)
function buildPodSecurityContext(f) {
  const lines = [];
  if (f.runAsNonRoot === "true") lines.push("        runAsNonRoot: true");
  if (f.runAsUser) lines.push(`        runAsUser: ${f.runAsUser}`);
  if (f.fsGroup) lines.push(`        fsGroup: ${f.fsGroup}`);
  // seccompProfile: RuntimeDefault is required for PSS Restricted
  if (f.seccompProfile !== "false") lines.push("        seccompProfile:\n          type: RuntimeDefault");
  if (!lines.length) return "";
  return "      securityContext:\n" + lines.join("\n");
}

// Returns container-level securityContext block (readOnlyRootFilesystem, allowPrivilegeEscalation, capabilities)
function buildContainerSecurityContext(f) {
  const lines = [];
  if (f.readOnlyRoot === "true") lines.push("          readOnlyRootFilesystem: true");
  if (f.allowPrivilegeEsc === "false") lines.push("          allowPrivilegeEscalation: false");
  // Drop all Linux capabilities by default (PSS Restricted requirement)
  if (f.dropCapabilities !== "false") lines.push("          capabilities:\n            drop:\n            - ALL");
  if (!lines.length) return "";
  return "        securityContext:\n" + lines.join("\n");
}

// Legacy alias — returns pod-level only (used by Pod generator)
function buildSecurityContext(f) {
  return buildPodSecurityContext(f);
}

function buildLabels(extras = []) {
  return extras.filter(l => l.k).map(l => `    ${l.k}: "${l.v}"`).join("\n");
}

function buildAnnotations(annots = []) {
  if (!annots.filter(a => a.k).length) return "";
  return "  annotations:\n" + annots.filter(a => a.k).map(a => `    ${a.k}: "${a.v}"`).join("\n");
}

function buildScheduling(f) {
  const parts = [];
  if (f.nodeSelector && f.nodeSelector.length) {
    const valid = f.nodeSelector.filter(n => n.k);
    if (valid.length) {
      parts.push("      nodeSelector:\n" + valid.map(n => `        ${n.k}: "${n.v}"`).join("\n"));
    }
  }
  if (f.tolerations && f.tolerations.length) {
    const valid = f.tolerations.filter(t => t.key || t.operator === "Exists");
    if (valid.length) {
      parts.push("      tolerations:\n" + valid.map(t => {
        // Properly structured toleration — key is optional when operator is Exists
        const lines = [`        - operator: ${t.operator || "Equal"}`];
        if (t.key) lines.push(`          key: "${t.key}"`);
        if (t.operator !== "Exists" && t.value) lines.push(`          value: "${t.value}"`);
        if (t.effect) lines.push(`          effect: ${t.effect}`);
        return lines.join("\n");
      }).join("\n"));
    }
  }
  return parts.join("\n");
}

// ───────────────────────────────────────────────────────────────────
// MAIN GENERATORS — Each returns a string of valid YAML
// ───────────────────────────────────────────────────────────────────
export const GENERATORS = {

  Deployment: (f) => {
    const name = f.name || "my-app";
    const ns = f.namespace || "default";
    const ports = buildPortsBlock(f.ports || [{ port: f.port || "80" }]);
    const env = buildEnvBlock(f.envVars || [], f.secretRefs || [], f.cmRefs || []);
    const res = buildResources(f);
    const probes = buildProbes(f);
    const vmounts = buildVolumeMounts(f.volumeMounts || []);
    const vols = buildVolumes(f.volumes || []);
    const inits = buildInitContainers(f.initContainers || []);
    const sec = buildSecurityContext(f);
    const extraLabels = buildLabels(f.labels || []);
    const annots = buildAnnotations(f.annotations || []);
    const sched = buildScheduling(f);

    const podSec = buildPodSecurityContext(f);
    const containerSec = buildContainerSecurityContext(f);
    const containerParts = [ports, env, res, probes, vmounts, containerSec].filter(Boolean);
    const specParts = [inits, podSec, vols, sched].filter(Boolean);
    const termGrace = f.terminationGracePeriodSeconds || 30;

    return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}
  namespace: ${ns}
  labels:
    app: ${name}
    version: "${f.version || "v1"}"${extraLabels ? "\n" + extraLabels : ""}${annots ? "\n" + annots : ""}
spec:
  replicas: ${f.replicas || 1}
  selector:
    matchLabels:
      app: ${name}
  strategy:
    type: ${f.strategy || "RollingUpdate"}${f.strategy !== "Recreate" ? "\n    rollingUpdate:\n      maxSurge: 1\n      maxUnavailable: 0" : ""}
  template:
    metadata:
      labels:
        app: ${name}
        version: "${f.version || "v1"}"
    spec:${f.serviceAccount ? `\n      serviceAccountName: ${f.serviceAccount}` : ""}${f.imagePullSecret ? `\n      imagePullSecrets:\n      - name: ${f.imagePullSecret}` : ""}
      terminationGracePeriodSeconds: ${termGrace}
${specParts.length ? specParts.join("\n") + "\n" : ""}      containers:
      - name: ${name}
        image: ${f.image || "nginx:latest"}
        imagePullPolicy: ${f.pullPolicy || "IfNotPresent"}
${containerParts.join("\n")}`;
  },

  Service: (f) => {
    const name = f.name || "my-service";
    const ns = f.namespace || "default";
    const type = f.serviceType || "ClusterIP";
    const ports = (f.ports || [{ port: "80", targetPort: "80" }]).filter(p => p.port);

    return `apiVersion: v1
kind: Service
metadata:
  name: ${name}
  namespace: ${ns}
spec:
  type: ${type}
  selector:
    app: ${f.selector || "my-app"}
  ports:
${ports.map(p => `  - name: ${p.name || "http"}
    port: ${p.port}
    targetPort: ${p.targetPort || p.port}${p.protocol && p.protocol !== "TCP" ? `\n    protocol: ${p.protocol}` : ""}${type === "NodePort" && p.nodePort ? `\n    nodePort: ${p.nodePort}` : ""}`).join("\n")}${type === "LoadBalancer" && f.loadBalancerIP ? `\n  loadBalancerIP: ${f.loadBalancerIP}` : ""}${f.sessionAffinity ? `\n  sessionAffinity: ${f.sessionAffinity}` : ""}`;
  },

  Ingress: (f) => {
    const name = f.name || "my-ingress";
    const ns = f.namespace || "default";
    const tls = f.tls === true || f.tls === "true";
    const rules = (f.rules || [{ host: f.host || "app.domain.com", path: "/", service: f.service || "my-service", port: f.servicePort || "80" }]).filter(r => r.host);

    const annotations = [];
    if (tls && f.clusterIssuer) annotations.push(`    cert-manager.io/cluster-issuer: "${f.clusterIssuer}"`);
    if (f.proxyBodySize) annotations.push(`    nginx.ingress.kubernetes.io/proxy-body-size: "${f.proxyBodySize}"`);
    if (f.rateLimitRPS) annotations.push(`    nginx.ingress.kubernetes.io/limit-rps: "${f.rateLimitRPS}"`);
    if (f.corsEnabled) annotations.push(`    nginx.ingress.kubernetes.io/enable-cors: "true"`);
    (f.annotations || []).filter(a => a.k).forEach(a => annotations.push(`    ${a.k}: "${a.v}"`));

    return `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${name}
  namespace: ${ns}${annotations.length ? "\n  annotations:\n" + annotations.join("\n") : ""}
spec:
  ingressClassName: ${f.ingressClass || "traefik"}${tls ? `\n  tls:\n` + rules.map(r => `  - hosts:\n    - ${r.host}\n    secretName: ${name}-tls`).join("\n") : ""}
  rules:
${rules.map(r => `  - host: ${r.host}
    http:
      paths:
      - path: ${r.path || "/"}
        pathType: Prefix
        backend:
          service:
            name: ${r.service || "my-service"}
            port:
              number: ${r.port || 80}`).join("\n")}`;
  },

  Secret: (f) => {
    const pairs = (f.data || [{ k: "KEY", v: "" }]).filter(d => d.k);
    return `apiVersion: v1
kind: Secret
metadata:
  name: ${f.name || "my-secret"}
  namespace: ${f.namespace || "default"}
type: ${f.secretType || "Opaque"}
stringData:
${pairs.map(p => `  ${p.k}: "${p.v}"`).join("\n")}
# ⚠️  NEVER commit this file to Git!
# Apply manually: kubectl apply -f secret.yaml
# Add to .gitignore: echo "secret.yaml" >> .gitignore`;
  },

  ConfigMap: (f) => {
    const pairs = (f.data || [{ k: "KEY", v: "value" }]).filter(d => d.k);
    return `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${f.name || "my-config"}
  namespace: ${f.namespace || "default"}
data:
${pairs.map(p => `  ${p.k}: "${p.v}"`).join("\n")}`;
  },

  StatefulSet: (f) => {
    const name = f.name || "my-db";
    const ns = f.namespace || "default";
    const ports = buildPortsBlock(f.ports || [{ port: f.port || "5432" }]);
    const env = buildEnvBlock(f.envVars || [], f.secretRefs || [], f.cmRefs || []);
    const res = buildResources(f);
    const vmounts = buildVolumeMounts([...(f.volumeMounts || []), ...(f.mountPath ? [{ name: "data", path: f.mountPath }] : [])]);
    const vols = buildVolumes(f.volumes || []);
    const sched = buildScheduling(f);

    return `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ${name}
  namespace: ${ns}
spec:
  serviceName: ${name}
  replicas: ${f.replicas || 1}
  selector:
    matchLabels:
      app: ${name}
  template:
    metadata:
      labels:
        app: ${name}
    spec:
      containers:
      - name: ${name}
        image: ${f.image || "postgres:15"}
        imagePullPolicy: ${f.pullPolicy || "Always"}
${ports}${env ? "\n" + env : ""}${res ? "\n" + res : ""}${vmounts ? "\n" + vmounts : ""}${vols ? "\n" + vols : ""}${sched ? "\n" + sched : ""}
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: ${f.storageClass || "standard"}
      resources:
        requests:
          storage: ${f.storage || "10Gi"}`;
  },

  PersistentVolumeClaim: (f) => `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${f.name || "my-pvc"}
  namespace: ${f.namespace || "default"}
spec:
  accessModes:
  - ${f.accessMode || "ReadWriteOnce"}
  storageClassName: ${f.storageClass || "standard"}
  resources:
    requests:
      storage: ${f.storage || "5Gi"}`,

  Namespace: (f) => {
    const labels = (f.labels || []).filter(l => l.k);
    return `apiVersion: v1
kind: Namespace
metadata:
  name: ${f.name || "my-namespace"}${labels.length ? "\n  labels:\n" + labels.map(l => `    ${l.k}: "${l.v}"`).join("\n") : ""}`;
  },

  ServiceAccount: (f) => `apiVersion: v1
kind: ServiceAccount
metadata:
  name: ${f.name || "my-sa"}
  namespace: ${f.namespace || "default"}
automountServiceAccountToken: ${f.automount === "true" ? "true" : "false"}`,

  HPA: (f) => {
    const metrics = [];
    if (f.cpuTarget) metrics.push(`  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: ${f.cpuTarget}`);
    // Memory scaling uses AverageValue (e.g. 200Mi), NOT Utilization percentage
    if (f.memTarget) metrics.push(`  - type: Resource
    resource:
      name: memory
      target:
        type: AverageValue
        averageValue: ${f.memTarget}`);
    return `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${f.name || "my-hpa"}
  namespace: ${f.namespace || "default"}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${f.target || "my-app"}
  minReplicas: ${f.minReplicas || 1}
  maxReplicas: ${f.maxReplicas || 10}
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
  metrics:
${metrics.length ? metrics.join("\n") : `  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70`}`;
  },

  CronJob: (f) => {
    const sched = buildScheduling(f);
    return `apiVersion: batch/v1
kind: CronJob
metadata:
  name: ${f.name || "my-cronjob"}
  namespace: ${f.namespace || "default"}
spec:
  schedule: "${f.schedule || "0 2 * * *"}"
  successfulJobsHistoryLimit: ${f.successHistoryLimit || 3}
  failedJobsHistoryLimit: ${f.failedHistoryLimit || 1}
  concurrencyPolicy: ${f.concurrency || "Forbid"}
  jobTemplate:
    spec:
      backoffLimit: ${f.backoffLimit || 3}
      template:
        spec:
          restartPolicy: ${f.restartPolicy || "OnFailure"}${sched ? "\n" + sched : ""}
          containers:
          - name: ${f.name || "my-cronjob"}
            image: ${f.image || "busybox:latest"}
            imagePullPolicy: ${f.pullPolicy || "IfNotPresent"}
            command: ["/bin/sh", "-c", "${f.command || "echo hello"}"]`;
  },

  Job: (f) => {
    const sched = buildScheduling(f);
    return `apiVersion: batch/v1
kind: Job
metadata:
  name: ${f.name || "my-job"}
  namespace: ${f.namespace || "default"}
spec:
  completions: ${f.completions || 1}
  parallelism: ${f.parallelism || 1}
  backoffLimit: ${f.backoffLimit || 3}
  activeDeadlineSeconds: ${f.deadline || 600}
  template:
    spec:
      restartPolicy: OnFailure${sched ? "\n" + sched : ""}
      containers:
      - name: ${f.name || "my-job"}
        image: ${f.image || "busybox:latest"}
        command: ["/bin/sh", "-c", "${f.command || "echo done"}"]`;
  },

  "ArgoCD App": (f) => `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ${f.name || "my-app"}
  namespace: argocd
spec:
  project: ${f.project || "default"}
  source:
    repoURL: ${f.repoURL || "https://github.com/user/repo"}
    targetRevision: ${f.branch || "HEAD"}
    path: ${f.path || "k8s/"}
  destination:
    server: https://kubernetes.default.svc
    namespace: ${f.namespace || "default"}
  syncPolicy:
    automated:
      prune: ${f.prune !== "false" ? "true" : "false"}
      selfHeal: ${f.selfHeal !== "false" ? "true" : "false"}
    syncOptions:
    - CreateNamespace=true
    - PrunePropagationPolicy=foreground`,

  ClusterIssuer: (f) => `apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: ${f.name || "letsencrypt-prod"}
spec:
  acme:
    server: ${f.staging === "true" ? "https://acme-staging-v02.api.letsencrypt.org/directory" : "https://acme-v02.api.letsencrypt.org/directory"}
    email: ${f.email || "admin@domain.com"}
    privateKeySecretRef:
      name: ${f.name || "letsencrypt-prod"}
    solvers:
    - http01:
        ingress:
          class: ${f.ingressClass || "traefik"}`,

  NetworkPolicy: (f) => {
    const ingress = (f.ingressRules || [{ fromApp: "frontend", port: "80" }]).filter(r => r.port);
    const egress = (f.egressRules || []);
    return `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ${f.name || "my-netpol"}
  namespace: ${f.namespace || "default"}
spec:
  podSelector:
    matchLabels:
      app: ${f.selector || "my-app"}
  policyTypes:
  - Ingress${egress.length ? "\n  - Egress" : ""}
  ingress:
${ingress.map(r => `  - from:
    - podSelector:
        matchLabels:
          app: ${r.fromApp || "frontend"}
    ports:
    - protocol: TCP
      port: ${r.port}`).join("\n")}${egress.length ? "\n  egress:\n" + egress.filter(r => r.port).map(r => `  - to:\n    - podSelector:\n        matchLabels:\n          app: ${r.toApp || "backend"}\n    ports:\n    - protocol: TCP\n      port: ${r.port}`).join("\n") : ""}`;
  },

  "Role & RoleBinding": (f) => {
    const resources = (f.resources || "pods,services").split(",").map(r => `"${r.trim()}"`).join(", ");
    const verbs = (f.verbs || "get,list,watch").split(",").map(v => `"${v.trim()}"`).join(", ");
    return `apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: ${f.name || "my-role"}
  namespace: ${f.namespace || "default"}
rules:
- apiGroups: ["${f.apiGroups || ""}"]
  resources: [${resources}]
  verbs: [${verbs}]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: ${f.name || "my-role"}-binding
  namespace: ${f.namespace || "default"}
subjects:
- kind: ServiceAccount
  name: ${f.subjectName || "my-sa"}
  namespace: ${f.namespace || "default"}
roleRef:
  kind: Role
  name: ${f.name || "my-role"}
  apiGroup: rbac.authorization.k8s.io`;
  },

  PodDisruptionBudget: (f) => `apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: ${f.name || "my-pdb"}
  namespace: ${f.namespace || "default"}
spec:
  ${f.budgetType === "maxUnavailable" ? `maxUnavailable: ${f.budgetValue || 1}` : `minAvailable: ${f.budgetValue || "50%"}`}
  selector:
    matchLabels:
      app: ${f.selector || "my-app"}`,

  "ClusterRole & Binding": (f) => {
    const resources = (f.resources || "pods,services,deployments").split(",").map(r => `"${r.trim()}"`).join(", ");
    const verbs = (f.verbs || "get,list,watch").split(",").map(v => `"${v.trim()}"`).join(", ");
    return `apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: ${f.name || "my-cluster-role"}
rules:
- apiGroups: ["${f.apiGroups || "apps"}"]
  resources: [${resources}]
  verbs: [${verbs}]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: ${f.name || "my-cluster-role"}-binding
subjects:
- kind: ServiceAccount
  name: ${f.subjectName || "my-sa"}
  namespace: ${f.namespace || "default"}
roleRef:
  kind: ClusterRole
  name: ${f.name || "my-cluster-role"}
  apiGroup: rbac.authorization.k8s.io`;
  },

  "LimitRange": (f) => `apiVersion: v1
kind: LimitRange
metadata:
  name: ${f.name || "my-limitrange"}
  namespace: ${f.namespace || "default"}
spec:
  limits:
  - type: Container
    default:
      cpu: "${f.defaultCpuLim || "500m"}"
      memory: "${f.defaultMemLim || "256Mi"}"
    defaultRequest:
      cpu: "${f.defaultCpuReq || "100m"}"
      memory: "${f.defaultMemReq || "128Mi"}"
    max:
      cpu: "${f.maxCpu || "2"}"
      memory: "${f.maxMem || "1Gi"}"`,

  Pod: (f) => {
    const name = f.name || "my-pod";
    const ns = f.namespace || "default";
    const ports = buildPortsBlock(f.ports || [{ port: f.port || "80" }]);
    const env = buildEnvBlock(f.envVars || [], f.secretRefs || [], f.cmRefs || []);
    const res = buildResources(f);
    const probes = buildProbes(f);
    const vmounts = buildVolumeMounts(f.volumeMounts || []);
    const sec = buildSecurityContext(f);
    const sched = buildScheduling(f);
    const containerParts = [ports, env, res, probes, vmounts].filter(Boolean);
    const specParts = [sec, sched].filter(Boolean);
    return `apiVersion: v1
kind: Pod
metadata:
  name: ${name}
  namespace: ${ns}
  labels:
    app: ${name}
spec:${f.serviceAccount ? `\n  serviceAccountName: ${f.serviceAccount}` : ""}
  restartPolicy: ${f.restartPolicy || "Always"}
  containers:
  - name: ${name}
    image: ${f.image || "nginx:latest"}
    imagePullPolicy: ${f.pullPolicy || "IfNotPresent"}
${containerParts.join("\n")}${specParts.length ? "\n" + specParts.join("\n") : ""}`;
  },

  DaemonSet: (f) => {
    const name = f.name || "my-daemon";
    const ns = f.namespace || "default";
    const ports = buildPortsBlock(f.ports || [{ port: f.port || "80" }]);
    const env = buildEnvBlock(f.envVars || [], [], []);
    const res = buildResources(f);
    const vmounts = buildVolumeMounts(f.volumeMounts || []);
    const vols = buildVolumes(f.volumes || []);
    const sched = buildScheduling(f);
    const containerParts = [ports, env, res, vmounts].filter(Boolean);
    const specParts = [vols, sched].filter(Boolean);
    return `apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: ${name}
  namespace: ${ns}
  labels:
    app: ${name}
spec:
  selector:
    matchLabels:
      app: ${name}
  updateStrategy:
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: ${name}
    spec:${f.tolerateAll ? "\n      tolerations:\n      - operator: Exists" : ""}
      containers:
      - name: ${name}
        image: ${f.image || "fluent/fluentd:v1.16"}
        imagePullPolicy: ${f.pullPolicy || "IfNotPresent"}
${containerParts.join("\n")}${specParts.length ? "\n" + specParts.join("\n") : ""}`;
  },

  PersistentVolume: (f) => `apiVersion: v1
kind: PersistentVolume
metadata:
  name: ${f.name || "my-pv"}
  labels:
    type: ${f.pvType || "local"}
spec:
  storageClassName: ${f.storageClass || "standard"}
  capacity:
    storage: ${f.storage || "10Gi"}
  accessModes:
  - ${f.accessMode || "ReadWriteOnce"}
  persistentVolumeReclaimPolicy: ${f.reclaimPolicy || "Retain"}${f.pvType === "hostPath" || !f.pvType ? `\n  hostPath:\n    path: "${f.hostPath || "/mnt/data"}"` : ""}${f.pvType === "nfs" ? `\n  nfs:\n    path: ${f.nfsPath || "/exports/data"}\n    server: ${f.nfsServer || "nfs-server.example.com"}` : ""}`,

  StorageClass: (f) => `apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ${f.name || "my-storage-class"}${f.isDefault === "true" ? "\n  annotations:\n    storageclass.kubernetes.io/is-default-class: \"true\"" : ""}
provisioner: ${f.provisioner || "rancher.io/local-path"}
volumeBindingMode: ${f.bindingMode || "WaitForFirstConsumer"}
reclaimPolicy: ${f.reclaimPolicy || "Delete"}
allowVolumeExpansion: ${f.allowExpansion === "false" ? "false" : "true"}`,

  VPA: (f) => `apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: ${f.name || "my-vpa"}
  namespace: ${f.namespace || "default"}
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${f.target || "my-app"}
  updatePolicy:
    updateMode: "${f.updateMode || "Auto"}"
  resourcePolicy:
    containerPolicies:
    - containerName: "${f.target || "my-app"}"
      minAllowed:
        cpu: ${f.minCpu || "50m"}
        memory: ${f.minMem || "64Mi"}
      maxAllowed:
        cpu: ${f.maxCpu || "2"}
        memory: ${f.maxMem || "2Gi"}
      controlledResources: ["cpu", "memory"]`,

  ServiceMonitor: (f) => `apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: ${f.name || "my-monitor"}
  namespace: ${f.namespace || "monitoring"}
  labels:
    release: ${f.release || "prometheus"}
spec:
  selector:
    matchLabels:
      app: ${f.selector || "my-app"}
  namespaceSelector:
    matchNames:
    - ${f.targetNamespace || "default"}
  endpoints:
  - port: ${f.port || "http"}
    path: ${f.path || "/metrics"}
    interval: ${f.interval || "30s"}
    scrapeTimeout: ${f.scrapeTimeout || "10s"}`,

  Kustomization: (f) => {
    // NOTE: Kustomization does NOT have metadata.name — it is a kustomize config file, not a K8s resource
    const resources = (f.resources || "deployment.yaml,service.yaml").split(",").map(r => `- ${r.trim()}`).join("\n");
    const images = f.imageName ? `images:\n- name: ${f.imageName}\n  newTag: ${f.imageTag || "latest"}` : "";
    const patches = f.patchFile ? `patches:\n- path: ${f.patchFile}` : "";
    return `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: ${f.namespace || "default"}
resources:
${resources}${images ? "\n" + images : ""}${patches ? "\n" + patches : ""}${f.commonLabels ? `\ncommonLabels:\n  env: ${f.commonLabels}` : ""}`;
  },

  "ResourceQuota": (f) => `apiVersion: v1
kind: ResourceQuota
metadata:
  name: ${f.name || "my-quota"}
  namespace: ${f.namespace || "default"}
spec:
  hard:
    pods: "${f.maxPods || "20"}"
    requests.cpu: "${f.reqCpu || "4"}"
    requests.memory: "${f.reqMem || "4Gi"}"
    limits.cpu: "${f.limCpu || "8"}"
    limits.memory: "${f.limMem || "8Gi"}"
    services: "${f.maxServices || "10"}"
    persistentvolumeclaims: "${f.maxPVCs || "5"}"`,
};

// ───────────────────────────────────────────────────────────────────
// YAML VALIDATOR
// ───────────────────────────────────────────────────────────────────
export function validateYAML(yaml) {
  const issues = [];
  const lines = yaml.split("\n");

  if (!yaml.includes("apiVersion:")) issues.push({ type: "error", msg: "Missing apiVersion field" });
  if (!yaml.includes("kind:")) issues.push({ type: "error", msg: "Missing kind field" });
  if (!yaml.includes("metadata:")) issues.push({ type: "error", msg: "Missing metadata field" });

  lines.forEach((line, i) => {
    if (line.includes("\t")) issues.push({ type: "error", msg: `Line ${i + 1}: Tab character found — YAML requires spaces` });
    if (line.length > 0 && line.trimEnd() !== line) issues.push({ type: "warning", msg: `Line ${i + 1}: Trailing whitespace` });
  });

  if (yaml.match(/image:\s+\w+$/m)) issues.push({ type: "warning", msg: "Image without tag detected — pin to a specific version" });
  if (yaml.includes(": latest")) issues.push({ type: "warning", msg: "Using :latest tag — not recommended for production" });

  const kindMatch = yaml.match(/kind:\s+(\w+)/);
  const kind = kindMatch?.[1];
  if (kind === "Deployment" && !yaml.includes("resources:")) issues.push({ type: "warning", msg: "Deployment has no resource limits — add CPU/memory limits" });
  if (kind === "Deployment" && !yaml.includes("livenessProbe") && !yaml.includes("readinessProbe")) issues.push({ type: "info", msg: "No health probes — consider adding liveness/readiness probes" });

  if (issues.length === 0 || issues.every(i => i.type !== "error")) {
    issues.push({ type: "success", msg: `Valid ${kind || "YAML"} — no errors found` });
  }
  return issues;
}

// ───────────────────────────────────────────────────────────────────
// YAML SYNTAX HIGHLIGHTER
// ───────────────────────────────────────────────────────────────────
export function highlightYAML(yaml) {
  if (!yaml) return "";
  return yaml
    .split("\n")
    .map(line => {
      if (line.trim().startsWith("#"))
        return `<span style="color:#4b5563;font-style:italic">${line}</span>`;
      if (line.match(/^---/))
        return `<span style="color:#6366f1;font-weight:bold">${line}</span>`;

      return line
        .replace(/^(\s*)([\w-]+)(\s*:)/g, (_, sp, key, colon) => {
          const colors = { apiVersion: "#818cf8", kind: "#c084fc", metadata: "#818cf8", spec: "#818cf8", template: "#818cf8", containers: "#818cf8", name: "#7dd3fc", namespace: "#7dd3fc", image: "#34d399", replicas: "#fb923c", ports: "#7dd3fc", env: "#7dd3fc", resources: "#7dd3fc" };
          const color = colors[key] || "#93c5fd";
          return `${sp}<span style="color:${color}">${key}</span>${colon}`;
        })
        .replace(/:\s*(true|false)\s*$/g, (_, val) => `: <span style="color:#fb923c">${val}</span>`)
        .replace(/:\s*(\d+)\s*$/g, (_, val) => `: <span style="color:#4ade80">${val}</span>`)
        .replace(/:\s*"([^"]+)"\s*$/g, (_, val) => `: <span style="color:#fbbf24">"${val}"</span>`)
        .replace(/:\s*([a-zA-Z][a-zA-Z0-9.:/-]+)\s*$/g, (_, val) => `: <span style="color:#a5f3fc">${val}</span>`);
    })
    .join("\n");
}

// ───────────────────────────────────────────────────────────────────
// HELM CHART GENERATOR
// ───────────────────────────────────────────────────────────────────
export function generateHelmChart(bundle) {
  const name = bundle.name || "my-chart";
  const chartYaml = `apiVersion: v2
name: ${name}
description: A Helm chart generated by K8s YAML Generator
type: application
version: 0.1.0
appVersion: "1.0.0"`;

  const valuesYaml = `# Default values for ${name}
# Generated by K8s YAML Generator

replicaCount: 1
image:
  repository: nginx
  pullPolicy: Always
  tag: "latest"
service:
  type: ClusterIP
  port: 80
ingress:
  enabled: false
  className: traefik
  host: chart.domain.com
  tls: false
resources:
  limits:
    cpu: 500m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi`;

  return { chartYaml, valuesYaml };
}

// ───────────────────────────────────────────────────────────────────
// DEPENDENCY CHECKER — finds missing references in bundle
// ───────────────────────────────────────────────────────────────────
export function checkDependencies(bundle) {
  const warnings = [];
  const resourceNames = {};

  Object.entries(bundle).forEach(([type, form]) => {
    if (form.name) {
      if (!resourceNames[type]) resourceNames[type] = [];
      resourceNames[type].push(form.name);
    }
  });

  Object.entries(bundle).forEach(([type, form]) => {
    // Container-based resources reference ConfigMaps, Secrets, ServiceAccounts
    if (["Deployment", "Pod", "StatefulSet", "DaemonSet", "Job", "CronJob"].includes(type)) {
      if (form.cmRefs) {
        form.cmRefs.forEach(ref => {
          if (ref.cmName && !resourceNames["ConfigMap"]?.includes(ref.cmName))
            warnings.push({ resource: type, msg: `References ConfigMap "${ref.cmName}" — not found in bundle` });
        });
      }
      if (form.secretRefs) {
        form.secretRefs.forEach(ref => {
          if (ref.secretName && !resourceNames["Secret"]?.includes(ref.secretName))
            warnings.push({ resource: type, msg: `References Secret "${ref.secretName}" — not found in bundle` });
        });
      }
      if (form.serviceAccount && !resourceNames["ServiceAccount"]?.includes(form.serviceAccount))
        warnings.push({ resource: type, msg: `References ServiceAccount "${form.serviceAccount}" — not found in bundle` });
    }

    // Ingress references Service
    if (type === "Ingress") {
      if (form.service && !resourceNames["Service"]?.includes(form.service))
        warnings.push({ resource: type, msg: `References Service "${form.service}" — not found in bundle` });
      if (form.clusterIssuer && !resourceNames["ClusterIssuer"]?.includes(form.clusterIssuer))
        warnings.push({ resource: type, msg: `References ClusterIssuer "${form.clusterIssuer}" — not found in bundle` });
      if (form.rules) {
        form.rules.forEach(r => {
          if (r.service && !resourceNames["Service"]?.includes(r.service))
            warnings.push({ resource: type, msg: `Rule references Service "${r.service}" — not found in bundle` });
        });
      }
    }

    // HPA references Deployment
    if (type === "HPA") {
      if (form.target && !resourceNames["Deployment"]?.includes(form.target) && !resourceNames["StatefulSet"]?.includes(form.target))
        warnings.push({ resource: type, msg: `References target "${form.target}" — not found in bundle` });
    }

    // Service selector should match a Deployment/Pod
    if (type === "Service") {
      if (form.selector) {
        const hasMatch = resourceNames["Deployment"]?.includes(form.selector)
          || resourceNames["Pod"]?.includes(form.selector)
          || resourceNames["StatefulSet"]?.includes(form.selector);
        if (!hasMatch)
          warnings.push({ resource: type, msg: `Selector "${form.selector}" doesn't match any Deployment/Pod in bundle` });
      }
    }

    // PDB selector should match a Deployment
    if (type === "PodDisruptionBudget") {
      if (form.selector && !resourceNames["Deployment"]?.includes(form.selector) && !resourceNames["StatefulSet"]?.includes(form.selector))
        warnings.push({ resource: type, msg: `Selector "${form.selector}" doesn't match any Deployment/StatefulSet in bundle` });
    }
  });

  return warnings;
}

// ───────────────────────────────────────────────────────────────────
// YAML IMPORT HELPERS
// ───────────────────────────────────────────────────────────────────
export function detectKindFromParsed(parsedObj) {
  if (!parsedObj || typeof parsedObj !== "object" || !parsedObj.kind) return null;
  const kind = parsedObj.kind;
  const match = Object.keys(RESOURCE_META).find(
    k => k.toLowerCase().replace(/[\s&]/g, "") === kind.toLowerCase().replace(/[\s&]/g, "")
  );
  return match || null;
}

export function yamlToFormState(kind, parsedObj) {
  if (!parsedObj) return {};

  const f = {};
  f.name = parsedObj.metadata?.name || "";
  f.namespace = parsedObj.metadata?.namespace || "default";

  if (parsedObj.metadata?.labels) {
    f.labels = Object.entries(parsedObj.metadata.labels).map(([k, v]) => ({ k, v }));
  }
  if (parsedObj.metadata?.annotations) {
    f.annotations = Object.entries(parsedObj.metadata.annotations).map(([k, v]) => ({ k, v }));
  }

  const spec = parsedObj.spec || {};
  let podSpec = spec.template?.spec || {};
  let container = podSpec.containers?.[0] || {};

  switch (kind) {
    case "Deployment":
    case "StatefulSet":
    case "ReplicaSet":
      f.replicas = spec.replicas?.toString() || "1";
    // fallthrough
    case "DaemonSet":
    case "Job":
    case "CronJob":
    case "Pod":
      if (kind === "Pod") {
        podSpec = spec;
        container = podSpec.containers?.[0] || {};
      }
      if (kind === "CronJob") {
        f.schedule = spec.schedule || "";
        f.concurrency = spec.concurrencyPolicy || "Allow";
        const jobSpec = spec.jobTemplate?.spec || {};
        f.successJobs = jobSpec.completions?.toString() || "";
        f.failJobs = jobSpec.backoffLimit?.toString() || "";
        podSpec = jobSpec.template?.spec || {};
        container = podSpec.containers?.[0] || {};
      }
      if (kind === "Job") {
        f.successJobs = spec.completions?.toString() || "";
        f.failJobs = spec.backoffLimit?.toString() || "";
      }
      f.image = container.image || "";
      if (container.ports) {
        f.ports = container.ports.map(p => ({
          port: p.containerPort?.toString() || "",
          name: p.name || "",
          protocol: p.protocol || "TCP"
        }));
      }
      if (container.env) {
        f.envVars = container.env.map(e => ({ k: e.name, v: e.value || "" }));
      }
      f.pullPolicy = container.imagePullPolicy || "IfNotPresent";

      const res = container.resources || {};
      f.cpuReq = res.requests?.cpu || "";
      f.memReq = res.requests?.memory || "";
      f.cpuLim = res.limits?.cpu || "";
      f.memLim = res.limits?.memory || "";

      if (podSpec.nodeSelector) {
        f.nodeSelector = Object.entries(podSpec.nodeSelector).map(([k, v]) => ({ k, v }));
      }
      if (podSpec.tolerations) {
        f.tolerations = podSpec.tolerations.map(t => ({
          key: t.key || "",
          operator: t.operator || "Equal",
          value: t.value || "",
          effect: t.effect || ""
        }));
      }

      if (container.livenessProbe) {
        f.enableProbe = true;
        f.probePath = container.livenessProbe.httpGet?.path || "/";
      }

      f.serviceAccount = podSpec.serviceAccountName || "";
      if (podSpec.securityContext) {
        if (podSpec.securityContext.runAsNonRoot) f.runAsNonRoot = true;
      }
      break;

    case "Service":
      f.serviceType = spec.type || "ClusterIP";
      if (spec.ports?.[0]) {
        f.port = spec.ports[0].port?.toString() || "80";
        f.targetPort = spec.ports[0].targetPort?.toString() || "80";
        f.nodePort = spec.ports[0].nodePort?.toString() || "";
      }
      if (spec.selector) {
        f.selectorKey = Object.keys(spec.selector)[0] || "app";
        f.selectorVal = Object.values(spec.selector)[0] || "";
      }
      break;

    case "Ingress":
      f.ingressClass = spec.ingressClassName || "";
      const rule = spec.rules?.[0] || {};
      f.host = rule.host || "";
      const path = rule.http?.paths?.[0] || {};
      f.path = path.path || "/";
      f.service = path.backend?.service?.name || "";
      f.port = path.backend?.service?.port?.number?.toString() || "80";
      if (spec.tls) {
        f.tls = true;
        f.certSecret = spec.tls[0]?.secretName || "";
      }
      break;

    case "ConfigMap":
    case "Secret":
      const dataObj = parsedObj.data || parsedObj.stringData || {};
      f.data = Object.entries(dataObj).map(([k, v]) => ({ k, v }));
      break;

    case "ServiceAccount":
      f.automountToken = parsedObj.automountServiceAccountToken !== false;
      break;

    case "PersistentVolumeClaim":
      f.storageClass = spec.storageClassName || "";
      f.size = spec.resources?.requests?.storage || "1Gi";
      f.accessMode = spec.accessModes?.[0] || "ReadWriteOnce";
      break;

    case "HPA":
      f.target = spec.scaleTargetRef?.name || "";
      f.minReplicas = spec.minReplicas?.toString() || "1";
      f.maxReplicas = spec.maxReplicas?.toString() || "10";
      f.cpuTarget = spec.metrics?.[0]?.resource?.target?.averageUtilization?.toString() || "80";
      break;
  }

  return f;
}

// ───────────────────────────────────────────────────────────────────
// RESOURCE META (icon, color, category)
// ───────────────────────────────────────────────────────────────────
export const RESOURCE_META = {
  // ── Beginner ──
  Pod: { icon: "🟢", color: "#4ade80", cat: "Beginner", desc: "Single container instance — start here" },
  Deployment: { icon: "🚀", color: "#6366f1", cat: "Workloads", desc: "Run stateless app replicas" },
  Service: { icon: "🔌", color: "#10b981", cat: "Beginner", desc: "Expose pods via network" },
  ConfigMap: { icon: "⚙️", color: "#8b5cf6", cat: "Beginner", desc: "Store non-sensitive configuration" },
  // ── Workloads ──
  StatefulSet: { icon: "🗄️", color: "#06b6d4", cat: "Workloads", desc: "Databases with persistent storage" },
  DaemonSet: { icon: "👾", color: "#22d3ee", cat: "Workloads", desc: "Run one pod per node (agents, log shippers)" },
  HPA: { icon: "📈", color: "#ec4899", cat: "Workloads", desc: "Auto-scale pods on metrics" },
  VPA: { icon: "📊", color: "#d946ef", cat: "Workloads", desc: "Auto right-size container resources" },
  CronJob: { icon: "⏰", color: "#a78bfa", cat: "Workloads", desc: "Scheduled recurring tasks" },
  Job: { icon: "🏃", color: "#34d399", cat: "Workloads", desc: "One-time task to completion" },
  // ── Networking ──
  Ingress: { icon: "🌐", color: "#f59e0b", cat: "Networking", desc: "HTTP/S routing with domain support" },
  NetworkPolicy: { icon: "🛡️", color: "#f43f5e", cat: "Networking", desc: "Control pod-to-pod traffic" },
  // ── Config ──
  Secret: { icon: "🔐", color: "#ef4444", cat: "Config", desc: "Store sensitive data securely" },
  // ── Storage ──
  PersistentVolumeClaim: { icon: "💾", color: "#f97316", cat: "Storage", desc: "Request persistent storage" },
  PersistentVolume: { icon: "🗃️", color: "#fb923c", cat: "Storage", desc: "Admin-provisioned storage volume" },
  StorageClass: { icon: "📦", color: "#fdba74", cat: "Storage", desc: "Define storage provisioner & policy" },
  // ── Security ──
  ServiceAccount: { icon: "👤", color: "#84cc16", cat: "Security", desc: "Pod identity for RBAC" },
  ClusterIssuer: { icon: "🔑", color: "#fbbf24", cat: "Security", desc: "Auto SSL certificates via cert-manager" },
  "Role & RoleBinding": { icon: "🎭", color: "#c084fc", cat: "Security", desc: "Namespace-scoped permissions" },
  "ClusterRole & Binding": { icon: "🌍", color: "#fb923c", cat: "Security", desc: "Cluster-wide permissions" },
  // ── Cluster ──
  Namespace: { icon: "📁", color: "#64748b", cat: "Cluster", desc: "Logical cluster isolation" },
  PodDisruptionBudget: { icon: "⚖️", color: "#38bdf8", cat: "Cluster", desc: "Maintain availability during disruptions" },
  LimitRange: { icon: "📏", color: "#a3e635", cat: "Cluster", desc: "Default resource limits per namespace" },
  ResourceQuota: { icon: "🏷️", color: "#67e8f9", cat: "Cluster", desc: "Total resource limits per namespace" },
  // ── GitOps ──
  "ArgoCD App": { icon: "🔄", color: "#818cf8", cat: "GitOps", desc: "GitOps continuous deployment" },
  Kustomization: { icon: "🧩", color: "#7dd3fc", cat: "GitOps", desc: "Kustomize overlay configuration" },
  // ── Observability ──
  ServiceMonitor: { icon: "📡", color: "#e879f9", cat: "Observability", desc: "Prometheus ServiceMonitor CRD" },
};

export const CATEGORIES = ["Beginner", "Workloads", "Networking", "Config", "Storage", "Security", "Cluster", "GitOps", "Observability"];

// ───────────────────────────────────────────────────────────────────
// ENVIRONMENT PRESETS — apply environment-specific defaults
// ───────────────────────────────────────────────────────────────────
export const ENV_PRESETS = {
  dev: {
    label: "Development", color: "#4ade80", icon: "🔧",
    overrides: { replicas: "1", pullPolicy: "Always", cpuReq: "", cpuLim: "", memReq: "", memLim: "", tls: false, enableProbe: false },
  },
  staging: {
    label: "Staging", color: "#fbbf24", icon: "🧪",
    overrides: { replicas: "2", pullPolicy: "IfNotPresent", cpuReq: "100m", cpuLim: "500m", memReq: "128Mi", memLim: "256Mi", tls: true },
  },
  prod: {
    label: "Production", color: "#f87171", icon: "🚨",
    overrides: { replicas: "3", pullPolicy: "IfNotPresent", cpuReq: "250m", cpuLim: "1", memReq: "256Mi", memLim: "512Mi", tls: true, enableProbe: true },
  },
};

// ───────────────────────────────────────────────────────────────────
// PRODUCTION CHECKLIST — validate a form before download
// ───────────────────────────────────────────────────────────────────
export function productionChecklist(type, form) {
  const checks = [];

  // ── Container-based resources ──
  if (["Deployment", "Pod", "StatefulSet", "DaemonSet", "Job", "CronJob"].includes(type)) {
    checks.push({ ok: !!(form.cpuLim && form.memLim), label: "Resource limits set", fix: { cpuLim: "500m", memLim: "256Mi" } });
    checks.push({ ok: !!(form.image && form.image.includes(":") && !form.image.endsWith(":latest")), label: "Image pinned to version", fix: {} });
    checks.push({ ok: !!form.enableProbe, label: "Health probes configured", fix: { enableProbe: true, probePath: "/" } });
    checks.push({ ok: form.runAsRoot !== "true" && form.runAsUser !== "0", label: "Not running as root", fix: {} });
  }

  if (type === "Deployment") {
    checks.push({ ok: form.replicas > 1 || parseInt(form.replicas) > 1, label: "Multiple replicas for HA", fix: { replicas: "2" } });
  }

  if (type === "Ingress") {
    checks.push({ ok: !!(form.tls === true || form.tls === "true"), label: "TLS/HTTPS enabled", fix: { tls: true } });
  }

  if (type === "Service") {
    checks.push({ ok: !!form.selector, label: "Selector defined", fix: {} });
    checks.push({ ok: form.ports?.length > 0, label: "Ports configured", fix: {} });
  }

  if (type === "HPA") {
    checks.push({ ok: !!form.target, label: "Target deployment set", fix: {} });
    checks.push({ ok: form.minReplicas && form.maxReplicas, label: "Min/max replicas set", fix: {} });
    checks.push({ ok: form.cpuTarget || form.memTarget, label: "Scaling metric defined", fix: { cpuTarget: "70" } });
  }

  if (type === "Secret") {
    checks.push({ ok: form.data?.length > 0, label: "Has data entries", fix: {} });
  }

  if (type === "ConfigMap") {
    checks.push({ ok: form.data?.length > 0, label: "Has data entries", fix: {} });
  }

  if (type === "PersistentVolumeClaim") {
    checks.push({ ok: !!(form.size || form.storage), label: "Storage size set", fix: { size: "10Gi" } });
    checks.push({ ok: !!form.storageClass, label: "Storage class set", fix: { storageClass: "standard" } });
  }

  if (type === "CronJob") {
    checks.push({ ok: !!form.schedule, label: "Schedule defined", fix: {} });
    checks.push({ ok: !!(form.image), label: "Container image set", fix: {} });
  }

  if (type === "ServiceAccount") {
    checks.push({ ok: form.automount !== "true", label: "Token auto-mount disabled", fix: { automount: "false" } });
  }

  if (type === "PodDisruptionBudget") {
    checks.push({ ok: !!form.selector, label: "Selector defined", fix: {} });
    checks.push({ ok: !!(form.minAvailable || form.maxUnavailable), label: "Availability target set", fix: { minAvailable: "1" } });
  }

  return checks;
}

// ───────────────────────────────────────────────────────────────────
// THEME TOKENS
// ───────────────────────────────────────────────────────────────────
export const getTheme = (dark) => ({
  bg: 'var(--bg-app)',
  bgCard: 'var(--bg-card)',
  bgInput: 'var(--bg-panel)',
  bgHover: 'var(--bg-panel)',
  border: 'var(--border-subtle)',
  borderFocus: 'var(--color-primary)',
  text: 'var(--text-primary)',
  textMuted: 'var(--text-secondary)',
  textDim: 'var(--text-muted)',
  accent: 'var(--color-primary)',
  accentSoft: 'var(--color-primary-dark)',
  success: 'var(--color-emerald)',
  warning: 'var(--color-amber)',
  error: 'var(--color-rose)',
  info: 'var(--color-cyan)',
  isDark: dark,
  yamlBg: dark ? '#050510' : '#f8fafc', 
  yamlText: dark ? '#a3be8c' : '#334155',
  navBg: 'var(--bg-panel)',
  shadow: 'var(--shadow-md)',
});
