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
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Practical troubleshooting scenarios for Kubernetes core workloads.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-rose)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 1: ImagePullBackOff / ErrImagePull</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> Your Pod refuses to start and is stuck in `ImagePullBackOff`.<br/>
                        <strong>Cause:</strong> The kubelet cannot fetch the container image. It could be a typo in the tag, invalid credentials for a private registry, or the image physically not existing.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <CodeBlock desc="First, check the Events to diagnose exactly why it failed" command="kubectl describe pod <pod-name>" />
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '12px 0' }}>If it says 'Unauthorized', verify your `imagePullSecrets` in the Deployment spec. If it says 'ManifestUnknown', you typed the wrong image tag.</p>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-yellow)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 2: CrashLoopBackOff</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> A Pod starts, immediately dies, and then Kubernetes keeps restarting it on a growing timeout.<br/>
                        <strong>Cause:</strong> The container application is throwing a fatal error and exiting. Common culprits: missing environment variables, missing ConfigMaps, or a syntax error in the code.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <CodeBlock desc="Check the logs of the DEAD container using the previous flag" command="kubectl logs <pod-name> --previous" />
                        <CodeBlock desc="If logs are empty, check if startup commands failed" command="kubectl describe pod <pod-name>" />
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-blue)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 3: Pod Stuck as Pending</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> You deployed a new application, but its pods are sitting in `Pending` state forever.<br/>
                        <strong>Cause:</strong> The kube-scheduler cannot find an eligible node. Either you ran out of CPU/Memory capacity, or you have strict `nodeSelectors`/`tolerations` that no node can satisfy.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <CodeBlock desc="Read the scheduler events" command="kubectl describe pod <pod-name>" />
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '12px 0 0 0' }}>Look for messages like `0/5 nodes are available: 5 Insufficient cpu` or `1 node(s) had taint {'{tier: frontend}'}, that the pod didn't tolerate`.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
