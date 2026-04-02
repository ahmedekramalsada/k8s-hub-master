import React, { useState } from 'react';

function CodeBlock({ command, desc }) {
    const [copied, setCopied] = useState(false);
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '10px 16px', borderRadius: 6, marginBottom: 8, border: '1px solid var(--border-subtle)' }}>
            <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{desc}</div>
                <code style={{ fontFamily: 'var(--font-mono)', color: '#a0f0c0', fontSize: 13 }}>$ {command}</code>
            </div>
            <button 
                onClick={() => { navigator.clipboard.writeText(command); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--color-primary-light)', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 11, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
            >
                {copied ? '✓ COPIED' : 'COPY'}
            </button>
        </div>
    );
}

export default function CheatsheetContent() {
    return (
        <section className="content-block" style={{ maxWidth: 900 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 24 }}>📋</span> Security & Policies Cheatsheet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Your quick reference guide to RBAC, ServiceAccounts, and auth checking.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-primary-light)', marginTop: 0, marginBottom: 16 }}>RBAC Creation (Roles & Bindings)</h3>
                    <CodeBlock desc="Create a Role with fine-grained API permissions" command="kubectl create role reader --verb=get,list,watch --resource=pods" />
                    <CodeBlock desc="Bind a Role to a User" command="kubectl create rolebinding user-read --role=reader --user=jane" />
                    <CodeBlock desc="Bind a Role to a ServiceAccount" command="kubectl create rolebinding sa-read --role=reader --serviceaccount=default:app-sa" />
                    <CodeBlock desc="Create a ClusterRole (Global)" command="kubectl create clusterrole viewer --verb=get,list,watch --resource=nodes" />
                </div>
                
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-emerald)', marginTop: 0, marginBottom: 16 }}>Authentication Checks (can-i)</h3>
                    <CodeBlock desc="Check if you (the current config) can create Deployments" command="kubectl auth can-i create deployments" />
                    <CodeBlock desc="Check if you can do EVERYTHING in a namespace" command="kubectl auth can-i '*' '*' -n my-ns" />
                    <CodeBlock desc="Impersonate a User to test their exact permissions" command="kubectl auth can-i list secrets --as=jane" />
                    <CodeBlock desc="Impersonate a ServiceAccount to test its exact permissions" command="kubectl auth can-i delete pods --as=system:serviceaccount:default:app-sa" />
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-blue)', marginTop: 0, marginBottom: 16 }}>Service Accounts</h3>
                    <CodeBlock desc="List Service accounts" command="kubectl get sa" />
                    <CodeBlock desc="Generate a fresh, long-lived token manually (K8s 1.24+)" command="kubectl create token default" />
                    <p style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>* As of Kubernetes 1.24, ServiceAccount Secret tokens are no longer auto-generated endlessly. Use `kubectl create token` or the TokenRequest API for ephemeral, secure injections.</p>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-rose)', marginTop: 0, marginBottom: 16 }}>Pod Security Assessment</h3>
                    <CodeBlock desc="Label a namespace to enforce Restricted Pod Security" command="kubectl label ns default pod-security.kubernetes.io/enforce=restricted" />
                    <CodeBlock desc="Label a namespace just to Warn (dry-run)" command="kubectl label ns default pod-security.kubernetes.io/warn=restricted" />
                </div>
            </div>
        </section>
    );
}
