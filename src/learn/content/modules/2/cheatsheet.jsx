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
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 24 }}>📋</span> Networking Cheatsheet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Your quick reference guide to Services, Ingress, and DNS commands.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-primary-light)', marginTop: 0, marginBottom: 16 }}>Services & Endpoints</h3>
                    <CodeBlock desc="Get all services with IP info" command="kubectl get svc -o wide" />
                    <CodeBlock desc="Expose a running deployment" command="kubectl expose deploy web --port=80" />
                    <CodeBlock desc="List Endpoints resolving to a Service" command="kubectl get endpoints <svc-name>" />
                    <CodeBlock desc="Manually change Service type" command={`kubectl patch svc web -p '{"spec": {"type": "LoadBalancer"}}'`} />
                </div>
                
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-emerald)', marginTop: 0, marginBottom: 16 }}>Ingress</h3>
                    <CodeBlock desc="List Ingress resources" command="kubectl get ingress" />
                    <CodeBlock desc="Describe routing rules" command="kubectl describe ingress <name>" />
                    <CodeBlock desc="Check Ingress Controller Logs (NGINX)" command="kubectl logs -n ingress-nginx deploy/ingress-nginx-controller" />
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-blue)', marginTop: 0, marginBottom: 16 }}>Tinkering & Port-Forwarding</h3>
                    <CodeBlock desc="Forward host localhost:8080 to Service" command="kubectl port-forward svc/<svc> 8080:80" />
                    <CodeBlock desc="Forward localhost to a specific Pod" command="kubectl port-forward pod/<pod> 8080:80" />
                    <CodeBlock desc="Start a disposable DNS test pod" command="kubectl run -it --rm dnstest --image=busybox -- sh" />
                    <CodeBlock desc="Query DNS inside that pod" command="nslookup <svc-name>" />
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-rose)', marginTop: 0, marginBottom: 16 }}>Network Policies</h3>
                    <CodeBlock desc="List network policies" command="kubectl get networkpolicy" />
                    <CodeBlock desc="Read egress/ingress rules" command="kubectl describe networkpolicy <name>" />
                    <p style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>* Note: Network policies require a compatible CNI (like Calico or Cilium) to actually be enforced, otherwise they are silently ignored by default Flannel.</p>
                </div>
            </div>
        </section>
    );
}
