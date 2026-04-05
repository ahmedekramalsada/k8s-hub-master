// ═══════════════════════════════════════════════════════════════════
// K8S ULTIMATE GENERATOR — Part 2: components.jsx
// All reusable UI components
// ═══════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect, useCallback } from "react";
import yaml from "js-yaml";
import { RESOURCE_META, CATEGORIES, detectImage, smartName, lintResource, calcSecurityScore, detectKindFromParsed, yamlToFormState } from "./generators.js";
import { ResourceForm } from "./forms.jsx";
import { useToast } from "../components/ToastContext.jsx";

// ───────────────────────────────────────────────────────────────────
// GLOBAL STYLES (MOBILE RESPONSIVENESS)
// ───────────────────────────────────────────────────────────────────
export const MobileStyles = () => (
  <style>{`
    html, body {
      background-color: #060610;
      overscroll-behavior: none;
    }
    @media (max-width: 768px) {
      .desktop-only { display: none !important; }
      .mobile-only { display: block !important; }
      .mobile-stacked { flex-direction: column !important; }
      .mobile-stacked-fullwidth { width: 100% !important; border-right: none !important; border-bottom: 1px solid #1e293b !important; flex-shrink: 0 !important; }
      .touch-input { min-height: 44px !important; font-size: 16px !important; padding: 12px !important; }
      .touch-btn { min-height: 44px !important; padding: 12px 16px !important; font-size: 14px !important; }
      
      .mobile-sidebar-drawer {
        position: fixed !important; top: 0; left: 0; bottom: 0; z-index: 1000;
        transform: translateX(0); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 4px 0 25px rgba(0,0,0,0.5); width: 260px;
        height: 100%; display: flex; flex-direction: column;
        overflow: hidden;
      }
      .mobile-sidebar-hidden {
        position: fixed !important; top: 0; left: 0; bottom: 0; z-index: 1000;
        transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        width: 260px; height: 100%; display: flex; flex-direction: column;
        overflow: hidden;
      }
      .mobile-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5); z-index: 999; backdrop-filter: blur(2px);
      }
      .mobile-topnav-scroll {
        overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; 
        scrollbar-width: none; padding-bottom: 2px;
      }
      .mobile-topnav-scroll::-webkit-scrollbar { display: none; }
      .mobile-tab-form { display: block !important; }
      .mobile-tab-yaml { display: none !important; }
      .mobile-tab-form.hidden { display: none !important; }
      .mobile-tab-yaml.visible { display: flex !important; flex-direction: column !important; }
    }
    @media (min-width: 769px) {
      .mobile-only { display: none !important; }
      .mobile-sidebar-drawer { display: none !important; }
      .mobile-sidebar-hidden { display: none !important; }
    }
    .info-tooltip-container { position: relative; display: inline-flex; align-items: center; margin-left: 6px; cursor: help; }
    .info-tooltip-container svg { fill: currentColor; opacity: 0.6; transition: opacity 0.2s; }
    .info-tooltip-container:hover svg { opacity: 1; }
    .info-tooltip-content {
       position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%) translateY(4px);
       background: #1e293b; color: #f8fafc; padding: 8px 12px; border-radius: 6px;
       font-size: 11.5px; opacity: 0; visibility: hidden; transition: all 0.2s;
       z-index: 100; margin-bottom: 8px; pointer-events: none;
       box-shadow: 0 4px 12px rgba(0,0,0,0.2); width: max-content; max-width: 250px;
       white-space: normal; line-height: 1.4; border: 1px solid #334155;
    }
    .info-tooltip-content::after {
       content: ''; position: absolute; top: 100%; left: 50%; margin-left: -5px;
       border-width: 5px; border-style: solid; border-color: #334155 transparent transparent transparent;
    }
    .info-tooltip-container:hover .info-tooltip-content { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }
  `}</style>
);


