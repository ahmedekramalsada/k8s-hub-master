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
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 24 }}>📋</span> Kubernetes Core Cheatsheet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Your quick reference guide to the most essential kubectl commands for deploying and managing core resources.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-primary-light)', marginTop: 0, marginBottom: 16 }}>Retrieving Info (Get/Describe)</h3>
                    <CodeBlock desc="List all pods in current namespace" command="kubectl get pods" />
                    <CodeBlock desc="Watch pods live" command="kubectl get pods -w" />
                    <CodeBlock desc="List everything in all namespaces" command="kubectl get all -A" />
                    <CodeBlock desc="View detailed events and state of a pod" command="kubectl describe pod <name>" />
                    <CodeBlock desc="Show pod labels" command="kubectl get pods --show-labels" />
                </div>
                
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-emerald)', marginTop: 0, marginBottom: 16 }}>Debugging</h3>
                    <CodeBlock desc="View container logs" command="kubectl logs <pod-name>" />
                    <CodeBlock desc="Stream container logs live" command="kubectl logs -f <pod-name>" />
                    <CodeBlock desc="Exec an interactive shell in a pod" command="kubectl exec -it <pod> -- sh" />
                    <CodeBlock desc="Port-forward a pod to local machine" command="kubectl port-forward pod/<pod> 8080:80" />
                    <CodeBlock desc="Copy file from local machine to pod" command="kubectl cp file.txt <pod>:/path/" />
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-blue)', marginTop: 0, marginBottom: 16 }}>Creation & Updates</h3>
                    <CodeBlock desc="Create resources from a file" command="kubectl apply -f manifest.yaml" />
                    <CodeBlock desc="Create from a directory of YAMLs" command="kubectl apply -f ./dir/" />
                    <CodeBlock desc="Imperatively create a deployment" command="kubectl create deploy web --image=nginx" />
                    <CodeBlock desc="Scale replicas" command="kubectl scale deploy/web --replicas=3" />
                    <CodeBlock desc="Generate YAML without creating" command="kubectl create deploy web --image=nginx --dry-run=client -o yaml" />
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-rose)', marginTop: 0, marginBottom: 16 }}>Namespaces & Contexts</h3>
                    <CodeBlock desc="Get all namespaces" command="kubectl get ns" />
                    <CodeBlock desc="Create a namespace" command="kubectl create ns my-project" />
                    <CodeBlock desc="Execute command in a specific namespace" command="kubectl get pods -n my-project" />
                    <CodeBlock desc="Change current default namespace" command="kubectl config set-context --current --namespace=my-project" />
                </div>
            </div>
        </section>
    );
}
