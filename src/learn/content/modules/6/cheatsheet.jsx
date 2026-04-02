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
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 24 }}>📋</span> Helm & Kustomize Cheatsheet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Your quick reference guide to Helm commands, repos, upgrades, and Kustomize overlays.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-primary-light)', marginTop: 0, marginBottom: 16 }}>Helm Repos & Searching</h3>
                    <CodeBlock desc="Add a new repository locally" command="helm repo add bitnami https://charts.bitnami.com/bitnami" />
                    <CodeBlock desc="Fetch latest index (similar to apt-get update)" command="helm repo update" />
                    <CodeBlock desc="Search repo for a specific app" command="helm search repo postgres" />
                    <CodeBlock desc="Download chart files locally without installing" command="helm pull bitnami/postgresql --untar" />
                </div>
                
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-emerald)', marginTop: 0, marginBottom: 16 }}>Installing & Upgrading</h3>
                    <CodeBlock desc="Install a new release from a repo" command="helm install my-db bitnami/postgresql" />
                    <CodeBlock desc="Install using your custom values.yaml" command="helm install my-app ./chart -f my-values.yaml" />
                    <CodeBlock desc="Upgrade an existing release with new values" command="helm upgrade my-app ./chart --set image.tag=v2" />
                    <CodeBlock desc="Uninstall/Delete a release entirely" command="helm uninstall my-app" />
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-blue)', marginTop: 0, marginBottom: 16 }}>Debugging & History</h3>
                    <CodeBlock desc="List all installed releases" command="helm list -A" />
                    <CodeBlock desc="View revision history of a release" command="helm history my-app" />
                    <CodeBlock desc="Rollback to a specific revision instantly" command="helm rollback my-app 2" />
                    <CodeBlock desc="Dry-run: generate YAML without creating" command="helm template my-app ./chart" />
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-rose)', marginTop: 0, marginBottom: 16 }}>Kustomize (Built-in to Kubectl)</h3>
                    <CodeBlock desc="Dry-run: Render merged output" command="kubectl kustomize ./overlays/prod" />
                    <CodeBlock desc="Apply the generated kustomization" command="kubectl apply -k ./overlays/prod" />
                    <CodeBlock desc="Delete cleanly exactly what was generated" command="kubectl delete -k ./overlays/prod" />
                </div>
            </div>
        </section>
    );
}