// ───────────────────────────────────────────────────────────────────
// BASE INPUT — with validation support
// ───────────────────────────────────────────────────────────────────
export function Input({ value, onChange, placeholder, type = "text", theme, style = {}, className = "", disabled = false, error = null, valid = false }) {
  const [focused, setFocused] = useState(false);

  let borderColor = theme.border;
  let boxShadow = 'none';
  if (error) {
    borderColor = '#ef4444';
    boxShadow = '0 0 0 3px rgba(239,68,68,0.12)';
  } else if (valid) {
    borderColor = '#22c55e';
  } else if (focused) {
    borderColor = theme.borderFocus;
    boxShadow = `0 0 0 3px ${theme.borderFocus}30`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <input
        type={type}
        className={`touch-input ${className}`}
        placeholder={placeholder}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        style={{
          background: disabled ? theme.bgHover : theme.bgInput,
          border: `1px solid ${borderColor}`,
          borderRadius: 8, color: theme.text, fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14, padding: "12px 14px", width: "100%", outline: "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow,
          ...style
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {error && (
        <div style={{
          color: '#ef4444', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 8px', background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.12)', borderRadius: 6,
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

export function Textarea({ value, onChange, placeholder, theme, rows = 4, className = "" }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`touch-input ${className}`}
      style={{
        background: theme.bgInput, border: `1px solid ${focused ? theme.borderFocus : theme.border}`,
        borderRadius: 7, color: theme.text, fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12.5, padding: "9px 12px", width: "100%", outline: "none",
        transition: "border-color 0.2s", resize: "vertical", boxSizing: "border-box",
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

export function Select({ value, onChange, options, theme, placeholder = "Select...", className = "" }) {
  return (
    <select
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      className={`touch-input ${className}`}
      style={{
        background: theme.bgInput, border: `1px solid ${theme.border}`,
        borderRadius: 8, color: value ? theme.text : theme.textMuted,
        fontFamily: "'JetBrains Mono', monospace", fontSize: 13.5,
        padding: "12px 14px", width: "100%", outline: "none", cursor: "pointer",
        transition: "border-color 0.2s",
      }}
    >
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={o.value || o} value={o.value || o} style={{ background: theme.bgCard, color: theme.text }}>
          {o.label || o}
        </option>
      ))}
    </select>
  );
}

export function Toggle({ value, onChange, label, theme }) {
  const on = value === true || value === "true";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        onClick={() => onChange(!on)}
        style={{ width: 40, height: 22, borderRadius: 11, background: on ? "#6366f1" : theme.border, position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}
      >
        <div style={{ width: 16, height: 16, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: on ? 21 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
      </div>
      {label && <span style={{ color: theme.textMuted, fontSize: 12.5 }}>{on ? "Enabled" : "Disabled"}</span>}
    </div>
  );
}

export function Label({ children, required, theme }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 4, color: theme.textMuted, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>
      {children}
      {required && <span style={{ color: theme.error }}>*</span>}
    </label>
  );
}

export function Btn({ children, onClick, variant = "ghost", theme, style = {}, disabled = false, className = "" }) {
  const styles = {
    primary: { background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "white", border: "none" },
    ghost: { background: theme.bgCard, color: theme.textMuted, border: `1px solid ${theme.border}` },
    danger: { background: "#1a0808", color: "#f87171", border: "1px solid #3a1010" },
    success: { background: "#081a08", color: "#4ade80", border: "1px solid #1a3a1a" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`touch-btn ${className}`}
      style={{ ...styles[variant], borderRadius: 7, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, fontWeight: 600, padding: "8px 14px", transition: "all 0.15s", opacity: disabled ? 0.5 : 1, ...style }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
    >
      {children}
    </button>
  );
}

// ───────────────────────────────────────────────────────────────────
// DYNAMIC KEY-VALUE LIST
// ───────────────────────────────────────────────────────────────────
export function KVList({ value = [], onChange, keyPlaceholder = "KEY", valPlaceholder = "value", addLabel = "+ Add", theme, sensitive = false }) {
  const pairs = value.length ? value : [{ k: "", v: "" }];

  const update = (i, field, val) => {
    const next = [...pairs];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };
  const add = () => onChange([...pairs, { k: "", v: "" }]);
  const remove = (i) => onChange(pairs.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {pairs.map((pair, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 28px", gap: 5, alignItems: "center" }}>
          <Input value={pair.k} onChange={v => update(i, "k", v)} placeholder={keyPlaceholder} theme={theme} />
          <Input value={pair.v} onChange={v => update(i, "v", v)} placeholder={valPlaceholder} theme={theme}
            type={sensitive ? "password" : "text"} style={{ color: sensitive ? theme.warning : theme.text }} />
          <button onClick={() => remove(i)} style={{ background: "transparent", border: "none", color: theme.error, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 4px" }}>×</button>
        </div>
      ))}
      <button onClick={add} style={{ background: "transparent", border: `1px dashed ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: "pointer", fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", padding: "6px", marginTop: 2, transition: "all 0.15s" }}
        onMouseEnter={e => { e.target.style.borderColor = "#6366f1"; e.target.style.color = "#6366f1"; }}
        onMouseLeave={e => { e.target.style.borderColor = theme.border; e.target.style.color = theme.textMuted; }}>
        {addLabel}
      </button>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// DYNAMIC PORTS LIST
// ───────────────────────────────────────────────────────────────────
export function PortsList({ value = [], onChange, theme }) {
  const ports = value.length ? value : [{ port: "", name: "", protocol: "TCP" }];
  const update = (i, field, val) => { const n = [...ports]; n[i] = { ...n[i], [field]: val }; onChange(n); };
  const add = () => onChange([...ports, { port: "", name: "", protocol: "TCP" }]);
  const remove = (i) => onChange(ports.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {ports.map((p, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr 80px 28px", gap: 5, alignItems: "center" }}>
          <Input value={p.port} onChange={v => update(i, "port", v)} placeholder="8080" theme={theme} type="number" />
          <Input value={p.name} onChange={v => update(i, "name", v)} placeholder="name (optional)" theme={theme} />
          <Select value={p.protocol} onChange={v => update(i, "protocol", v)} options={["TCP", "UDP", "SCTP"]} theme={theme} placeholder="TCP" />
          <button onClick={() => remove(i)} style={{ background: "transparent", border: "none", color: theme.error, cursor: "pointer", fontSize: 16 }}>×</button>
        </div>
      ))}
      <button onClick={add} style={{ background: "transparent", border: `1px dashed ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: "pointer", fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", padding: "6px" }}>+ Add Port</button>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// TOLERATION LIST
// ───────────────────────────────────────────────────────────────────
export function TolerationList({ value = [], onChange, theme }) {
  const tols = value.length ? value : [];
  const update = (i, field, val) => { const n = [...tols]; n[i] = { ...n[i], [field]: val }; onChange(n); };
  const add = () => onChange([...tols, { key: "", operator: "Equal", value: "", effect: "" }]);
  const remove = (i) => onChange(tols.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {tols.map((t, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr 100px 28px", gap: 5, alignItems: "center" }}>
          <Input value={t.key} onChange={v => update(i, "key", v)} placeholder="key" theme={theme} />
          <Select value={t.operator} onChange={v => update(i, "operator", v)} options={["Equal", "Exists"]} theme={theme} />
          <Input value={t.value} onChange={v => update(i, "value", v)} placeholder="value" theme={theme} disabled={t.operator === "Exists"} style={{ opacity: t.operator === "Exists" ? 0.5 : 1 }} />
          <Select value={t.effect} onChange={v => update(i, "effect", v)} options={["", "NoSchedule", "PreferNoSchedule", "NoExecute"]} theme={theme} placeholder="Effect" />
          <button onClick={() => remove(i)} style={{ background: "transparent", border: "none", color: theme.error, cursor: "pointer", fontSize: 16 }}>×</button>
        </div>
      ))}
      <button onClick={add} style={{ background: "transparent", border: `1px dashed ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: "pointer", fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", padding: "6px" }}>+ Add Toleration</button>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// DYNAMIC VOLUME MOUNTS
// ───────────────────────────────────────────────────────────────────
export function VolumeList({ value = [], onChange, theme }) {
  const vols = value.length ? value : [];
  const update = (i, field, val) => { const n = [...vols]; n[i] = { ...n[i], [field]: val }; onChange(n); };
  const add = () => onChange([...vols, { name: "", type: "pvc", source: "", path: "" }]);
  const remove = (i) => onChange(vols.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {vols.map((v, i) => (
        <div key={i} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "10px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 28px", gap: 6, marginBottom: 6 }}>
            <Input value={v.name} onChange={val => update(i, "name", val)} placeholder="vol-name" theme={theme} />
            <Select value={v.type} onChange={val => update(i, "type", val)} options={["pvc", "configMap", "secret", "emptyDir", "hostPath"]} theme={theme} placeholder="Type" />
            <button onClick={() => remove(i)} style={{ background: "transparent", border: "none", color: theme.error, cursor: "pointer", fontSize: 16 }}>×</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {v.type !== "emptyDir" && <Input value={v.source} onChange={val => update(i, "source", val)} placeholder="source name" theme={theme} />}
            <Input value={v.path} onChange={val => update(i, "path", val)} placeholder="/mount/path" theme={theme} />
          </div>
        </div>
      ))}
      <button onClick={add} style={{ background: "transparent", border: `1px dashed ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: "pointer", fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", padding: "6px" }}>+ Add Volume</button>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// INIT CONTAINERS LIST
// ───────────────────────────────────────────────────────────────────
export function InitContainerList({ value = [], onChange, theme }) {
  const inits = value;
  const update = (i, field, val) => { const n = [...inits]; n[i] = { ...n[i], [field]: val }; onChange(n); };
  const add = () => onChange([...inits, { name: "", image: "", command: "" }]);
  const remove = (i) => onChange(inits.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {inits.map((c, i) => (
        <div key={i} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: theme.textMuted, fontSize: 11 }}>Init Container #{i + 1}</span>
            <button onClick={() => remove(i)} style={{ background: "transparent", border: "none", color: theme.error, cursor: "pointer", fontSize: 14 }}>× Remove</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Input value={c.name} onChange={v => update(i, "name", v)} placeholder="init-name" theme={theme} />
            <Input value={c.image} onChange={v => update(i, "image", v)} placeholder="busybox:latest" theme={theme} />
            <Input value={c.command} onChange={v => update(i, "command", v)} placeholder="sh -c 'echo init done'" theme={theme} />
          </div>
        </div>
      ))}
      <button onClick={add} style={{ background: "transparent", border: `1px dashed ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: "pointer", fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", padding: "6px" }}>+ Add Init Container</button>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// INGRESS RULES LIST
// ───────────────────────────────────────────────────────────────────
export function IngressRulesList({ value = [], onChange, theme }) {
  const rules = value.length ? value : [{ host: "", path: "/", service: "", port: "80" }];
  const update = (i, field, val) => { const n = [...rules]; n[i] = { ...n[i], [field]: val }; onChange(n); };
  const add = () => onChange([...rules, { host: "", path: "/", service: "", port: "80" }]);
  const remove = (i) => onChange(rules.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rules.map((r, i) => (
        <div key={i} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: theme.textMuted, fontSize: 11 }}>Rule #{i + 1}</span>
            {rules.length > 1 && <button onClick={() => remove(i)} style={{ background: "transparent", border: "none", color: theme.error, cursor: "pointer", fontSize: 12 }}>× Remove</button>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 6, marginBottom: 6 }}>
            <Input value={r.host} onChange={v => update(i, "host", v)} placeholder="app.domain.com" theme={theme} />
            <Input value={r.path} onChange={v => update(i, "path", v)} placeholder="/" theme={theme} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 6 }}>
            <Input value={r.service} onChange={v => update(i, "service", v)} placeholder="my-service" theme={theme} />
            <Input value={r.port} onChange={v => update(i, "port", v)} placeholder="80" theme={theme} type="number" />
          </div>
        </div>
      ))}
      <button onClick={add} style={{ background: "transparent", border: `1px dashed ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: "pointer", fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", padding: "6px" }}>+ Add Rule</button>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// IMAGE INTELLIGENCE BANNER
// ───────────────────────────────────────────────────────────────────
export function ImageBanner({ image, onApply, theme }) {
  const detected = detectImage(image);
  if (!detected) return null;

  return (
    <div style={{ background: theme.accentSoft, border: `1px solid ${theme.accent}40`, borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 16 }}>🧠</span>
      <div style={{ flex: 1 }}>
        <div style={{ color: theme.accent, fontSize: 11, fontWeight: 700 }}>Image Detected: {detected.key}</div>
        <div style={{ color: theme.textMuted, fontSize: 10.5, marginTop: 2 }}>Auto-fill port {detected.port}, resource limits, and env vars</div>
      </div>
      <button onClick={() => onApply(detected)} style={{ background: theme.accent, border: "none", borderRadius: 6, color: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", padding: "6px 12px" }}>
        Auto-fill
      </button>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// SMART NAME SUGGESTIONS
// ───────────────────────────────────────────────────────────────────
export function SmartNameSuggestions({ appName, currentType, onPick, theme }) {
  if (!appName) return null;
  const names = smartName(appName);
  const suggestions = {
    Service: names.service, Secret: names.secret, ConfigMap: names.configmap,
    Ingress: names.ingress, HPA: names.hpa, PersistentVolumeClaim: names.pvc, ServiceAccount: names.sa,
  };
  const suggestion = suggestions[currentType];
  if (!suggestion) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ color: theme.textDim, fontSize: 10.5 }}>💡 Suggested:</span>
      <button onClick={() => onPick(suggestion)} style={{ background: theme.accentSoft, border: "none", borderRadius: 4, color: theme.accent, cursor: "pointer", fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", padding: "2px 8px" }}>
        {suggestion}
      </button>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// LINKED RESOURCE BUTTON
// ───────────────────────────────────────────────────────────────────
export function LinkedResourceBtn({ label, refType, onCreateLinked, bundleNames = [], theme }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setShow(!show)} style={{ background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: "pointer", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", padding: "3px 8px" }}>
        {refType} {show ? "▲" : "▼"}
      </button>
      {show && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "8px", minWidth: 200, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
          {bundleNames.length > 0 && (
            <>
              <div style={{ color: theme.textDim, fontSize: 9.5, marginBottom: 6 }}>EXISTING IN BUNDLE</div>
              {bundleNames.map(n => (
                <button key={n} onClick={() => { onCreateLinked(n, false); setShow(false); }}
                  style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", color: theme.textMuted, cursor: "pointer", fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", padding: "5px 6px", borderRadius: 5 }}
                  onMouseEnter={e => e.target.style.background = theme.bgHover}
                  onMouseLeave={e => e.target.style.background = "transparent"}>
                  ✓ {n}
                </button>
              ))}
              <hr style={{ border: "none", borderTop: `1px solid ${theme.border}`, margin: "6px 0" }} />
            </>
          )}
          <button onClick={() => { onCreateLinked("", true); setShow(false); }}
            style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", color: theme.accent, cursor: "pointer", fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", padding: "5px 6px", borderRadius: 5 }}>
            + Create New {refType}
          </button>
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// ENV REF LIST (ConfigMap / Secret Keys)
// ───────────────────────────────────────────────────────────────────
export function EnvRefList({ value = [], onChange, refType = "ConfigMap", bundleNames = [], bundle = {}, theme }) {
  const refs = value.length ? value : [];

  const nameField = refType === "Secret" ? "secretName" : "cmName";
  const keyField = refType === "Secret" ? "secretKey" : "cmKey";

  const update = (i, field, val) => { const n = [...refs]; n[i] = { ...n[i], [field]: val }; onChange(n); };
  const add = () => onChange([...refs, { envKey: "", [nameField]: "", [keyField]: "" }]);
  const remove = (i) => onChange(refs.filter((_, idx) => idx !== i));

  const getKeys = (resName) => {
    if (!resName || !bundle) return [];
    const res = Object.entries(bundle).find(([t, f]) => t === refType && f.name === resName);
    if (!res || !res[1]?.data) return [];
    return res[1].data.map(d => d.k).filter(Boolean);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {refs.map((r, i) => {
        const availableKeys = getKeys(r[nameField]);
        return (
          <div key={i} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: theme.textMuted, fontSize: 11 }}>{refType} Ref #{i + 1}</span>
              <button onClick={() => remove(i)} style={{ background: "transparent", border: "none", color: theme.error, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Input value={r.envKey} onChange={val => update(i, "envKey", val)} placeholder="ENV_VAR_NAME" theme={theme} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <Select value={r[nameField]} onChange={val => { const n = [...refs]; n[i] = { ...n[i], [nameField]: val, [keyField]: "" }; onChange(n); }} options={bundleNames} theme={theme} placeholder={`${refType} Name`} />
                {availableKeys.length > 0 ? (
                  <Select value={r[keyField]} onChange={val => update(i, keyField, val)} options={availableKeys} theme={theme} placeholder="Select Key" />
                ) : (
                  <Input value={r[keyField]} onChange={val => update(i, keyField, val)} placeholder="key" theme={theme} />
                )}
              </div>
            </div>
          </div>
        )
      })}
      <button onClick={add} style={{ background: "transparent", border: `1px dashed ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: "pointer", fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", padding: "6px" }}>+ Add {refType} Ref</button>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// LINT PANEL
// ───────────────────────────────────────────────────────────────────
export function LintPanel({ hints, theme }) {
  if (!hints.length) return null;
  const icon = { error: "❌", warning: "⚠️", info: "💡" };
  const color = { 
    error: theme.isDark ? theme.error : "#dc2626", 
    warning: theme.isDark ? theme.warning : "#d97706", 
    info: theme.isDark ? theme.info : "#0284c7" 
  };
  const bg = { 
    error: theme.isDark ? "#1a0808" : "#fef2f2", 
    warning: theme.isDark ? "#1a1200" : "#fffbeb", 
    info: theme.isDark ? "#081218" : "#f0f9ff" 
  };
  const border = { 
    error: theme.isDark ? "#3a1010" : "#fecaca", 
    warning: theme.isDark ? "#3a2800" : "#fde68a", 
    info: theme.isDark ? "#103040" : "#bae6fd" 
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 16px 12px" }}>
      {hints.map((h, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", background: bg[h.level], border: `1px solid ${border[h.level]}`, borderRadius: 6, padding: "6px 10px" }}>
          <span style={{ fontSize: 12, flexShrink: 0 }}>{icon[h.level]}</span>
          <span style={{ color: color[h.level], fontSize: 11.5, lineHeight: 1.5 }}>{h.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// SECURITY SCORE BADGE
// ───────────────────────────────────────────────────────────────────
export function SecurityBadge({ type, form, theme }) {
  const [expanded, setExpanded] = useState(false);
  const { score, grade, color, issues, passes } = calcSecurityScore(type, form);

  const adaptedColor = theme.isDark ? color : (grade === "A" ? "#16a34a" : grade === "B" ? "#65a30d" : grade === "C" ? "#d97706" : grade === "D" ? "#ea580c" : "#dc2626");

  return (
    <div style={{ border: `1px solid ${theme.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
      <button onClick={() => setExpanded(!expanded)} style={{ width: "100%", background: theme.bgCard, border: "none", cursor: "pointer", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${adaptedColor}20`, border: `2px solid ${adaptedColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: adaptedColor, fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>{grade}</span>
        </div>
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ color: theme.text, fontSize: 12, fontWeight: 600 }}>Security Score: {score}/100</div>
          <div style={{ color: theme.textMuted, fontSize: 10.5 }}>{issues.length ? `${issues.length} issue${issues.length > 1 ? "s" : ""} found` : "All checks passed!"}</div>
        </div>
        <span style={{ color: theme.textMuted, fontSize: 12 }}>{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div style={{ padding: "12px 14px", background: theme.bgInput, borderTop: `1px solid ${theme.border}` }}>
          {issues.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ color: theme.error, fontSize: 10.5, fontWeight: 700, marginBottom: 4 }}>ISSUES</div>
              {issues.map((iss, i) => <div key={i} style={{ color: theme.textMuted, fontSize: 11, padding: "2px 0" }}>❌ {iss}</div>)}
            </div>
          )}
          {passes.length > 0 && (
            <div>
              <div style={{ color: theme.success, fontSize: 10.5, fontWeight: 700, marginBottom: 4 }}>PASSING</div>
              {passes.map((p, i) => <div key={i} style={{ color: theme.textMuted, fontSize: 11, padding: "2px 0" }}>✅ {p}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// RESOURCE SIDEBAR
// ───────────────────────────────────────────────────────────────────
export function Sidebar({ selected, onSelect, search, onSearch, theme, onQuickCreate }) {
  const searchLower = (search || "").toLowerCase();
  const filtered = Object.entries(RESOURCE_META).filter(([name, m]) =>
    name.toLowerCase().includes(searchLower) || (m.desc && m.desc.toLowerCase().includes(searchLower))
  );
  const grouped = CATEGORIES.map(cat => ({
    cat, items: filtered.filter(([, m]) => m.cat === cat)
  })).filter(g => g.items.length);

  return (
    <div style={{ width: 200, height: "100%", borderRight: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", overflow: "hidden", background: theme.bgCard }}>
      <div style={{ padding: "10px 10px 6px", position: "relative" }}>
        <span style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: 12 }}>🔍</span>
        <input
          className="input"
          placeholder="Search..."
          value={search}
          onChange={e => onSearch(e.target.value)}
          style={{ paddingLeft: 30, width: "100%", height: 32, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace" }}
        />
      </div>
      <div style={{ overflowY: "auto", flex: 1, padding: "4px 8px 12px", WebkitOverflowScrolling: "touch" }}>
        {grouped.map(({ cat, items }) => (
          <div key={cat}>
            <div style={{ color: theme.textDim, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "10px 4px 4px" }}>{cat}</div>
            {items.map(([name, m]) => (
              <div key={name} style={{ position: "relative", marginBottom: 1 }}
                onMouseEnter={e => e.currentTarget.querySelector(".qc-btn") && (e.currentTarget.querySelector(".qc-btn").style.opacity = "1")}
                onMouseLeave={e => e.currentTarget.querySelector(".qc-btn") && (e.currentTarget.querySelector(".qc-btn").style.opacity = "0")}>
                <button onClick={() => onSelect(name)}
                  style={{ width: "100%", textAlign: "left", background: selected === name ? `${m.color}15` : "transparent", border: selected === name ? `1px solid ${m.color}40` : "1px solid transparent", borderRadius: 7, color: selected === name ? m.color : theme.textMuted, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontSize: 11, padding: "8px 8px", paddingRight: 28, transition: "all 0.12s", fontFamily: "'JetBrains Mono', monospace" }}
                  onMouseEnter={e => { if (selected !== name) e.currentTarget.style.background = theme.bgHover; }}
                  onMouseLeave={e => { if (selected !== name) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ fontSize: 13 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontWeight: selected === name ? 600 : 400 }}>{name}</div>
                    <div style={{ fontSize: 9.5, color: selected === name ? `${m.color}80` : theme.textDim, marginTop: 1, lineHeight: 1.3 }}>{m.desc}</div>
                  </div>
                </button>
                {/* Quick Create ⊕ button — appears on hover */}
                {onQuickCreate && (
                  <button className="qc-btn" onClick={e => { e.stopPropagation(); onQuickCreate(name); }}
                    title={`Quick create ${name}`}
                    style={{ position: "absolute", right: 5, top: "50%", transform: "translateY(-50%)", opacity: 0, transition: "opacity 0.15s", background: `${m.color}20`, border: `1px solid ${m.color}50`, borderRadius: 4, color: m.color, cursor: "pointer", fontSize: 11, fontWeight: 700, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1 }}
                  >+</button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// TOP NAVIGATION BAR
// ───────────────────────────────────────────────────────────────────
export function TopNav({ view, onView, darkMode, onToggleTheme, theme, onToggleMobileSidebar }) {
  const navGroups = [
    { label: "Build", items: [
      { id: "dashboard", icon: "🏠", label: "Resources" },
      { id: "generator", icon: "⚡", label: "Build" },
      { id: "wizard", icon: "🧙", label: "Wizard" },
      { id: "import", icon: "📥", label: "Import" },
    ]},
    { label: "Manage", items: [
      { id: "bundle", icon: "📦", label: "Bundle" },
      { id: "templates", icon: "📋", label: "Templates" },
      { id: "helm", icon: "⛵", label: "Helm" },
    ]},
    { label: "Tools", items: [
      { id: "diff", icon: "🔀", label: "Diff" },
      { id: "snippets", icon: "✂️", label: "Snippets" },
    ]},
    { label: "Learn", items: [
      { id: "learn", icon: "📖", label: "Learn" },
      { id: "ai", icon: "🤖", label: "AI" },
    ]},
  ];

  return (
    <div style={{ borderBottom: `1px solid ${theme.border}`, background: theme.navBg, position: "sticky", top: 64, zIndex: 90, display: "flex", alignItems: "center", padding: "0 16px", height: 48, gap: 6, boxShadow: theme.shadow }}>

      {/* Mobile Hamburger */}
      <button className="mobile-only touch-btn" onClick={onToggleMobileSidebar} style={{ background: "transparent", border: "none", color: theme.text, fontSize: 24, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
        ☰
      </button>

      <div className="mobile-topnav-scroll" style={{ display: "flex", gap: 2, flex: 1, alignItems: "center", overflowX: "auto" }}>
        {navGroups.map((group, gi) => (
          <React.Fragment key={group.label}>
            {gi > 0 && <div style={{ width: 1, height: 20, background: theme.border, margin: "0 4px", flexShrink: 0 }} />}
            {group.items.map(n => (
              <button key={n.id} onClick={() => onView(n.id)} className="touch-btn"
                style={{
                  background: view === n.id ? theme.accentSoft : "transparent",
                  border: view === n.id ? `1px solid ${theme.accent}40` : "1px solid transparent",
                  borderRadius: 7,
                  color: view === n.id ? theme.accent : theme.textMuted,
                  cursor: "pointer", fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                  padding: "5px 12px", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5,
                  height: 32, whiteSpace: "nowrap",
                }}>
                <span>{n.icon}</span><span>{n.label}</span>
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// YAML OUTPUT PANEL
// ───────────────────────────────────────────────────────────────────
export function YAMLPanel({ yaml, resourceType, theme, onCopy, onDownload, copied, extraActions }) {
  const { showToast } = useToast();
  const [wordWrap, setWordWrap] = useState(false);
  const scrollRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // Sync scroll between line numbers and YAML content
  const handleScroll = useCallback((e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  }, []);

  const highlighted = yaml
    .split("\n")
    .map(line => {
      if (line.trim().startsWith("#")) return `<span style="color:${theme.isDark ? '#4b5563' : '#94a3b8'};font-style:italic">${line.replace(/</g, "&lt;")}</span>`;
      if (line.match(/^---/)) return `<span style="color:${theme.isDark ? '#818cf8' : '#4f46e5'};font-weight:bold">---</span>`;
      return line
        .replace(/</g, "&lt;")
        .replace(/^(\s*)([\w.-]+)(\s*:)/g, (_, sp, key, col) => {
          const topKeys = ["apiVersion", "kind", "metadata", "spec", "data", "stringData", "rules", "template", "containers", "ports", "env", "resources", "limits", "requests", "selector", "strategy"];
          const colorDark = topKeys.includes(key) ? "#818cf8" : key === "name" || key === "namespace" ? "#7dd3fc" : key === "image" ? "#34d399" : "#93c5fd";
          const colorLight = topKeys.includes(key) ? "#4f46e5" : key === "name" || key === "namespace" ? "#0284c7" : key === "image" ? "#059669" : "#2563eb";
          return `${sp}<span style="color:${theme.isDark ? colorDark : colorLight}">${key}</span>${col}`;
        })
        .replace(/:\s*(true|false)(\s*)$/g, `: <span style="color:${theme.isDark ? '#fb923c' : '#ea580c'}">$1</span>$2`)
        .replace(/:\s*(\d+)(\s*)$/g, `: <span style="color:${theme.isDark ? '#4ade80' : '#16a34a'}">$1</span>$2`)
        .replace(/:\s*"([^"]*)"(\s*)$/g, `: <span style="color:${theme.isDark ? '#fbbf24' : '#d97706'}">"$1"</span>$2`)
        .replace(/:\s*([a-zA-Z][a-zA-Z0-9./:_-]+)(\s*)$/g, `: <span style="color:${theme.isDark ? '#a5f3fc' : '#0891b2'}">$1</span>$2`);
    })
    .join("\n");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ padding: "8px 16px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 8, background: theme.bgCard }}>
        <span style={{ color: theme.textDim, fontSize: 11 }}>📄 {(resourceType || "resource").toLowerCase().replace(/[\s&]/g, "-")}.yaml</span>
        <span style={{ color: theme.textDim, fontSize: 10 }}>•</span>
        <span style={{ color: theme.textDim, fontSize: 10 }}>{yaml.split("\n").length} lines</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
          {/* Word wrap toggle */}
          <button onClick={() => setWordWrap(w => !w)} style={{
            background: wordWrap ? 'rgba(99,102,241,0.15)' : 'transparent',
            border: `1px solid ${wordWrap ? 'rgba(99,102,241,0.3)' : theme.border}`,
            borderRadius: 6, color: wordWrap ? '#818cf8' : theme.textMuted,
            cursor: 'pointer', fontSize: 10, padding: '4px 8px',
            fontFamily: "'JetBrains Mono', monospace", transition: 'all 150ms ease',
          }} title="Toggle word wrap">↩️ Wrap</button>
          {extraActions}
          <Btn onClick={onCopy} theme={theme} variant={copied ? "success" : "ghost"} style={{ fontSize: 11, padding: "6px 12px" }}>
            {copied ? "✅ Copied!" : "📋 Copy"}
          </Btn>
          <Btn onClick={onDownload} theme={theme} variant="ghost" style={{ fontSize: 11, padding: "6px 12px" }}>
            ⬇️ Download
          </Btn>
        </div>
      </div>

      {/* YAML with synced line numbers */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
        {/* Line numbers gutter — synced scroll */}
        <div ref={lineNumbersRef} style={{
          width: 48, flexShrink: 0, background: theme.yamlBg,
          borderRight: '1px solid var(--border-subtle)',
          overflow: 'hidden', userSelect: 'none', textAlign: 'right',
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          color: theme.textDim, lineHeight: 1.8,
        }}>
          <div style={{ padding: '16px 8px 16px 0' }}>
            {yaml.split("\n").map((_, i) => (
              <div key={i} style={{ height: '1.8em' }}>{i + 1}</div>
            ))}
          </div>
        </div>
        {/* YAML content — scrollable */}
        <pre
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            flex: 1, background: theme.yamlBg,
            border: `1px solid ${theme.border}`, borderLeft: 'none',
            borderRadius: '0 10px 10px 0',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5,
            lineHeight: 1.8, padding: "16px 20px",
            color: theme.yamlText, overflow: "auto", margin: 0,
            whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
            wordBreak: wordWrap ? 'break-all' : 'normal',
          }}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>

      {/* kubectl quick commands */}
      <div style={{ borderTop: `1px solid ${theme.border}`, padding: "8px 16px", background: theme.bgCard }}>
        <div style={{ color: theme.textDim, fontSize: 9.5, marginBottom: 5, letterSpacing: "0.1em" }}>QUICK COMMANDS — click to copy</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[`kubectl apply -f file.yaml`, `kubectl get ${resourceType?.toLowerCase().split(/[\s&]/)[0] || "pod"} -n default`, `kubectl describe ${resourceType?.toLowerCase().split(/[\s&]/)[0] || "pod"} <name>`].map((cmd, i) => (
            <span key={i} onClick={() => navigator.clipboard.writeText(cmd).then(() => showToast('Command copied!', 'success'))} title="Click to copy"
              style={{ color: theme.textDim, fontSize: 11, cursor: "pointer", transition: "color 0.15s" }}
              onMouseEnter={e => e.target.style.color = "#6366f1"}
              onMouseLeave={e => e.target.style.color = theme.textDim}>
              <span style={{ color: "#4ade80" }}>$</span> {cmd}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// SECTION HEADER (collapsible)
// ───────────────────────────────────────────────────────────────────
export function Section({ title, children, theme, defaultOpen = true, onRemove }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ 
      marginBottom: 24, 
      background: theme.bgCard, 
      border: `1px solid ${theme.border}`, 
      borderRadius: 12, 
      padding: "20px 24px",
      boxShadow: theme.isDark ? '0 10px 25px -5px rgba(0,0,0,0.5)' : '0 10px 25px -5px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: open ? 16 : 0 }}>
        <button onClick={() => setOpen(!open)} style={{ flex: 1, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: 0 }}>
          <span style={{ color: theme.textDim, fontSize: 11 }}>{open ? "▼" : "▶"}</span>
          <span style={{ color: theme.text, fontSize: 14, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>{title}</span>
        </button>
        {onRemove && (
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} title="Remove section fields" style={{ background: "transparent", border: "none", color: theme.textDim, cursor: "pointer", fontSize: 18, padding: "0 8px", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = theme.error} onMouseLeave={e => e.target.style.color = theme.textDim}>×</button>
        )}
      </div>
      {open && <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// FIELD GROUP (label + input + optional hint)
// ───────────────────────────────────────────────────────────────────
export function FieldGroup({ label, required, hint, children, theme }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Label required={required} theme={theme}>{label}</Label>
      {children}
      {hint && <div style={{ color: theme.textDim, fontSize: 11.5, marginTop: 2, lineHeight: 1.4 }}>{hint}</div>}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// YAML IMPORTER
// ───────────────────────────────────────────────────────────────────
export function YAMLImporter({ onImport, theme }) {
  const [text, setText] = useState("");
  const [error, setError] = useState(null);

  const handleParse = (yamlStr) => {
    try {
      setError(null);
      if (!yamlStr.trim()) throw new Error("YAML is empty");

      // Split on document separators to get per-doc raw strings
      // Keep comment blocks before each doc so nothing is lost
      const rawDocStrings = yamlStr
        .split(/^---\s*$/m)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Parse all documents at once (handles both array results and object results)
      const docs = yaml.loadAll(yamlStr).filter(d => Boolean(d) && typeof d === "object");
      if (!docs.length) throw new Error("No valid YAML documents found");

      const parsedDocs = docs.map((rawDoc, i) => {
        const kindMatch = detectKindFromParsed(rawDoc);
        // Match raw string to parsed doc by index (same order as loadAll)
        // Find the raw string that corresponds to this parsed object
        const rawYaml = rawDocStrings[i] || yaml.dump(rawDoc, { indent: 2, lineWidth: -1, noRefs: true });
        return {
          kind: rawDoc?.kind || "Unknown",
          isKnownKind: !!kindMatch,
          formData: kindMatch ? yamlToFormState(kindMatch, rawDoc) : rawDoc,
          rawDoc,
          rawYaml,
        };
      });
      onImport(parsedDocs);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target.result;
      setText(content);
      handleParse(content);
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16, background: theme.bgCard, borderRadius: 8, border: `1px solid ${theme.border}` }}>
      <div>
        <h3 style={{ margin: 0, color: theme.text, fontSize: 16, marginBottom: 4 }}>Import YAML</h3>
        <p style={{ margin: 0, color: theme.textDim, fontSize: 13, lineHeight: 1.4 }}>
          Paste Kubernetes YAML or upload a file. All fields are preserved exactly — no conversion, no data loss.
          Supports multi-document (<code>---</code>) bundles and any Kubernetes resource type.
        </p>
      </div>

      <input
        type="file"
        accept=".yaml,.yml,.txt"
        onChange={handleFileChange}
        style={{
          fontSize: 13, color: theme.text,
          background: theme.bgInput, border: `1px dashed ${theme.border}`,
          padding: "12px 10px", borderRadius: 6, cursor: "pointer"
        }}
      />

      <Textarea
        value={text}
        onChange={setText}
        placeholder={"apiVersion: apps/v1\nkind: Deployment\n---\napiVersion: v1\nkind: Service\n..."}
        theme={theme}
        rows={8}
      />

      {error && (
        <div style={{ color: "#f87171", background: "rgba(248,113,113,0.1)", padding: "10px 12px", borderRadius: 6, fontSize: 13, border: "1px solid rgba(248,113,113,0.3)" }}>
          <strong>Error parsing YAML:</strong> {error}
        </div>
      )}

      <Btn onClick={() => handleParse(text)} theme={theme} style={{ background: theme.accent, color: "#fff", padding: "10px 0" }}>
        📥 Import / Parse YAML
      </Btn>
    </div>
  );
}


// ───────────────────────────────────────────────────────────────────
// GENERIC RESOURCE EDITOR (For Unknown YAML Kinds)
// ───────────────────────────────────────────────────────────────────
export function GenericResourceEditor({ value, onChange, theme, path = [] }) {
  if (value === null || value === undefined) return null;

  if (Array.isArray(value)) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: path.length ? 12 : 0, borderLeft: path.length ? `1px solid ${theme.border}` : "none" }}>
        {value.map((item, idx) => (
          <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <GenericResourceEditor
                value={item}
                onChange={newVal => {
                  const arr = [...value];
                  arr[idx] = newVal;
                  onChange(arr);
                }}
                theme={theme}
                path={[...path, idx]}
              />
            </div>
            <button onClick={() => onChange(value.filter((_, i) => i !== idx))} title="Remove item"
              style={{ background: "transparent", border: "none", color: theme.error, cursor: "pointer", fontSize: 16 }}>×</button>
          </div>
        ))}
        <button onClick={() => onChange([...value, ""])}
          style={{ alignSelf: "flex-start", background: "transparent", border: `1px dashed ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: "pointer", fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", padding: "6px" }}>+ Add Item</button>
      </div>
    );
  }

  if (typeof value === "object") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {Object.entries(value).map(([k, v]) => {
          if (v && typeof v === "object" && !Array.isArray(v)) {
            return (
              <Section key={k} title={k} theme={theme} defaultOpen={false} onRemove={() => { const copy = { ...value }; delete copy[k]; onChange(copy); }}>
                <GenericResourceEditor value={v} onChange={newVal => onChange({ ...value, [k]: newVal })} theme={theme} path={[...path, k]} />
              </Section>
            );
          }
          return (
            <FieldGroup key={k} label={k} theme={theme}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <GenericResourceEditor value={v} onChange={newVal => onChange({ ...value, [k]: newVal })} theme={theme} path={[...path, k]} />
                </div>
                <button onClick={() => { const copy = { ...value }; delete copy[k]; onChange(copy); }} title="Remove field"
                  style={{ background: "transparent", border: "none", color: theme.error, cursor: "pointer", fontSize: 16 }}>×</button>
              </div>
            </FieldGroup>
          );
        })}
      </div>
    );
  }

  // Primitive
  return (
    <Input
      value={String(value)}
      onChange={onChange}
      theme={theme}
      style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
    />
  );
}

// ───────────────────────────────────────────────────────────────────
// IMPORTED RESOURCE CARD
// ───────────────────────────────────────────────────────────────────
export function ImportedResourceCard({ kind, isKnown, onDelete, rawYaml = "", rawDoc, onRawDocChange, theme }) {
  const [isOpen, setIsOpen] = useState(true);
  const [viewMode, setViewMode] = useState("raw"); // "raw" | "visual"
  const [editedYaml, setEditedYaml] = useState(rawYaml || "");
  const [parseError, setParseError] = useState(null);
  const { showToast } = useToast();

  // Keep editedYaml in sync when rawYaml prop changes (e.g. on initial import)
  React.useEffect(() => {
    setEditedYaml(rawYaml || "");
    setParseError(null);
  }, [rawYaml]);

  const handleYamlChange = (newText) => {
    setEditedYaml(newText);
    // Pass both the parsed object (for visual editor) AND the raw text (for lossless download)
    try {
      const parsed = yaml.load(newText);
      if (parsed && typeof parsed === "object") {
        setParseError(null);
        onRawDocChange?.(parsed, newText);  // 2nd arg = raw text preserves quotes+comments
      }
    } catch (e) {
      setParseError(e.message);
      // Still update the raw text even if YAML is invalid — user may be mid-edit
      onRawDocChange?.(rawDoc, newText);
    }
  };

  const meta = RESOURCE_META[kind];

  return (
    <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 8, overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{ padding: "10px 16px", borderBottom: isOpen ? `1px solid ${theme.border}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", background: "rgba(0,0,0,0.15)" }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", color: theme.textMuted, fontSize: 12 }}>▶</span>
          <span style={{ fontSize: 14 }}>{meta?.icon || "📄"}</span>
          <span style={{ fontWeight: 600, color: meta?.color || theme.accent, fontSize: 14 }}>{kind}</span>
          {rawDoc?.metadata?.name && (
            <span style={{ color: theme.textDim, fontSize: 11 }}>· {rawDoc.metadata.name}</span>
          )}
          {rawDoc?.metadata?.namespace && rawDoc.metadata.namespace !== "default" && (
            <span style={{ background: theme.bgInput, color: theme.textMuted, fontSize: 10, padding: "1px 5px", borderRadius: 3, border: `1px solid ${theme.border}` }}>{rawDoc.metadata.namespace}</span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Remove Resource"
          style={{ background: "transparent", border: "none", color: theme.error, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 4px" }}
        >×</button>
      </div>

      {isOpen && (
        <div>
          {/* View mode toggle */}
          <div style={{ display: "flex", borderBottom: `1px solid ${theme.border}`, background: "rgba(0,0,0,0.1)" }}>
            <button
              onClick={() => setViewMode("raw")}
              style={{ flex: 1, padding: "7px", background: viewMode === "raw" ? `${theme.accent}20` : "transparent", border: "none", borderRight: `1px solid ${theme.border}`, color: viewMode === "raw" ? theme.accent : theme.textMuted, cursor: "pointer", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: viewMode === "raw" ? 700 : 400 }}
            >📄 Raw YAML</button>
            <button
              onClick={() => setViewMode("visual")}
              style={{ flex: 1, padding: "7px", background: viewMode === "visual" ? `${theme.accent}20` : "transparent", border: "none", color: viewMode === "visual" ? theme.accent : theme.textMuted, cursor: "pointer", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: viewMode === "visual" ? 700 : 400 }}
            >🎛 Visual Editor</button>
          </div>

          {/* Content */}
          <div style={{ padding: viewMode === "raw" ? 0 : 16 }}>
            {viewMode === "raw" ? (
              <div style={{ position: "relative" }}>
                <textarea
                  value={editedYaml}
                  onChange={e => handleYamlChange(e.target.value)}
                  spellCheck={false}
                  style={{
                    width: "100%", minHeight: 200, maxHeight: 480, resize: "vertical",
                    background: theme.yamlBg, color: "#a0f0c0",
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.7,
                    border: "none", outline: "none", padding: "14px 18px",
                    boxSizing: "border-box", display: "block",
                  }}
                />
                {parseError && (
                  <div style={{ background: "rgba(248,113,113,0.12)", borderTop: "1px solid rgba(248,113,113,0.3)", color: "#f87171", fontSize: 11, padding: "6px 14px", fontFamily: "'JetBrains Mono', monospace" }}>
                    ⚠️ YAML parse error: {parseError}
                  </div>
                )}
                <button
                  onClick={() => navigator.clipboard.writeText(editedYaml).then(() => showToast('YAML copied!', 'success'))}
                  style={{ position: "absolute", top: 8, right: 10, background: "rgba(0,0,0,0.4)", border: `1px solid ${theme.border}`, borderRadius: 5, color: theme.textMuted, cursor: "pointer", fontSize: 10, padding: "3px 8px", fontFamily: "'JetBrains Mono', monospace" }}
                >📋 Copy</button>
              </div>
            ) : (
              rawDoc ? (
                <GenericResourceEditor
                  value={rawDoc}
                  onChange={(newDoc) => onRawDocChange?.(newDoc, null)}  /* null = caller recomputes text */
                  theme={theme}
                />
              ) : (
                <div style={{ color: theme.textDim, fontSize: 12, padding: 8 }}>No parsed data available. Use Raw YAML view to edit.</div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// QUICK CREATE MODAL — per-resource guided creation wizard
// ───────────────────────────────────────────────────────────────────
const QUICK_CREATE_FIELDS = {
  Deployment: [
    { key: "name", label: "App name", placeholder: "my-app", required: true },
    { key: "image", label: "Container image", placeholder: "nginx:latest", required: true },
    { key: "replicas", label: "Replicas", placeholder: "2", type: "number" },
    { key: "namespace", label: "Namespace", placeholder: "default" },
    { key: "port", label: "Container port", placeholder: "80" },
  ],
  Service: [
    { key: "name", label: "Service name", placeholder: "my-service", required: true },
    { key: "selector", label: "Target app (selector)", placeholder: "my-app", required: true },
    { key: "port", label: "Port", placeholder: "80" },
    { key: "targetPort", label: "Target port", placeholder: "80" },
    { key: "serviceType", label: "Type", type: "select", options: ["ClusterIP", "NodePort", "LoadBalancer"], placeholder: "ClusterIP" },
  ],
  Ingress: [
    { key: "name", label: "Ingress name", placeholder: "my-ingress", required: true },
    { key: "host", label: "Hostname", placeholder: "app.example.com", required: true },
    { key: "path", label: "Path", placeholder: "/" },
    { key: "serviceName", label: "Backend Service", placeholder: "my-service" },
    { key: "namespace", label: "Namespace", placeholder: "default" },
  ],
  ConfigMap: [
    { key: "name", label: "ConfigMap name", placeholder: "my-config", required: true },
    { key: "namespace", label: "Namespace", placeholder: "default" },
    { key: "key1", label: "Key 1", placeholder: "APP_ENV" },
    { key: "val1", label: "Value 1", placeholder: "production" },
    { key: "key2", label: "Key 2", placeholder: "LOG_LEVEL" },
    { key: "val2", label: "Value 2", placeholder: "info" },
  ],
  Secret: [
    { key: "name", label: "Secret name", placeholder: "my-secret", required: true },
    { key: "namespace", label: "Namespace", placeholder: "default" },
    { key: "key1", label: "Key 1", placeholder: "PASSWORD" },
    { key: "val1", label: "Value 1", placeholder: "changeme" },
  ],
  CronJob: [
    { key: "name", label: "Job name", placeholder: "nightly-task", required: true },
    { key: "schedule", label: "Schedule (cron)", placeholder: "0 2 * * *", required: true },
    { key: "image", label: "Container image", placeholder: "my-worker:latest", required: true },
    { key: "command", label: "Command", placeholder: "node worker.js" },
    { key: "namespace", label: "Namespace", placeholder: "default" },
  ],
  HPA: [
    { key: "name", label: "HPA name", placeholder: "my-hpa", required: true },
    { key: "target", label: "Target Deployment", placeholder: "my-app", required: true },
    { key: "minReplicas", label: "Min replicas", placeholder: "2" },
    { key: "maxReplicas", label: "Max replicas", placeholder: "10" },
    { key: "cpuTarget", label: "CPU target %", placeholder: "70" },
  ],
  Namespace: [
    { key: "name", label: "Namespace name", placeholder: "my-namespace", required: true },
  ],
  PersistentVolumeClaim: [
    { key: "name", label: "PVC name", placeholder: "my-pvc", required: true },
    { key: "storage", label: "Storage size", placeholder: "10Gi", required: true },
    { key: "storageClass", label: "Storage class", placeholder: "standard" },
    { key: "namespace", label: "Namespace", placeholder: "default" },
  ],
};

// Default fields for unknown kinds
const DEFAULT_FIELDS = [
  { key: "name", label: "Name", placeholder: "my-resource", required: true },
  { key: "namespace", label: "Namespace", placeholder: "default" },
];

export function QuickCreateModal({ kind, onSubmit, onClose, theme }) {
  const meta = RESOURCE_META[kind] || {};
  const fields = QUICK_CREATE_FIELDS[kind] || DEFAULT_FIELDS;
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(f => [f.key, f.placeholder || ""])));
  const [errors, setErrors] = useState({});

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = () => {
    const newErrors = {};
    fields.filter(f => f.required).forEach(f => {
      if (!values[f.key]?.trim()) newErrors[f.key] = "Required";
    });
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    onSubmit(kind, values);
    onClose();
  };

  const set = (key, val) => {
    setValues(v => ({ ...v, [key]: val }));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}
    >
      <div style={{ background: theme.bgCard, border: `1px solid ${meta.color || theme.accent}50`, borderRadius: 16, width: "min(460px, 95vw)", maxHeight: "85vh", overflow: "auto", boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px ${(meta.color || theme.accent)}20`, animation: "fadeUp 0.2s ease" }}>
        {/* Header */}
        <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>{meta.icon || "📄"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: meta.color || theme.accent, fontSize: 16 }}>Quick Create {kind}</div>
            <div style={{ color: theme.textDim, fontSize: 10.5, marginTop: 2 }}>{meta.desc || "Fill in the essentials — you can customize more after."}</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: theme.textMuted, cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        {/* Form */}
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {fields.map(f => (
            <div key={f.key}>
              <label style={{ color: theme.textMuted, fontSize: 10.5, display: "block", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em" }}>
                {f.label.toUpperCase()}{f.required && <span style={{ color: "#f87171", marginLeft: 3 }}>*</span>}
              </label>
              {f.type === "select" ? (
                <select value={values[f.key]} onChange={e => set(f.key, e.target.value)}
                  style={{ width: "100%", background: theme.bgInput, border: `1px solid ${errors[f.key] ? "#f87171" : theme.border}`, borderRadius: 7, color: theme.text, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", padding: "8px 10px", outline: "none" }}>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  value={values[f.key]}
                  onChange={e => set(f.key, e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
                  placeholder={f.placeholder}
                  type={f.type || "text"}
                  style={{ width: "100%", background: theme.bgInput, border: `1px solid ${errors[f.key] ? "#f87171" : theme.border}`, borderRadius: 7, color: theme.text, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", padding: "8px 10px", outline: "none" }}
                />
              )}
              {errors[f.key] && <div style={{ color: "#f87171", fontSize: 10, marginTop: 3 }}>{errors[f.key]}</div>}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px 18px", borderTop: `1px solid ${theme.border}`, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, cursor: "pointer", fontSize: 12, padding: "8px 16px", fontFamily: "'JetBrains Mono', monospace" }}>Cancel</button>
          <button onClick={handleSubmit}
            style={{ background: `linear-gradient(135deg, ${meta.color || "#4f46e5"}, ${meta.color ? meta.color + "cc" : "#7c3aed"})`, border: "none", borderRadius: 8, color: "white", cursor: "pointer", fontSize: 12, fontWeight: 700, padding: "8px 20px", fontFamily: "'JetBrains Mono', monospace", boxShadow: `0 4px 12px ${(meta.color || "#4f46e5")}40` }}>
            ⚡ Create {kind}
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// AI CHIPS — reusable row of quick-action AI buttons
// ───────────────────────────────────────────────────────────────────
export function AIChips({ chips, onAskAI, theme }) {
  if (!onAskAI) return null;
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", padding: "6px 8px", borderTop: `1px solid ${theme.border}`, background: "rgba(99,102,241,0.04)" }}>
      <span style={{ color: theme.textDim, fontSize: 9.5, alignSelf: "center", marginRight: 2, letterSpacing: "0.05em" }}>⚡ AI:</span>
      {chips.map(({ label, prompt }) => (
        <button
          key={label}
          onClick={() => onAskAI(prompt)}
          style={{
            background: "transparent",
            border: `1px solid ${theme.accent}40`,
            borderRadius: 20,
            color: theme.accent,
            cursor: "pointer",
            fontSize: 10,
            padding: "3px 10px",
            fontFamily: "'JetBrains Mono', monospace",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.target.style.background = `${theme.accent}20`; e.target.style.borderColor = theme.accent; }}
          onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.borderColor = `${theme.accent}40`; }}
        >{label}</button>
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// FLOATING AI PANEL — always-visible AI bubble + expandable chat
// ───────────────────────────────────────────────────────────────────
export function FloatingAIPanel({ isOpen, onToggle, messages, loading, input, setInput, onSend, onClear, theme, aiEnabled }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const renderMessage = (content) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const lang = (part.match(/^```(\w*)/) || [])[1] || "";
        const code = part.replace(/^```\w*\n?/, "").replace(/```$/, "");
        return (
          <div key={i} style={{ position: "relative", margin: "6px 0" }}>
            {lang && (
              <div style={{ background: "#1a1a2e", borderRadius: "6px 6px 0 0", padding: "3px 12px", fontSize: 9.5, color: "#6366f1", fontFamily: "'JetBrains Mono', monospace", borderBottom: "1px solid #2a2a40", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{lang}</span>
              </div>
            )}
            <pre style={{ background: "#0f0f1a", border: `1px solid ${theme.border}`, borderRadius: lang ? "0 0 6px 6px" : 6, padding: "10px 40px 10px 12px", margin: 0, fontSize: 11, color: "#a0f0c0", overflow: "auto", fontFamily: "'JetBrains Mono', monospace" }}>{code}</pre>
            <button
              onClick={(e) => {
                navigator.clipboard.writeText(code);
                const btn = e.currentTarget;
                const orig = btn.textContent;
                btn.textContent = "✅";
                setTimeout(() => { btn.textContent = orig; }, 1500);
              }}
              title="Copy code"
              style={{ position: "absolute", top: lang ? 28 : 6, right: 6, background: "rgba(99,102,241,0.2)", border: "1px solid #6366f140", borderRadius: 5, color: "#818cf8", cursor: "pointer", fontSize: 10, padding: "2px 7px", fontFamily: "'JetBrains Mono', monospace", transition: "all 0.15s" }}
            >📋</button>
          </div>
        );
      }
      return <span key={i} style={{ whiteSpace: "pre-wrap" }}>{part}</span>;
    });
  };

  const quickActions = [
    "Review my current YAML for issues",
    "What security improvements can I make?",
    "Explain this Kubernetes resource",
    "How do I debug CrashLoopBackOff?",
  ];

  if (!aiEnabled && isOpen) {
    return (
      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 2000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, pointerEvents: "none" }}>
        <div style={{
          pointerEvents: "all",
          width: "min(380px, 92vw)", padding: "20px",
          background: theme.bgCard,
          border: `1px solid ${theme.accent}50`,
          borderRadius: 16,
          boxShadow: `0 8px 40px rgba(99,102,241,0.25)`,
          color: theme.text, fontSize: 13, textAlign: "center"
        }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>🔒</div>
          <div style={{ fontWeight: 800, color: theme.accent, marginBottom: 8 }}>AI Not Configured</div>
          <div style={{ color: theme.textMuted, fontSize: 11.5 }}>
            To use the AI assistant, please configure the <code>OPENROUTER_API_KEY</code> on the server.
          </div>
          <Btn onClick={onToggle} theme={theme} variant="ghost" style={{ marginTop: 16, width: "100%" }}>Close</Btn>
        </div>
        <button onClick={onToggle} style={{ pointerEvents: "all", width: 52, height: 52, borderRadius: "50%", background: "#4f46e5", border: "2px solid #818cf8", color: "white", cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>🤖</button>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 2000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, pointerEvents: "none" }}>

      {/* Expanded chat panel */}
      {isOpen && (
        <div style={{
          pointerEvents: "all",
          width: "min(380px, 92vw)", height: "min(560px, 80vh)",
          background: theme.bgCard,
          border: `1px solid ${theme.accent}50`,
          borderRadius: 16,
          boxShadow: `0 8px 40px rgba(99,102,241,0.25), 0 2px 8px rgba(0,0,0,0.6)`,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "fadeUp 0.2s ease",
        }}>
          {/* Panel header */}
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.08)", flexShrink: 0 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite", flexShrink: 0 }} />
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#818cf8", fontSize: 13, flex: 1 }}>🤖 K8s AI Assistant</span>
            <button onClick={onClear} title="Clear chat" style={{ background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 5, color: theme.textMuted, cursor: "pointer", fontSize: 10, padding: "2px 7px" }}>Clear</button>
            <button onClick={onToggle} title="Minimize" style={{ background: "transparent", border: "none", color: theme.textMuted, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 2px" }}>×</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "85%", padding: "8px 12px", borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: msg.role === "user" ? `${theme.accent}25` : theme.bgInput, border: `1px solid ${msg.role === "user" ? theme.accent + "40" : theme.border}`, color: theme.text, fontSize: 12, lineHeight: 1.65 }}>
                  {renderMessage(msg.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex" }}>
                <div style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: "12px 12px 12px 2px", padding: "10px 14px", display: "flex", gap: 4 }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#6366f1", animation: `pulse 1s ${i * 0.2}s infinite` }} />)}
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          <div style={{ padding: "6px 10px", borderTop: `1px solid ${theme.border}`, display: "flex", gap: 4, flexWrap: "wrap", flexShrink: 0 }}>
            {quickActions.map(q => (
              <button key={q} onClick={() => setInput(q)}
                style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 20, color: theme.textMuted, cursor: "pointer", fontSize: 9.5, padding: "3px 9px", fontFamily: "'JetBrains Mono', monospace", transition: "all 0.15s" }}
                onMouseEnter={e => { e.target.style.borderColor = "#6366f1"; e.target.style.color = "#818cf8"; }}
                onMouseLeave={e => { e.target.style.borderColor = theme.border; e.target.style.color = theme.textMuted; }}
              >{q}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "8px 10px", borderTop: `1px solid ${theme.border}`, display: "flex", gap: 6, flexShrink: 0 }}>
            <textarea
              className="ai-panel-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
              placeholder="Ask anything about K8s... (Enter to send, Shift+Enter for newline)"
              style={{ flex: 1, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, padding: "8px 10px", outline: "none", resize: "none", height: 44 }}
            />
            <button
              onClick={onSend}
              disabled={loading || !input.trim()}
              style={{ background: loading || !input.trim() ? theme.border : "linear-gradient(135deg,#4f46e5,#7c3aed)", border: "none", borderRadius: 8, color: "white", cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontSize: 16, padding: "0 12px", flexShrink: 0 }}
            >{loading ? "⏳" : "➤"}</button>
          </div>
        </div>
      )}

      {/* Always-visible bubble */}
      <button
        onClick={onToggle}
        title={isOpen ? "Minimize AI" : "Open AI Assistant"}
        style={{
          pointerEvents: "all",
          width: 52, height: 52,
          borderRadius: "50%",
          background: isOpen ? "#4f46e5" : "linear-gradient(135deg,#4f46e5,#7c3aed)",
          border: `2px solid ${isOpen ? "#818cf8" : "#6366f180"}`,
          boxShadow: `0 0 ${isOpen ? 20 : 14}px rgba(99,102,241,${isOpen ? 0.7 : 0.4})`,
          color: "white",
          cursor: "pointer",
          fontSize: 22,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
          animation: isOpen ? "none" : "aiPulse 3s ease-in-out infinite",
          flexShrink: 0,
        }}
      >🤖</button>
    </div>
  );
}
