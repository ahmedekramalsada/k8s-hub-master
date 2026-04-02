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
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 24 }}>📋</span> Docker Master Cheatsheet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Your quick reference guide to the most essential Docker CLI commands for daily operations.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-primary-light)', marginTop: 0, marginBottom: 16 }}>Image Lifecycle</h3>
                    <CodeBlock desc="Pull an image from Docker Hub" command="docker pull ubuntu:20.04" />
                    <CodeBlock desc="List all local images" command="docker images" />
                    <CodeBlock desc="Build an image from Dockerfile" command="docker build -t my-app:v1 ." />
                    <CodeBlock desc="Remove an image" command="docker rmi ubuntu:20.04" />
                    <CodeBlock desc="Remove all dangling images" command="docker image prune" />
                </div>
                
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-emerald)', marginTop: 0, marginBottom: 16 }}>Container Operations</h3>
                    <CodeBlock desc="Run a container in the background" command="docker run -d --name web nginx" />
                    <CodeBlock desc="Run an interactive shell session" command="docker run -it ubuntu bash" />
                    <CodeBlock desc="Map ports (Host:Container)" command="docker run -p 8080:80 nginx" />
                    <CodeBlock desc="List running containers" command="docker ps" />
                    <CodeBlock desc="List ALL containers (even stopped)" command="docker ps -a" />
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-blue)', marginTop: 0, marginBottom: 16 }}>Debugging & Exec</h3>
                    <CodeBlock desc="Stream container logs continuously" command="docker logs -f web" />
                    <CodeBlock desc="View last 100 lines of logs" command="docker logs --tail 100 web" />
                    <CodeBlock desc="Open shell inside running container" command="docker exec -it web sh" />
                    <CodeBlock desc="View precise container metadata" command="docker inspect web" />
                    <CodeBlock desc="View live resource usage stats" command="docker stats" />
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--color-rose)', marginTop: 0, marginBottom: 16 }}>Cleanup (Use with caution)</h3>
                    <CodeBlock desc="Stop a running container safely" command="docker stop web" />
                    <CodeBlock desc="Force stop and delete container" command="docker rm -f web" />
                    <CodeBlock desc="Delete all stopped containers" command="docker container prune" />
                    <CodeBlock desc="Nuke unused containers, images, nets" command="docker system prune -a --volumes" />
                </div>
            </div>
        </section>
    );
}
