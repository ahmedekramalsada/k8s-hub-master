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
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 24 }}>📋</span> Advanced Workloads Cheatsheet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Your quick reference guide to StatefulSets, DaemonSets, Jobs, CronJobs, and Autoscaling.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-primary-light)', marginTop: 0, marginBottom: 16 }}>StatefulSets & DaemonSets</h3>
                    <CodeBlock desc="Watch a StatefulSet scale up sequentially (web-0, web-1)" command="kubectl get pods -w -l app=nginx" />
                    <CodeBlock desc="List all DaemonSets (1 pod per node)" command="kubectl get ds -A" />
                    <CodeBlock desc="Verify what nodes a DaemonSet is running on" command="kubectl get pods -o wide -l app=fluentd" />
                </div>
                
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-emerald)', marginTop: 0, marginBottom: 16 }}>Jobs & Batch Processing</h3>
                    <CodeBlock desc="Quickly create a Job imperatively" command="kubectl create job my-job --image=busybox -- date" />
                    <CodeBlock desc="Check completions of a Job" command="kubectl get jobs" />
                    <CodeBlock desc="Manually trigger exactly one run of a CronJob" command="kubectl create job --from=cronjob/my-cron test-run" />
                    <CodeBlock desc="Suspend a running CronJob (stop scheduling)" command={`kubectl patch cronjob my-cron -p '{"spec":{"suspend":true}}'`} />
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-blue)', marginTop: 0, marginBottom: 16 }}>Horizontal Pod Autoscaler (HPA)</h3>
                    <CodeBlock desc="List autoscalers and their target thresholds" command="kubectl get hpa" />
                    <CodeBlock desc="Autoscale a deployment CPU > 50%" command="kubectl autoscale deploy web --min=2 --max=10 --cpu-percent=50" />
                    <CodeBlock desc="Describe why an HPA is scaling" command="kubectl describe hpa web" />
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-rose)', marginTop: 0, marginBottom: 16 }}>Metrics Server</h3>
                    <CodeBlock desc="View CPU/Memory usage of Nodes locally" command="kubectl top nodes" />
                    <CodeBlock desc="View CPU/Memory usage of Pods locally" command="kubectl top pods" />
                    <p style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>* Note: &apos;kubectl top&apos; commands and the HPA rely completely on &apos;metrics-server&apos; running in your cluster. If it returns &apos;&lt;unknown&gt;&apos;, the metrics-server is missing or broken.</p>
                </div>
            </div>
        </section>
    );
}
