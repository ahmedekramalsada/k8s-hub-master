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
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Practical troubleshooting scenarios for Kubernetes Security and RBAC.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-rose)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 1: Forbidden (User cannot get Resource in API)</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> `Error from server (Forbidden): pods is forbidden: User "jane" cannot list resource "pods" in API group "" in the namespace "default"`.<br/>
                        <strong>Cause:</strong> The user 'jane' has no RoleBinding tying them to a Role that allows `list` on `pods` within the `default` namespace.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <CodeBlock desc="Check existing RoleBindings in the namespace" command="kubectl get rolebindings" />
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '12px 0 0 0' }}>If missing, create a Role with the exact verb/resource combo, and create a RoleBinding targeting `--user=jane`.</p>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-yellow)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 2: "SecurityContext constraint violations"</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> A Pod refuses to schedule, throwing an event saying: `pods "evil-pod" is forbidden: violates PodSecurity "restricted:latest"... allowPrivilegeEscalation != false`.<br/>
                        <strong>Cause:</strong> You labeled your Namespace to enforce the 'Restricted' Pod Security Standard. Your YAML omitted the required `allowPrivilegeEscalation: false` field in the `securityContext`.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px 0' }}>You must update the Deployment/Pod YAML. Specifically, under `containers: - securityContext:` add the missing fields mandated by the Restricted policy.</p>
                        <CodeBlock desc="Generate dry-run YAML to fix the securityContext" command="kubectl create deploy my-app --image=nginx --dry-run=client -o yaml > fix.yaml" />
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-blue)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 3: A Pod trying to curl the API Server is failing</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> Your custom controller or script running inside a Pod curls `https://kubernetes.default.svc` but gets a 403 Forbidden.<br/>
                        <strong>Cause:</strong> The Pod is using the `default` ServiceAccount, but in modern clusters the `default` account has absolutely zero RBAC permissions by default. It can authenticate, but it isn't authorized to do anything.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <CodeBlock desc="1. Determine which ServiceAccount the Pod currently uses" command="kubectl get pod <pod-name> -o yaml | grep serviceAccountName" />
                        <CodeBlock desc="2. Create a RoleBinding granting that ServiceAccount the needed power" command="kubectl create rolebinding pod-access --role=view --serviceaccount=default:default" />
                    </div>
                </div>
            </div>
        </section>
    );
}
