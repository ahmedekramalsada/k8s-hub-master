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
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 24 }}>📋</span> Storage Cheatsheet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Your quick reference guide to PersistentVolumes, StorageClasses, ConfigMaps, and Secrets.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-primary-light)', marginTop: 0, marginBottom: 16 }}>PersistentVolumes & Claims</h3>
                    <CodeBlock desc="List PersistentVolumes (Cluster scoped)" command="kubectl get pv" />
                    <CodeBlock desc="List PersistentVolumeClaims (Namespace scoped)" command="kubectl get pvc" />
                    <CodeBlock desc="Delete a stuck PVC manually (Warning: Data Loss)" command={`kubectl patch pvc my-pvc -p '{"metadata":{"finalizers":null}}'`} />
                </div>
                
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-emerald)', marginTop: 0, marginBottom: 16 }}>StorageClasses</h3>
                    <CodeBlock desc="List available StorageClasses" command="kubectl get sc" />
                    <CodeBlock desc="Check default StorageClass driver" command="kubectl describe sc" />
                    <p style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>* Any StorageClass labeled with 'storageclass.kubernetes.io/is-default-class: "true"' will automatically fulfill PVCs that don't specify a class.</p>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-blue)', marginTop: 0, marginBottom: 16 }}>ConfigMaps</h3>
                    <CodeBlock desc="Create ConfigMap from literal values" command="kubectl create configmap my-config --from-literal=key1=config1" />
                    <CodeBlock desc="Create ConfigMap from a file" command="kubectl create configmap config-file --from-file=app.conf" />
                    <CodeBlock desc="View contents of a ConfigMap" command="kubectl describe cm my-config" />
                    <CodeBlock desc="Output ConfigMap to cleanly readable YAML" command="kubectl get cm my-config -o yaml" />
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-rose)', marginTop: 0, marginBottom: 16 }}>Secrets</h3>
                    <CodeBlock desc="Create a generic Opaque secret" command="kubectl create secret generic db-pass --from-literal=password=123" />
                    <CodeBlock desc="Create a TLS secret (Cert/Key pair)" command="kubectl create secret tls certs --cert=tls.crt --key=tls.key" />
                    <CodeBlock desc="Encode a string using base64 safely" command="echo -n 'hello' | base64" />
                    <CodeBlock desc="Decode a base64 string from a Secret" command="echo 'aGVsbG8=' | base64 --decode" />
                </div>
            </div>
        </section>
    );
}
