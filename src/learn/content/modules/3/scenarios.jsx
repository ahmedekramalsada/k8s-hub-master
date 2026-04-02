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
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Practical troubleshooting scenarios for Kubernetes Storage & Configurations.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-rose)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 1: PVC Stuck in Pending forever</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> You create a PVC and wait, but it never reaches `Bound`. Pods relying on it also sit in Pending with events reading `0/3 nodes available: 3 pod has unbound immediate PersistentVolumeClaims`.<br/>
                        <strong>Cause:</strong> You either requested a `storageClassName` that doesn't exist, asked for an `accessMode` that the underlying CSI driver doesn't support (like `ReadWriteMany` on EBS), or the volume provider is out of capacity.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <CodeBlock desc="Check the events on the exact PVC resource" command="kubectl describe pvc <pvc-name>" />
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '12px 0 0' }}>If it says `WaitForFirstConsumer`, it is intentional! The volume will only be provisioned (and Bound) when a Pod that schedules using it actually starts.</p>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-yellow)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 2: "Volume is already in use by another Pod"</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> During a rolling deployment, the new Pod spins up but immediately errors with `Multi-Attach error... Volume is already exclusively attached to one node`.<br/>
                        <strong>Cause:</strong> Block storage volumes (like AWS EBS, GCP PD) inherently only support `ReadWriteOnce`. This means they can only be attached to ONE EC2 Instance / Node at a time. The old pod on Node A is holding the lock, so the new pod on Node B cannot boot.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px 0' }}>Deployments with persistent disks should use the `Recreate` strategy so the old pod fully dies and yields the volume lock before the new pod attempts to start.</p>
                        <CodeBlock desc="Edit your deployment file to change the strategy" command="strategy: type: Recreate" />
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-blue)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 3: ConfigMap updates are not reflecting</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> You manually edit a ConfigMap to change a setting. You curl the app, but it is still using the old settings.<br/>
                        <strong>Cause:</strong> If a ConfigMap is mounted as Environment variables, changes NEVER sync automatically—the pod must be restarted. If it's mapped as a Volume mount, the kubelet periodically syncs changes (up to a 2-minute delay), but your *application natively* (Node.js, Java) might not automatically hot-reload the file.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px 0' }}>The safest approach is rolling out a restart. Some tools (like Kustomize Hash Appenders or Reloader) do this automatically.</p>
                        <CodeBlock desc="Manually trigger a fresh rolling restart" command="kubectl rollout restart deployment <deploy-name>" />
                    </div>
                </div>
            </div>
        </section>
    );
}
