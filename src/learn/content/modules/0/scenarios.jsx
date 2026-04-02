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
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Practical troubleshooting scenarios you will encounter in production Docker environments.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-rose)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 1: The "Address Already in Use" Error</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> You run <code>docker run -p 80:80 nginx</code> and Docker errors out with `Bind for 0.0.0.0:80 failed: port is already allocated`.<br/>
                        <strong>Cause:</strong> Another process (like Apache, Skype, or another container) is already bound to port 80 on your host machine.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <CodeBlock desc="Find what container is blocking port 80" command='docker ps | grep ":80->"' />
                        <CodeBlock desc="Stop that container (or change your port to 8080)" command="docker run -p 8080:80 nginx" />
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-yellow)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 2: The "No space left on device" Error</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> Disk alerts fire, and you cannot build new images or start containers.<br/>
                        <strong>Cause:</strong> By default, Docker keeps every dead container, old volume, and dangling image layer forever. Your `/var/lib/docker` directory is full.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <CodeBlock desc="Check how much space Docker is consuming" command="docker system df" />
                        <CodeBlock desc="Dangerous: Remove ALL unused data safely" command="docker system prune -a --volumes" />
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-blue)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 3: Container Exits Immediately</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> You run <code>docker run ubuntu</code>. It returns you to the prompt instantly. `docker ps` shows nothing. `docker ps -a` shows it exited with Code 0.<br/>
                        <strong>Cause:</strong> Containers only live as long as their primary foreground process (`PID 1`). If the process finishes (like bash completing its script, or a backgrounded daemon returning), the container dies.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px 0' }}>Force a blocking foreground process (like an interactive TTY or a tail command) to keep it alive.</p>
                        <CodeBlock desc="Run with pseudo-tty attached" command="docker run -it ubuntu bash" />
                        <CodeBlock desc="Or in a completely headless/detached sleep loop" command="docker run -d ubuntu sleep infinity" />
                    </div>
                </div>
            </div>
        </section>
    );
}
