// ═══════════════════════════════════════════════════════════════════
// K8S ULTIMATE GENERATOR — Part 3: forms.jsx
// Dynamic forms for every resource type
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from "react";
import {
  Input, Select, Toggle, KVList, PortsList, VolumeList,
  InitContainerList, IngressRulesList, Section, FieldGroup, Label,
  ImageBanner, SmartNameSuggestions, SecurityBadge, LintPanel,
  LinkedResourceBtn, EnvRefList, TolerationList
} from "./components.jsx";
import { lintResource, detectImage, productionChecklist, smartName } from "./generators.js";

// ───────────────────────────────────────────────────────────────────
// DEPLOYMENT FORM
// ───────────────────────────────────────────────────────────────────
function DeploymentForm({ form, update, bundle, onCreateLinked, theme }) {
  const hints = lintResource("Deployment", form);
  const names = smartName(form.name);

  // Inline validation helpers
  const nameError = form.name && !/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(form.name)
    ? "Must be lowercase alphanumeric or dashes only"
    : null;
  const imageError = form.image && !form.image.includes(":")
    ? "Add a version tag (e.g. nginx:1.25)"
    : null;
  const imageWarn = form.image && form.image.endsWith(":latest")
    ? "Using :latest — pin to a specific version for production"
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <SecurityBadge type="Deployment" form={form} theme={theme} />
      <LintPanel hints={hints} theme={theme} />

      <Section title="Core Configuration" theme={theme}>
        <FieldGroup label="App Name" required hint="Used as label selector across all resources" theme={theme}>
          <Input value={form.name} onChange={v => update("name", v)} placeholder="my-app" theme={theme} error={nameError} valid={form.name && !nameError} />
        </FieldGroup>
        <FieldGroup label="Namespace" hint="Kubernetes namespace (default: 'default')" theme={theme}>
          <Input value={form.namespace} onChange={v => update("namespace", v)} placeholder="default" theme={theme} />
        </FieldGroup>
        <FieldGroup label="Image" required hint="Container image with tag e.g. nginx:1.25" theme={theme}>
          <Input value={form.image} onChange={v => update("image", v)} placeholder="nginx:latest" theme={theme} error={imageError} valid={form.image && form.image.includes(":") && !imageWarn} />
          {imageWarn && !imageError && (
            <div style={{ marginTop: 4, padding: '6px 10px', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)', borderRadius: 6, color: 'var(--color-amber, #f59e0b)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              ⚠️ {imageWarn}
            </div>
          )}
          <div style={{ marginTop: 6 }}>
            <ImageBanner image={form.image} theme={theme} onApply={(detected) => {
              if (detected.port) update("ports", [{ port: detected.port, name: "http", protocol: "TCP" }]);
              if (detected.envVars?.length) update("envVars", detected.envVars);
              if (detected.cpuReq) update("cpuReq", detected.cpuReq);
              if (detected.cpuLim) update("cpuLim", detected.cpuLim);
              if (detected.memReq) update("memReq", detected.memReq);
              if (detected.memLim) update("memLim", detected.memLim);
            }} />
          </div>
        </FieldGroup>
        <FieldGroup label="Version Tag" hint="Used as label for canary/blue-green deployments" theme={theme}>
          <Input value={form.version} onChange={v => update("version", v)} placeholder="v1" theme={theme} />
        </FieldGroup>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <FieldGroup label="Replicas" hint="Number of pod copies to run" theme={theme}>
            <Input value={form.replicas} onChange={v => update("replicas", v)} placeholder="1" theme={theme} type="number" />
          </FieldGroup>
          <FieldGroup label="Pull Policy" hint="When to pull the image" theme={theme}>
            <Select value={form.pullPolicy} onChange={v => update("pullPolicy", v)} options={["Always", "IfNotPresent", "Never"]} theme={theme} placeholder="Always" />
          </FieldGroup>
        </div>
        <FieldGroup label="Update Strategy" theme={theme}>
          <Select value={form.strategy} onChange={v => update("strategy", v)} options={["RollingUpdate", "Recreate"]} theme={theme} placeholder="RollingUpdate" />
        </FieldGroup>
      </Section>

      <Section title="Ports" theme={theme}>
        <PortsList value={form.ports} onChange={v => update("ports", v)} theme={theme} />
      </Section>

      <Section title="Environment Configuration" theme={theme} defaultOpen={false} onRemove={() => { update("envVars", []); update("secretRefs", []); update("cmRefs", []); }}>
        <Label theme={theme}>Direct Key-Value Pairs</Label>
        <div style={{ marginBottom: 16 }}>
          <KVList value={form.envVars} onChange={v => update("envVars", v)} keyPlaceholder="KEY" valPlaceholder="value" addLabel="+ Add Env Var" theme={theme} />
        </div>
        
        <Label theme={theme}>Inject from Secrets</Label>
        <div style={{ marginBottom: 16 }}>
          <EnvRefList value={form.secretRefs} onChange={v => update("secretRefs", v)} refType="Secret" bundleNames={Object.entries(bundle).filter(([t]) => t === "Secret").map(([, f]) => f.name).filter(Boolean)} bundle={bundle} theme={theme} />
        </div>

        <Label theme={theme}>Inject from ConfigMaps</Label>
        <EnvRefList value={form.cmRefs} onChange={v => update("cmRefs", v)} refType="ConfigMap" bundleNames={Object.entries(bundle).filter(([t]) => t === "ConfigMap").map(([, f]) => f.name).filter(Boolean)} bundle={bundle} theme={theme} />
      </Section>

      <Section title="Resources (CPU / Memory)" theme={theme} defaultOpen={false} onRemove={() => { update("cpuReq", ""); update("cpuLim", ""); update("memReq", ""); update("memLim", ""); }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <FieldGroup label="CPU Request" hint="Guaranteed CPU e.g. 100m = 0.1 core" theme={theme}>
            <Input value={form.cpuReq} onChange={v => update("cpuReq", v)} placeholder="100m" theme={theme} />
          </FieldGroup>
          <FieldGroup label="CPU Limit" hint="Max CPU allowed" theme={theme}>
            <Input value={form.cpuLim} onChange={v => update("cpuLim", v)} placeholder="500m" theme={theme} />
          </FieldGroup>
          <FieldGroup label="Memory Request" hint="Guaranteed memory e.g. 128Mi" theme={theme}>
            <Input value={form.memReq} onChange={v => update("memReq", v)} placeholder="128Mi" theme={theme} />
          </FieldGroup>
          <FieldGroup label="Memory Limit" hint="Max memory allowed" theme={theme}>
            <Input value={form.memLim} onChange={v => update("memLim", v)} placeholder="256Mi" theme={theme} />
          </FieldGroup>
        </div>
      </Section>

      <Section title="Health Probes" theme={theme} defaultOpen={false} onRemove={() => { update("enableProbe", false); update("probePath", ""); update("probeDelay", ""); }}>
        <FieldGroup label="Enable Probes" theme={theme}>
          <Toggle value={form.enableProbe} onChange={v => update("enableProbe", v)} label theme={theme} />
        </FieldGroup>
        {form.enableProbe && <>
          <FieldGroup label="Health Check Path" theme={theme}>
            <Input value={form.probePath} onChange={v => update("probePath", v)} placeholder="/health" theme={theme} />
          </FieldGroup>
          <FieldGroup label="Initial Delay (seconds)" theme={theme}>
            <Input value={form.probeDelay} onChange={v => update("probeDelay", v)} placeholder="15" theme={theme} type="number" />
          </FieldGroup>
        </>}
      </Section>

      <Section title="Volumes" theme={theme} defaultOpen={false} onRemove={() => update("volumeMounts", [])}>
        <VolumeList value={form.volumeMounts} onChange={v => update("volumeMounts", v)} theme={theme} />
      </Section>

      <Section title="Init Containers" theme={theme} defaultOpen={false} onRemove={() => update("initContainers", [])}>
        <InitContainerList value={form.initContainers || []} onChange={v => update("initContainers", v)} theme={theme} />
      </Section>

      <Section title="Security & Identity" theme={theme} defaultOpen={false} onRemove={() => { update("serviceAccount", ""); update("imagePullSecret", ""); update("runAsUser", ""); update("readOnlyRoot", false); update("runAsNonRoot", false); }}>
        <FieldGroup label="Service Account" theme={theme}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Input value={form.serviceAccount} onChange={v => update("serviceAccount", v)} placeholder="default" theme={theme} />
            <LinkedResourceBtn refType="ServiceAccount" bundleNames={Object.entries(bundle).filter(([t]) => t === "ServiceAccount").map(([, f]) => f.name).filter(Boolean)} onCreateLinked={(_, create) => { if (create) onCreateLinked("ServiceAccount"); }} theme={theme} />
          </div>
        </FieldGroup>
        <FieldGroup label="Image Pull Secret" theme={theme}>
          <Input value={form.imagePullSecret} onChange={v => update("imagePullSecret", v)} placeholder="regcred" theme={theme} />
        </FieldGroup>
        <FieldGroup label="Run as User (UID)" theme={theme}>
          <Input value={form.runAsUser} onChange={v => update("runAsUser", v)} placeholder="1000" theme={theme} type="number" />
        </FieldGroup>
        <FieldGroup label="Read-only Root Filesystem" theme={theme}>
          <Toggle value={form.readOnlyRoot} onChange={v => update("readOnlyRoot", v)} label theme={theme} />
        </FieldGroup>
      </Section>

      <Section title="Scheduling" theme={theme} defaultOpen={false} onRemove={() => { update("nodeSelector", []); update("tolerations", []); }}>
        <FieldGroup label="Node Selector" hint="Key-value pairs to schedule pods on specific nodes" theme={theme}>
          <KVList value={form.nodeSelector} onChange={v => update("nodeSelector", v)} keyPlaceholder="disktype" valPlaceholder="ssd" addLabel="+ Add Node Selector" theme={theme} />
        </FieldGroup>
        <FieldGroup label="Tolerations" hint="Allow pods to schedule on tainted nodes" theme={theme}>
          <TolerationList value={form.tolerations} onChange={v => update("tolerations", v)} theme={theme} />
        </FieldGroup>
      </Section>

      <Section title="Labels & Annotations" theme={theme} defaultOpen={false} onRemove={() => { update("labels", []); update("annotations", []); }}>
        <FieldGroup label="Extra Labels" theme={theme}>
          <KVList value={form.labels} onChange={v => update("labels", v)} keyPlaceholder="key" valPlaceholder="value" addLabel="+ Add Label" theme={theme} />
        </FieldGroup>
        <FieldGroup label="Annotations" theme={theme}>
          <KVList value={form.annotations} onChange={v => update("annotations", v)} keyPlaceholder="annotation" valPlaceholder="value" addLabel="+ Add Annotation" theme={theme} />
        </FieldGroup>
      </Section>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// POD FORM — beginner-friendly
// ───────────────────────────────────────────────────────────────────
function PodForm({ form, update, bundle, onCreateLinked, theme }) {
  const hints = lintResource("Deployment", form);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div style={{ background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
        <span style={{ color: "#60a5fa", fontSize: 11.5 }}>🟢 <strong>Pod</strong> is the smallest unit in Kubernetes. It runs one or more containers. Use a <strong>Deployment</strong> for production — Pods alone don't restart if they crash.</span>
      </div>
      <LintPanel hints={hints} theme={theme} />
      <Section title="Basic Info" theme={theme}>
        <FieldGroup label="Pod Name" required hint="Must be unique in the namespace. Lowercase letters, numbers, dashes only." theme={theme}>
          <Input value={form.name} onChange={v => update("name", v)} placeholder="my-pod" theme={theme} />
        </FieldGroup>
        <FieldGroup label="Namespace" hint="Leave as 'default' to start" theme={theme}>
          <Input value={form.namespace} onChange={v => update("namespace", v)} placeholder="default" theme={theme} />
        </FieldGroup>
        <FieldGroup label="Container Image" required hint="e.g. nginx:1.25, python:3.11-slim. Always include a version tag!" theme={theme}>
          <Input value={form.image} onChange={v => update("image", v)} placeholder="nginx:1.25" theme={theme} />
          <div style={{ marginTop: 6 }}>
            <ImageBanner image={form.image} theme={theme} onApply={(d) => {
              if (d.port) update("ports", [{ port: d.port, name: "http", protocol: "TCP" }]);
              if (d.envVars?.length) update("envVars", d.envVars);
            }} />
          </div>
        </FieldGroup>
        <FieldGroup label="Restart Policy" hint="Always=restart on any exit, OnFailure=only on error, Never=no restart" theme={theme}>
          <Select value={form.restartPolicy} onChange={v => update("restartPolicy", v)} options={["Always", "OnFailure", "Never"]} theme={theme} placeholder="Always" />
        </FieldGroup>
      </Section>
      <Section title="Ports" theme={theme}>
        <PortsList value={form.ports} onChange={v => update("ports", v)} theme={theme} />
      </Section>
      <Section title="Environment Variables" theme={theme} defaultOpen={false} onRemove={() => update("envVars", [])}>
        <KVList value={form.envVars} onChange={v => update("envVars", v)} keyPlaceholder="KEY" valPlaceholder="value" addLabel="+ Add Env Var" theme={theme} />
      </Section>
      <Section title="Environment Variables (Ref)" theme={theme} defaultOpen={false} onRemove={() => { update("secretRefs", []); update("cmRefs", []); }}>
        <EnvRefList value={form.secretRefs} onChange={v => update("secretRefs", v)} refType="Secret" bundleNames={Object.entries(bundle).filter(([t]) => t === "Secret").map(([, f]) => f.name).filter(Boolean)} bundle={bundle} theme={theme} />
        <div style={{ height: 16 }} />
        <EnvRefList value={form.cmRefs} onChange={v => update("cmRefs", v)} refType="ConfigMap" bundleNames={Object.entries(bundle).filter(([t]) => t === "ConfigMap").map(([, f]) => f.name).filter(Boolean)} bundle={bundle} theme={theme} />
      </Section>
      <Section title="Resources (CPU / Memory)" theme={theme} defaultOpen={false} onRemove={() => { update("cpuReq", ""); update("cpuLim", ""); update("memReq", ""); update("memLim", ""); }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <FieldGroup label="CPU Request" hint="Guaranteed CPU. 100m = 0.1 core" theme={theme}><Input value={form.cpuReq} onChange={v => update("cpuReq", v)} placeholder="100m" theme={theme} /></FieldGroup>
          <FieldGroup label="CPU Limit" hint="Maximum CPU" theme={theme}><Input value={form.cpuLim} onChange={v => update("cpuLim", v)} placeholder="500m" theme={theme} /></FieldGroup>
          <FieldGroup label="Memory Request" hint="e.g. 128Mi, 1Gi" theme={theme}><Input value={form.memReq} onChange={v => update("memReq", v)} placeholder="128Mi" theme={theme} /></FieldGroup>
          <FieldGroup label="Memory Limit" theme={theme}><Input value={form.memLim} onChange={v => update("memLim", v)} placeholder="256Mi" theme={theme} /></FieldGroup>
        </div>
      </Section>
      <Section title="Scheduling" theme={theme} defaultOpen={false} onRemove={() => { update("nodeSelector", []); update("tolerations", []); }}>
        <FieldGroup label="Node Selector" hint="Key-value pairs to schedule pods on specific nodes" theme={theme}>
          <KVList value={form.nodeSelector} onChange={v => update("nodeSelector", v)} keyPlaceholder="disktype" valPlaceholder="ssd" addLabel="+ Add Node Selector" theme={theme} />
        </FieldGroup>
        <FieldGroup label="Tolerations" hint="Allow pods to schedule on tainted nodes" theme={theme}>
          <TolerationList value={form.tolerations} onChange={v => update("tolerations", v)} theme={theme} />
        </FieldGroup>
      </Section>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// DAEMONSET FORM
// ───────────────────────────────────────────────────────────────────
function DaemonSetForm({ form, update, bundle, onCreateLinked, theme }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div style={{ background: "#0f172a", border: "1px solid #164e63", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
        <span style={{ color: "#22d3ee", fontSize: 11.5 }}>👾 <strong>DaemonSet</strong> runs one pod on <em>every</em> node. Used for log collectors (Fluentd), monitoring agents (Prometheus node-exporter), and network plugins.</span>
      </div>
      <LintPanel hints={lintResource("Deployment", form)} theme={theme} />
      <Section title="Basic Info" theme={theme}>
        <FieldGroup label="Name" required theme={theme}>
          <Input value={form.name} onChange={v => update("name", v)} placeholder="log-collector" theme={theme} />
        </FieldGroup>
        <FieldGroup label="Namespace" theme={theme}>
          <Input value={form.namespace} onChange={v => update("namespace", v)} placeholder="kube-system" theme={theme} />
        </FieldGroup>
        <FieldGroup label="Container Image" required theme={theme}>
          <Input value={form.image} onChange={v => update("image", v)} placeholder="fluent/fluentd:v1.16" theme={theme} />
          <div style={{ marginTop: 6 }}>
            <ImageBanner image={form.image} theme={theme} onApply={(d) => {
              if (d.port) update("ports", [{ port: d.port, name: "http", protocol: "TCP" }]);
              if (d.envVars?.length) update("envVars", d.envVars);
            }} />
          </div>
        </FieldGroup>
        <FieldGroup label="Tolerate All Taints" hint="Allow scheduling on master/tainted nodes (common for system agents)" theme={theme}>
          <Toggle value={form.tolerateAll} onChange={v => update("tolerateAll", v)} label theme={theme} />
        </FieldGroup>
      </Section>
      <Section title="Ports" theme={theme}>
        <PortsList value={form.ports} onChange={v => update("ports", v)} theme={theme} />
      </Section>
      <Section title="Environment Variables" theme={theme} defaultOpen={false} onRemove={() => update("envVars", [])}>
        <KVList value={form.envVars} onChange={v => update("envVars", v)} keyPlaceholder="KEY" valPlaceholder="value" addLabel="+ Add Env Var" theme={theme} />
      </Section>
      <Section title="Environment Variables (Ref)" theme={theme} defaultOpen={false} onRemove={() => { update("secretRefs", []); update("cmRefs", []); }}>
        <EnvRefList value={form.secretRefs} onChange={v => update("secretRefs", v)} refType="Secret" bundleNames={Object.entries(bundle).filter(([t]) => t === "Secret").map(([, f]) => f.name).filter(Boolean)} bundle={bundle} theme={theme} />
        <div style={{ height: 16 }} />
        <EnvRefList value={form.cmRefs} onChange={v => update("cmRefs", v)} refType="ConfigMap" bundleNames={Object.entries(bundle).filter(([t]) => t === "ConfigMap").map(([, f]) => f.name).filter(Boolean)} bundle={bundle} theme={theme} />
      </Section>
      <Section title="Resources" theme={theme} defaultOpen={false} onRemove={() => { update("cpuReq", ""); update("cpuLim", ""); update("memReq", ""); update("memLim", ""); }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <FieldGroup label="CPU Request" theme={theme}><Input value={form.cpuReq} onChange={v => update("cpuReq", v)} placeholder="100m" theme={theme} /></FieldGroup>
          <FieldGroup label="CPU Limit" theme={theme}><Input value={form.cpuLim} onChange={v => update("cpuLim", v)} placeholder="200m" theme={theme} /></FieldGroup>
          <FieldGroup label="Memory Request" theme={theme}><Input value={form.memReq} onChange={v => update("memReq", v)} placeholder="128Mi" theme={theme} /></FieldGroup>
          <FieldGroup label="Memory Limit" theme={theme}><Input value={form.memLim} onChange={v => update("memLim", v)} placeholder="256Mi" theme={theme} /></FieldGroup>
        </div>
      </Section>
      <Section title="Volume Mounts" theme={theme} defaultOpen={false} onRemove={() => update("volumeMounts", [])}>
        <VolumeList value={form.volumeMounts} onChange={v => update("volumeMounts", v)} theme={theme} />
      </Section>
      <Section title="Scheduling" theme={theme} defaultOpen={false} onRemove={() => { update("nodeSelector", []); update("tolerations", []); }}>
        <FieldGroup label="Node Selector" hint="Key-value pairs to schedule pods on specific nodes" theme={theme}>
          <KVList value={form.nodeSelector} onChange={v => update("nodeSelector", v)} keyPlaceholder="disktype" valPlaceholder="ssd" addLabel="+ Add Node Selector" theme={theme} />
        </FieldGroup>
        <FieldGroup label="Tolerations" hint="Allow pods to schedule on tainted nodes" theme={theme}>
          <TolerationList value={form.tolerations} onChange={v => update("tolerations", v)} theme={theme} />
        </FieldGroup>
      </Section>
    </div>
  );
}


// ───────────────────────────────────────────────────────────────────
function ServiceForm({ form, update, bundle, theme }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <LintPanel hints={lintResource("Service", form)} theme={theme} />
      <Section title="Basic Info" theme={theme}>
        <FieldGroup label="Service Name" required theme={theme}>
          <Input value={form.name} onChange={v => update("name", v)} placeholder="my-service" theme={theme} />
          <SmartNameSuggestions appName={Object.values(bundle).find(f => f.name)?.name} currentType="Service" onPick={n => update("name", n)} theme={theme} />
        </FieldGroup>
        <FieldGroup label="Namespace" theme={theme}>
          <Input value={form.namespace} onChange={v => update("namespace", v)} placeholder="default" theme={theme} />
        </FieldGroup>
        <FieldGroup label="Pod Selector (app=?)" required hint="Must match the Deployment's app label" theme={theme}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Input value={form.selector} onChange={v => update("selector", v)} placeholder="my-app" theme={theme} />
            {Object.entries(bundle).filter(([t]) => t === "Deployment").map(([, f]) => f.name).filter(Boolean).length > 0 && (
              <button onClick={() => update("selector", Object.entries(bundle).find(([t]) => t === "Deployment")?.[1]?.name || "")}
                style={{ background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: "pointer", fontSize: 10, padding: "4px 8px", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>
                Use Deployment
              </button>
            )}
          </div>
        </FieldGroup>
        <FieldGroup label="Service Type" hint="ClusterIP=internal, NodePort=node access, LoadBalancer=cloud LB" theme={theme}>
          <Select value={form.serviceType} onChange={v => update("serviceType", v)} options={["ClusterIP", "NodePort", "LoadBalancer", "ExternalName"]} theme={theme} placeholder="ClusterIP" />
        </FieldGroup>
        {form.serviceType === "LoadBalancer" && (
          <FieldGroup label="Load Balancer IP (optional)" theme={theme}>
            <Input value={form.loadBalancerIP} onChange={v => update("loadBalancerIP", v)} placeholder="1.2.3.4" theme={theme} />
          </FieldGroup>
        )}
      </Section>
      <Section title="Ports" theme={theme}>
        <PortsList value={form.ports} onChange={v => update("ports", v)} theme={theme} />
      </Section>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// INGRESS FORM
// ───────────────────────────────────────────────────────────────────
function IngressForm({ form, update, bundle, onCreateLinked, theme }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <LintPanel hints={lintResource("Ingress", form)} theme={theme} />
      <Section title="Basic Info" theme={theme}>
        <FieldGroup label="Ingress Name" required theme={theme}>
          <Input value={form.name} onChange={v => update("name", v)} placeholder="my-ingress" theme={theme} />
        </FieldGroup>
        <FieldGroup label="Namespace" theme={theme}>
          <Input value={form.namespace} onChange={v => update("namespace", v)} placeholder="default" theme={theme} />
        </FieldGroup>
        <FieldGroup label="Ingress Class" hint="traefik (k3s default), nginx, haproxy" theme={theme}>
          <Select value={form.ingressClass} onChange={v => update("ingressClass", v)} options={["traefik", "nginx", "haproxy", "istio"]} theme={theme} placeholder="traefik" />
        </FieldGroup>
      </Section>
      <Section title="Rules (Hosts & Paths)" theme={theme}>
        <IngressRulesList value={form.rules} onChange={v => update("rules", v)} theme={theme} />
      </Section>
      <Section title="TLS / HTTPS" theme={theme} defaultOpen={false} onRemove={() => { update("tls", false); update("clusterIssuer", ""); }}>
        <FieldGroup label="Enable TLS" theme={theme}>
          <Toggle value={form.tls} onChange={v => update("tls", v)} label theme={theme} />
        </FieldGroup>
        {(form.tls === true || form.tls === "true") && <>
          <FieldGroup label="ClusterIssuer Name" hint="The cert-manager ClusterIssuer to use" theme={theme}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Input value={form.clusterIssuer} onChange={v => update("clusterIssuer", v)} placeholder="letsencrypt-prod" theme={theme} />
              <LinkedResourceBtn refType="ClusterIssuer" bundleNames={Object.entries(bundle).filter(([t]) => t === "ClusterIssuer").map(([, f]) => f.name).filter(Boolean)} onCreateLinked={(_, create) => { if (create) onCreateLinked("ClusterIssuer"); }} theme={theme} />
            </div>
          </FieldGroup>
        </>}
      </Section>
      <Section title="Advanced Annotations" theme={theme} defaultOpen={false} onRemove={() => { update("rateLimitRPS", ""); update("proxyBodySize", ""); update("corsEnabled", false); update("annotations", []); }}>
        <FieldGroup label="Rate Limit (req/sec)" theme={theme}>
          <Input value={form.rateLimitRPS} onChange={v => update("rateLimitRPS", v)} placeholder="10" theme={theme} type="number" />
        </FieldGroup>
        <FieldGroup label="Max Body Size" theme={theme}>
          <Input value={form.proxyBodySize} onChange={v => update("proxyBodySize", v)} placeholder="10m" theme={theme} />
        </FieldGroup>
        <FieldGroup label="Enable CORS" theme={theme}>
          <Toggle value={form.corsEnabled} onChange={v => update("corsEnabled", v)} label theme={theme} />
        </FieldGroup>
        <FieldGroup label="Custom Annotations" theme={theme}>
          <KVList value={form.annotations} onChange={v => update("annotations", v)} keyPlaceholder="annotation key" valPlaceholder="value" addLabel="+ Add Annotation" theme={theme} />
        </FieldGroup>
      </Section>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// SECRET FORM
// ───────────────────────────────────────────────────────────────────
function SecretForm({ form, update, theme }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div style={{ background: "#1a080810", border: "1px solid #3a1010", borderRadius: 8, padding: "10px 14px", marginBottom: 12, display: "flex", gap: 8 }}>
        <span>⚠️</span>
        <span style={{ color: "#f87171", fontSize: 11.5 }}>Never commit secrets to Git. Apply manually: <code style={{ color: "#fbbf24" }}>kubectl apply -f secret.yaml</code></span>
      </div>
      <Section title="Basic Info" theme={theme}>
        <FieldGroup label="Secret Name" required theme={theme}>
          <Input value={form.name} onChange={v => update("name", v)} placeholder="my-secret" theme={theme} />
        </FieldGroup>
        <FieldGroup label="Namespace" theme={theme}>
          <Input value={form.namespace} onChange={v => update("namespace", v)} placeholder="default" theme={theme} />
        </FieldGroup>
        <FieldGroup label="Secret Type" theme={theme}>
          <Select value={form.secretType} onChange={v => update("secretType", v)} options={["Opaque", "kubernetes.io/tls", "kubernetes.io/dockerconfigjson", "kubernetes.io/service-account-token"]} theme={theme} placeholder="Opaque" />
        </FieldGroup>
      </Section>
      <Section title="Key-Value Data" theme={theme}>
        <KVList value={form.data} onChange={v => update("data", v)} keyPlaceholder="KEY" valPlaceholder="secret value" addLabel="+ Add Secret" theme={theme} sensitive={true} />
      </Section>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// CONFIGMAP FORM
// ───────────────────────────────────────────────────────────────────
function ConfigMapForm({ form, update, theme }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <Section title="Basic Info" theme={theme}>
        <FieldGroup label="ConfigMap Name" required theme={theme}>
          <Input value={form.name} onChange={v => update("name", v)} placeholder="my-config" theme={theme} />
        </FieldGroup>
        <FieldGroup label="Namespace" theme={theme}>
          <Input value={form.namespace} onChange={v => update("namespace", v)} placeholder="default" theme={theme} />
        </FieldGroup>
      </Section>
      <Section title="Key-Value Data" theme={theme}>
        <KVList value={form.data} onChange={v => update("data", v)} keyPlaceholder="KEY" valPlaceholder="value" addLabel="+ Add Config" theme={theme} />
      </Section>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// STATEFULSET FORM
// ───────────────────────────────────────────────────────────────────
function StatefulSetForm({ form, update, bundle, onCreateLinked, theme }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <LintPanel hints={lintResource("StatefulSet", form)} theme={theme} />
      <Section title="Basic Info" theme={theme}>
        <FieldGroup label="Name" required theme={theme}>
          <Input value={form.name} onChange={v => update("name", v)} placeholder="my-db" theme={theme} />
          <div style={{ marginTop: 6 }}>
            <ImageBanner image={form.image} theme={theme} onApply={(d) => {
              if (d.port) update("ports", [{ port: d.port, name: "db", protocol: "TCP" }]);
              if (d.envVars?.length) update("envVars", d.envVars);
              if (d.mountPath) update("mountPath", d.mountPath);
              if (d.cpuReq) update("cpuReq", d.cpuReq);
              if (d.memReq) update("memReq", d.memReq);
              if (d.cpuLim) update("cpuLim", d.cpuLim);
              if (d.memLim) update("memLim", d.memLim);
            }} />
          </div>
        </FieldGroup>
        <FieldGroup label="Namespace" theme={theme}>
          <Input value={form.namespace} onChange={v => update("namespace", v)} placeholder="default" theme={theme} />
        </FieldGroup>
        <FieldGroup label="Image" required theme={theme}>
          <Input value={form.image} onChange={v => update("image", v)} placeholder="postgres:15" theme={theme} />
        </FieldGroup>
        <FieldGroup label="Replicas" theme={theme}>
          <Input value={form.replicas} onChange={v => update("replicas", v)} placeholder="1" theme={theme} type="number" />
        </FieldGroup>
      </Section>
      <Section title="Ports" theme={theme}>
        <PortsList value={form.ports} onChange={v => update("ports", v)} theme={theme} />
      </Section>
      <Section title="Storage" theme={theme}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <FieldGroup label="Storage Size" theme={theme}>
            <Input value={form.storage} onChange={v => update("storage", v)} placeholder="10Gi" theme={theme} />
          </FieldGroup>
          <FieldGroup label="Storage Class" theme={theme}>
            <Input value={form.storageClass} onChange={v => update("storageClass", v)} placeholder="standard" theme={theme} />
          </FieldGroup>
        </div>
        <FieldGroup label="Mount Path" theme={theme}>
          <Input value={form.mountPath} onChange={v => update("mountPath", v)} placeholder="/var/lib/postgresql/data" theme={theme} />
        </FieldGroup>
      </Section>
      <Section title="Environment Variables" theme={theme} defaultOpen={false} onRemove={() => update("envVars", [])}>
        <KVList value={form.envVars} onChange={v => update("envVars", v)} keyPlaceholder="KEY" valPlaceholder="value" addLabel="+ Add Env Var" theme={theme} />
      </Section>
      <Section title="Environment Variables (Ref)" theme={theme} defaultOpen={false} onRemove={() => { update("secretRefs", []); update("cmRefs", []); }}>
        <EnvRefList value={form.secretRefs} onChange={v => update("secretRefs", v)} refType="Secret" bundleNames={Object.entries(bundle).filter(([t]) => t === "Secret").map(([, f]) => f.name).filter(Boolean)} bundle={bundle} theme={theme} />
        <div style={{ height: 16 }} />
        <EnvRefList value={form.cmRefs} onChange={v => update("cmRefs", v)} refType="ConfigMap" bundleNames={Object.entries(bundle).filter(([t]) => t === "ConfigMap").map(([, f]) => f.name).filter(Boolean)} bundle={bundle} theme={theme} />
      </Section>
      <Section title="Resources" theme={theme} defaultOpen={false} onRemove={() => { update("cpuReq", ""); update("cpuLim", ""); update("memReq", ""); update("memLim", ""); }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <FieldGroup label="CPU Request" theme={theme}><Input value={form.cpuReq} onChange={v => update("cpuReq", v)} placeholder="250m" theme={theme} /></FieldGroup>
          <FieldGroup label="CPU Limit" theme={theme}><Input value={form.cpuLim} onChange={v => update("cpuLim", v)} placeholder="500m" theme={theme} /></FieldGroup>
          <FieldGroup label="Memory Request" theme={theme}><Input value={form.memReq} onChange={v => update("memReq", v)} placeholder="256Mi" theme={theme} /></FieldGroup>
          <FieldGroup label="Memory Limit" theme={theme}><Input value={form.memLim} onChange={v => update("memLim", v)} placeholder="512Mi" theme={theme} /></FieldGroup>
        </div>
      </Section>
      <Section title="Scheduling" theme={theme} defaultOpen={false} onRemove={() => { update("nodeSelector", []); update("tolerations", []); }}>
        <FieldGroup label="Node Selector" hint="Key-value pairs to schedule pods on specific nodes" theme={theme}>
          <KVList value={form.nodeSelector} onChange={v => update("nodeSelector", v)} keyPlaceholder="disktype" valPlaceholder="ssd" addLabel="+ Add Node Selector" theme={theme} />
        </FieldGroup>
        <FieldGroup label="Tolerations" hint="Allow pods to schedule on tainted nodes" theme={theme}>
          <TolerationList value={form.tolerations} onChange={v => update("tolerations", v)} theme={theme} />
        </FieldGroup>
      </Section>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// HPA FORM
// ───────────────────────────────────────────────────────────────────
function HPAForm({ form, update, bundle, theme }) {
  const deployments = Object.entries(bundle).filter(([t]) => t === "Deployment").map(([, f]) => f.name).filter(Boolean);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <LintPanel hints={lintResource("HPA", form)} theme={theme} />
      <Section title="Basic Info" theme={theme}>
        <FieldGroup label="HPA Name" required theme={theme}><Input value={form.name} onChange={v => update("name", v)} placeholder="my-hpa" theme={theme} /></FieldGroup>
        <FieldGroup label="Namespace" theme={theme}><Input value={form.namespace} onChange={v => update("namespace", v)} placeholder="default" theme={theme} /></FieldGroup>
        <FieldGroup label="Target Deployment" required hint="The deployment to scale" theme={theme}>
          <div style={{ display: "flex", gap: 6 }}>
            <Input value={form.target} onChange={v => update("target", v)} placeholder="my-app" theme={theme} />
            {deployments.length > 0 && <select value={form.target || ""} onChange={e => update("target", e.target.value)} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 7, color: theme.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, padding: "9px 8px", flexShrink: 0 }}>
              <option value="">Pick →</option>
              {deployments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>}
          </div>
        </FieldGroup>
      </Section>
      <Section title="Scaling Limits" theme={theme}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <FieldGroup label="Min Replicas" theme={theme}><Input value={form.minReplicas} onChange={v => update("minReplicas", v)} placeholder="1" theme={theme} type="number" /></FieldGroup>
          <FieldGroup label="Max Replicas" theme={theme}><Input value={form.maxReplicas} onChange={v => update("maxReplicas", v)} placeholder="10" theme={theme} type="number" /></FieldGroup>
        </div>
      </Section>
      <Section title="Metrics" theme={theme}>
        <FieldGroup label="CPU Target %" hint="Scale up when CPU usage exceeds this %" theme={theme}><Input value={form.cpuTarget} onChange={v => update("cpuTarget", v)} placeholder="70" theme={theme} type="number" /></FieldGroup>
        <FieldGroup label="Memory Target % (optional)" theme={theme}><Input value={form.memTarget} onChange={v => update("memTarget", v)} placeholder="80" theme={theme} type="number" /></FieldGroup>
      </Section>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// GENERIC SIMPLE FORM — for resources with straightforward fields
// ───────────────────────────────────────────────────────────────────
function GenericForm({ form, update, fields, theme }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {fields.map(f => (
        <FieldGroup key={f.key} label={f.label} required={f.required} hint={f.hint} theme={theme}>
          {f.type === "select" ? <Select value={form[f.key]} onChange={v => update(f.key, v)} options={f.options} theme={theme} placeholder={f.placeholder} /> :
            f.type === "toggle" ? <Toggle value={form[f.key]} onChange={v => update(f.key, v)} label theme={theme} /> :
              f.type === "kvlist" ? <KVList value={form[f.key]} onChange={v => update(f.key, v)} keyPlaceholder={f.kp || "key"} valPlaceholder={f.vp || "value"} addLabel={`+ Add ${f.label}`} theme={theme} /> :
                <Input value={form[f.key]} onChange={v => update(f.key, v)} placeholder={f.placeholder} theme={theme} type={f.type || "text"} />}
        </FieldGroup>
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// FIELD CONFIGS FOR GENERIC FORMS
// ───────────────────────────────────────────────────────────────────
const GENERIC_FIELDS = {
  Namespace: [
    { key: "name", label: "Namespace Name", placeholder: "my-namespace", required: true },
    { key: "labels", label: "Labels", type: "kvlist", kp: "key", vp: "value" },
  ],
  ServiceAccount: [
    { key: "name", label: "Name", placeholder: "my-sa", required: true },
    { key: "namespace", label: "Namespace", placeholder: "default" },
    { key: "automount", label: "Automount Token", type: "select", options: ["false", "true"], hint: "Set to false for security (recommended)" },
  ],
  PersistentVolumeClaim: [
    { key: "name", label: "PVC Name", placeholder: "my-pvc", required: true },
    { key: "namespace", label: "Namespace", placeholder: "default" },
    { key: "storage", label: "Storage Size", placeholder: "5Gi", required: true, hint: "e.g. 1Gi, 10Gi, 100Gi" },
    { key: "storageClass", label: "Storage Class", placeholder: "standard", hint: "Use 'standard' for most clusters" },
    { key: "accessMode", label: "Access Mode", type: "select", options: ["ReadWriteOnce", "ReadOnlyMany", "ReadWriteMany"], hint: "RWO=single node, ROX=read-only multi, RWX=read-write multi" },
  ],
  CronJob: [
    { key: "name", label: "CronJob Name", placeholder: "my-cronjob", required: true },
    { key: "namespace", label: "Namespace", placeholder: "default" },
    { key: "schedule", label: "Cron Schedule", placeholder: "0 2 * * *", required: true, hint: "minute hour day month weekday — e.g. '0 2 * * *' = 2am daily" },
    { key: "image", label: "Container Image", placeholder: "busybox:latest", required: true },
    { key: "command", label: "Command", placeholder: "echo hello", hint: "Shell command to run" },
    { key: "restartPolicy", label: "Restart Policy", type: "select", options: ["OnFailure", "Never"] },
    { key: "concurrency", label: "Concurrency Policy", type: "select", options: ["Forbid", "Allow", "Replace"], hint: "Forbid=skip if already running" },
    { key: "successJobs", label: "Keep Successful Jobs", placeholder: "3", type: "number" },
    { key: "failJobs", label: "Keep Failed Jobs", placeholder: "1", type: "number" },
  ],
  Job: [
    { key: "name", label: "Job Name", placeholder: "my-job", required: true },
    { key: "namespace", label: "Namespace", placeholder: "default" },
    { key: "image", label: "Container Image", placeholder: "busybox:latest", required: true },
    { key: "command", label: "Command", placeholder: "echo done" },
    { key: "completions", label: "Completions", placeholder: "1", type: "number" },
    { key: "parallelism", label: "Parallelism", placeholder: "1", type: "number" },
    { key: "backoffLimit", label: "Retry Limit", placeholder: "3", type: "number" },
    { key: "deadline", label: "Deadline (seconds)", placeholder: "600", type: "number", hint: "Max time before job is killed" },
  ],
  "ArgoCD App": [
    { key: "name", label: "App Name", placeholder: "my-app", required: true },
    { key: "namespace", label: "Target Namespace", placeholder: "default" },
    { key: "repoURL", label: "GitHub Repo URL", placeholder: "https://github.com/user/repo", required: true },
    { key: "branch", label: "Branch", placeholder: "HEAD" },
    { key: "path", label: "Manifests Path", placeholder: "k8s/", hint: "Path inside the repo to YAML files" },
    { key: "project", label: "ArgoCD Project", placeholder: "default" },
    { key: "prune", label: "Auto Prune", type: "select", options: ["true", "false"], hint: "Delete resources removed from Git" },
    { key: "selfHeal", label: "Self Heal", type: "select", options: ["true", "false"], hint: "Auto-fix drift from desired state" },
  ],
  ClusterIssuer: [
    { key: "name", label: "Issuer Name", placeholder: "letsencrypt-prod", required: true },
    { key: "email", label: "Email", placeholder: "admin@domain.com", required: true, hint: "Let's Encrypt sends notifications here" },
    { key: "ingressClass", label: "Ingress Class", type: "select", options: ["traefik", "nginx", "haproxy"] },
    { key: "staging", label: "Use Staging (for testing)", type: "toggle", hint: "Use staging to avoid rate limits while testing" },
  ],
  NetworkPolicy: [
    { key: "name", label: "Policy Name", placeholder: "my-netpol", required: true },
    { key: "namespace", label: "Namespace", placeholder: "default" },
    { key: "selector", label: "Applies to pods (app=?)", placeholder: "my-app", required: true },
    { key: "allowFrom", label: "Allow ingress from app", placeholder: "frontend", hint: "Only pods with this app label can send traffic" },
    { key: "port", label: "Allowed Port", placeholder: "80", type: "number" },
  ],
  "Role & RoleBinding": [
    { key: "name", label: "Role Name", placeholder: "my-role", required: true },
    { key: "namespace", label: "Namespace", placeholder: "default" },
    { key: "resources", label: "Resources (comma-separated)", placeholder: "pods,services,deployments" },
    { key: "verbs", label: "Verbs (comma-separated)", placeholder: "get,list,watch,create,update", hint: "Allowed actions on the resources" },
    { key: "apiGroups", label: "API Groups (empty for core)", placeholder: "apps", hint: "'' for core, 'apps' for deployments, etc." },
    { key: "subjectName", label: "Bind to ServiceAccount", placeholder: "my-sa" },
  ],
  "ClusterRole & Binding": [
    { key: "name", label: "ClusterRole Name", placeholder: "my-cluster-role", required: true },
    { key: "namespace", label: "Subject Namespace", placeholder: "default" },
    { key: "resources", label: "Resources (comma-separated)", placeholder: "pods,services,deployments,namespaces" },
    { key: "verbs", label: "Verbs (comma-separated)", placeholder: "get,list,watch" },
    { key: "apiGroups", label: "API Groups", placeholder: "apps" },
    { key: "subjectName", label: "Bind to ServiceAccount", placeholder: "my-sa" },
  ],
  PodDisruptionBudget: [
    { key: "name", label: "PDB Name", placeholder: "my-pdb", required: true },
    { key: "namespace", label: "Namespace", placeholder: "default" },
    { key: "selector", label: "Pod Selector (app=?)", placeholder: "my-app", required: true },
    { key: "budgetType", label: "Budget Type", type: "select", options: ["minAvailable", "maxUnavailable"], hint: "minAvailable=keep at least N running, maxUnavailable=allow N down" },
    { key: "budgetValue", label: "Budget Value", placeholder: "1", hint: "Number or percentage e.g. 1 or 50%" },
  ],
  LimitRange: [
    { key: "name", label: "LimitRange Name", placeholder: "my-limitrange", required: true },
    { key: "namespace", label: "Namespace", placeholder: "default" },
    { key: "defaultCpuReq", label: "Default CPU Request", placeholder: "100m" },
    { key: "defaultCpuLim", label: "Default CPU Limit", placeholder: "500m" },
    { key: "defaultMemReq", label: "Default Memory Request", placeholder: "128Mi" },
    { key: "defaultMemLim", label: "Default Memory Limit", placeholder: "256Mi" },
    { key: "maxCpu", label: "Max CPU per Container", placeholder: "2" },
    { key: "maxMem", label: "Max Memory per Container", placeholder: "1Gi" },
  ],
  // New resource types
  Pod: [
    { key: "name", label: "Pod Name", placeholder: "my-pod", required: true },
    { key: "namespace", label: "Namespace", placeholder: "default" },
    { key: "image", label: "Container Image", placeholder: "nginx:1.25", required: true },
    { key: "restartPolicy", label: "Restart Policy", type: "select", options: ["Always", "OnFailure", "Never"] },
  ],
  PersistentVolume: [
    { key: "name", label: "PV Name", placeholder: "my-pv", required: true },
    { key: "storage", label: "Capacity", placeholder: "10Gi", required: true },
    { key: "storageClass", label: "Storage Class", placeholder: "standard" },
    { key: "pvType", label: "Volume Type", type: "select", options: ["hostPath", "nfs", "local"], hint: "hostPath=local disk, nfs=network share" },
    { key: "hostPath", label: "Host Path (if hostPath)", placeholder: "/mnt/data" },
    { key: "nfsServer", label: "NFS Server (if nfs)", placeholder: "nfs-server.example.com" },
    { key: "nfsPath", label: "NFS Path (if nfs)", placeholder: "/exports/data" },
    { key: "accessMode", label: "Access Mode", type: "select", options: ["ReadWriteOnce", "ReadOnlyMany", "ReadWriteMany"] },
    { key: "reclaimPolicy", label: "Reclaim Policy", type: "select", options: ["Retain", "Delete", "Recycle"], hint: "Retain=keep data, Delete=auto-delete" },
  ],
  StorageClass: [
    { key: "name", label: "StorageClass Name", placeholder: "my-storage-class", required: true },
    { key: "provisioner", label: "Provisioner", placeholder: "rancher.io/local-path", hint: "AWS: kubernetes.io/aws-ebs, GCP: pd.csi.storage.gke.io, Local: rancher.io/local-path" },
    { key: "bindingMode", label: "Volume Binding Mode", type: "select", options: ["WaitForFirstConsumer", "Immediate"] },
    { key: "reclaimPolicy", label: "Reclaim Policy", type: "select", options: ["Delete", "Retain"] },
    { key: "allowExpansion", label: "Allow Volume Expansion", type: "select", options: ["true", "false"] },
    { key: "isDefault", label: "Set as Default StorageClass", type: "select", options: ["true", "false"] },
  ],
  VPA: [
    { key: "name", label: "VPA Name", placeholder: "my-vpa", required: true },
    { key: "namespace", label: "Namespace", placeholder: "default" },
    { key: "target", label: "Target Deployment", placeholder: "my-app", required: true, hint: "The Deployment to right-size" },
    { key: "updateMode", label: "Update Mode", type: "select", options: ["Auto", "Off", "Initial", "Recreate"], hint: "Auto=live updates, Off=recommend only, Initial=at pod start" },
    { key: "minCpu", label: "Min CPU", placeholder: "50m" },
    { key: "maxCpu", label: "Max CPU", placeholder: "2" },
    { key: "minMem", label: "Min Memory", placeholder: "64Mi" },
    { key: "maxMem", label: "Max Memory", placeholder: "2Gi" },
  ],
  ServiceMonitor: [
    { key: "name", label: "ServiceMonitor Name", placeholder: "my-monitor", required: true },
    { key: "namespace", label: "Namespace (where Prometheus is)", placeholder: "monitoring" },
    { key: "selector", label: "Select Services with app=?", placeholder: "my-app", required: true },
    { key: "targetNamespace", label: "Target Namespace (where app is)", placeholder: "default" },
    { key: "port", label: "Port Name", placeholder: "http", hint: "Must match the Service port name" },
    { key: "path", label: "Metrics Path", placeholder: "/metrics" },
    { key: "interval", label: "Scrape Interval", placeholder: "30s" },
    { key: "scrapeTimeout", label: "Scrape Timeout", placeholder: "10s" },
    { key: "release", label: "Prometheus Release Label", placeholder: "prometheus", hint: "Must match your Prometheus operator's release label" },
  ],
  Kustomization: [
    { key: "name", label: "Name", placeholder: "my-kustomization", required: true },
    { key: "namespace", label: "Namespace", placeholder: "default" },
    { key: "resources", label: "Resources (comma-separated files)", placeholder: "deployment.yaml,service.yaml,ingress.yaml", hint: "Relative paths to your YAML files" },
    { key: "imageName", label: "Image to Override (optional)", placeholder: "myapp" },
    { key: "imageTag", label: "New Image Tag", placeholder: "v1.2.3" },
    { key: "patchFile", label: "Patch File (optional)", placeholder: "patches/replica-count.yaml" },
    { key: "commonLabels", label: "Common Labels env value", placeholder: "production" },
  ],
  ResourceQuota: [
    { key: "name", label: "Quota Name", placeholder: "my-quota", required: true },
    { key: "namespace", label: "Namespace", placeholder: "default" },
    { key: "maxPods", label: "Max Pods", placeholder: "20" },
    { key: "reqCpu", label: "Total CPU Request", placeholder: "4" },
    { key: "reqMem", label: "Total Memory Request", placeholder: "4Gi" },
    { key: "limCpu", label: "Total CPU Limit", placeholder: "8" },
    { key: "limMem", label: "Total Memory Limit", placeholder: "8Gi" },
    { key: "maxServices", label: "Max Services", placeholder: "10" },
    { key: "maxPVCs", label: "Max PVCs", placeholder: "5" },
  ],
};


// ───────────────────────────────────────────────────────────────────
// RESOURCE FORM ROUTER — picks the right form
// ───────────────────────────────────────────────────────────────────
export function ResourceForm({ type, form, onChange, bundle, onCreateLinked, theme }) {
  const update = (key, val) => onChange({ ...form, [key]: val });
  const commonProps = { form, update, bundle, onCreateLinked, theme };

  switch (type) {
    case "Deployment": return <DeploymentForm {...commonProps} />;
    case "Service": return <ServiceForm {...commonProps} />;
    case "Ingress": return <IngressForm {...commonProps} />;
    case "Secret": return <SecretForm {...commonProps} />;
    case "ConfigMap": return <ConfigMapForm {...commonProps} />;
    case "StatefulSet": return <StatefulSetForm {...commonProps} />;
    case "HPA": return <HPAForm {...commonProps} />;
    case "Pod": return <PodForm {...commonProps} />;
    case "DaemonSet": return <DaemonSetForm {...commonProps} />;
    default:
      const fields = GENERIC_FIELDS[type];
      if (fields) return <GenericForm form={form} update={update} fields={fields} theme={theme} />;
      return <div style={{ color: theme.textMuted, padding: 20 }}>Form for {type} coming soon.</div>;
  }
}
