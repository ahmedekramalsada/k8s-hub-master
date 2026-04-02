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
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Practical troubleshooting scenarios for Kubernetes Advanced Workloads.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-rose)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 1: HPA reads {'<unknown>/50%'}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> You run `kubectl get hpa` and under TARGETS it says `{'<unknown>/50%'}`. The autoscaler never adds new pods even under load.<br/>
                        <strong>Cause:</strong> Either the `metrics-server` is not installed, or your Deployment Pods do NOT have CPU resources requested in their YAML.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <CodeBlock desc="1. Verify metrics-server status" command="kubectl top pods -n kube-system" />
                        <CodeBlock desc="2. Fix your deployment by adding a resource request limit" command="kubectl set resources deploy my-app --requests=cpu=100m" />
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '12px 0 0 0' }}>The HPA divides the actual usage by the requested usage to get the percentage. Without a `--requests=cpu=`, the math (x / 0) is impossible.</p>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-yellow)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 2: Job completes but generates 50 dead Pods</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> `kubectl get pods` shows a massive wall of pods named `my-job-xxxxx` all marked as `Error`. The Job itself is marked as Failed.<br/>
                        <strong>Cause:</strong> The container inside your Job crashed, so the Job Controller retried it until hitting the `backoffLimit` (default is 6 retries). The final state of failed pods is kept for debugging instead of instantly deleting.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px 0' }}>It is safe to delete the Job; doing so will instantly garbage-collect all of the dead pods.</p>
                        <CodeBlock desc="Review logs from the last failed attempt" command="kubectl logs $(kubectl get pods --selector=job-name=my-job -o jsonpath='{.items[0].metadata.name}')" />
                        <CodeBlock desc="Delete the Job (and its pods)" command="kubectl delete job my-job" />
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-blue)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 3: DaemonSet not scheduling on a new Node</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> You added a shiny new GPU Node to the cluster. Every other node has a `fluentd` log collector Pod, but the new Node doesn't.<br/>
                        <strong>Cause:</strong> The new Node likely has a `Taint` applied (e.g., `NoSchedule` for a specialized GPU node). By default, DaemonSet Pods still obey Taints and will refuse to schedule if they lack a matching `Toleration`.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <CodeBlock desc="Describe the new node and look at the Taints array" command="kubectl describe node <new-node-name>" />
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '12px 0 0 0' }}>Update your DaemonSet YAML to include an explicit `toleration` for that Taint key so the scheduler ignores it.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
