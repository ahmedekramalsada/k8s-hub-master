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

export default function ScenariosContent() {
    return (
        <section className="content-block" style={{ maxWidth: 900 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 24 }}>🎯</span> Real-World Scenarios</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Practical troubleshooting scenarios for Kubernetes Networking.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-rose)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 1: Service "Connection Refused"</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> You curl `http://my-service` and get `Connection Refused` immediately.<br/>
                        <strong>Cause:</strong> The DNS resolves the service properly, but the Service has zero healthy Pods attached to it. The Service's `selector` labels don't match your Pod labels, or all your Pods are failing readiness probes.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <CodeBlock desc="Check if the endpoints list is completely empty" command="kubectl get endpoints my-service" />
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '12px 0 0' }}>If Endpoints is `{'<none>'}`, compare the Service `selector` labels exactly against your Deployment `labels`.</p>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-yellow)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 2: Gateway Timeout (504) on Ingress</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> Browsing to your web app via a domain name loading through an Ingress spins for 60 seconds, then throws a 504 Gateway Timeout.<br/>
                        <strong>Cause:</strong> The Ingress Controller accepted the HTTP request successfully, but the backend Pod took too long to respond, or traffic is being silently dropped by a Network Policy between the Ingress NGINX Pod and your application Pod.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <CodeBlock desc="Check the logs of the Ingress Controller" command="kubectl logs -n ingress-nginx deploy/ingress-nginx-controller" />
                        <CodeBlock desc="If it's a network policy issue, trace applied policies" command="kubectl get networkpolicy -A" />
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-blue)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 3: Could Not Resolve Host (DNS Failure)</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> A Pod logs `mysql_connect(): php_network_getaddresses: getaddrinfo failed: Temporary failure in name resolution`.<br/>
                        <strong>Cause:</strong> The Pod cannot resolve `database.default.svc.cluster.local`. Either `CoreDNS` pods are crashing, their endpoints are missing, or the namespace/service name you used is incorrect.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <CodeBlock desc="Ensure CoreDNS is actually running in kube-system" command="kubectl get pods -n kube-system -l k8s-app=kube-dns" />
                        <CodeBlock desc="Exec into a disposable pod and test DNS manually" command="kubectl run -it --rm dns --image=busybox -- nslookup kubernetes.default" />
                    </div>
                </div>
            </div>
        </section>
    );
}
