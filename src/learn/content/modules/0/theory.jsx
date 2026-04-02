import React, { useState } from 'react';

function CodeBlock({ title, lang, code }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="code-window">
            <div className="code-header">
                <div className="window-controls">
                    <span className="wc-dot wc-red" />
                    <span className="wc-dot wc-yellow" />
                    <span className="wc-dot wc-green" />
                </div>
                <span className="code-lang">{lang || title}</span>
                <button className="btn btn-sm btn-ghost" onClick={copy} style={{ padding: '2px 10px', fontSize: 11 }}>
                    {copied ? '✓ Copied' : 'Copy'}
                </button>
            </div>
            <pre>{code}</pre>
        </div>
    );
}

function Callout({ type, children }) {
    const styles = {
        tip:     { border: 'var(--color-emerald)', bg: 'rgba(16,185,129,0.08)', icon: '💡', label: 'Pro Tip' },
        warning: { border: 'var(--color-amber)',   bg: 'rgba(245,158,11,0.08)',  icon: '⚠️', label: 'Warning' },
        info:    { border: 'var(--color-primary-light)', bg: 'rgba(99,102,241,0.08)', icon: 'ℹ️', label: 'Note' },
        prod:    { border: 'var(--color-rose)',    bg: 'rgba(239,68,95,0.08)',   icon: '🚀', label: 'Production' },
    };
    const s = styles[type] || styles.info;
    return (
        <div style={{ borderLeft: `3px solid ${s.border}`, background: s.bg, borderRadius: '0 8px 8px 0', padding: '12px 16px', margin: '16px 0' }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: s.border }}>{s.icon} {s.label}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{children}</div>
        </div>
    );
}

export default function TheoryContent() {
    return (
        <div className="content-block">
            <h2>🐳 Docker & Container Fundamentals</h2>
            <p>
                Docker is the foundation of the modern cloud-native stack. Before Kubernetes, you must deeply understand
                containers — what they are, how they work, and why they replaced traditional virtual machines.
            </p>

            <h3>Containers vs Virtual Machines</h3>
            <p>
                A <strong>Virtual Machine (VM)</strong> runs a complete operating system (Guest OS) on top of a hypervisor.
                It includes the full kernel, system libraries, and your application. VMs are isolated, but heavy — they take
                minutes to start and consume gigabytes of memory just for the OS overhead.
            </p>
            <p>
                A <strong>Container</strong> is just an isolated Linux process. It shares the host OS kernel but has its
                own filesystem, network stack, and process namespace. This makes containers:
            </p>
            <ul>
                <li><strong>Lightweight:</strong> No guest OS — just your app and its dependencies</li>
                <li><strong>Fast:</strong> Start in milliseconds, not minutes</li>
                <li><strong>Portable:</strong> "Works on my machine" finally becomes true</li>
                <li><strong>Efficient:</strong> Run 10x more containers than VMs on the same hardware</li>
            </ul>

            <Callout type="info">
                The key isolation primitives are Linux <strong>Namespaces</strong> (process, network, mount, user) and
                <strong> cgroups</strong> (CPU/memory limits). Docker wraps these kernel features with a friendly UX.
            </Callout>

            <h3>The Docker Architecture</h3>
            <p>When you run <code>docker run nginx</code>, here's what happens:</p>
            <ol>
                <li>The Docker CLI sends the request to the <strong>Docker Daemon</strong> (dockerd)</li>
                <li>dockerd checks your local image cache for <code>nginx</code></li>
                <li>If not cached, it pulls the image layers from <strong>Docker Hub</strong> (a container registry)</li>
                <li>The daemon creates a container from the image using <strong>containerd</strong> and <strong>runc</strong></li>
                <li>The container process starts, isolated from the host</li>
            </ol>

            <CodeBlock lang="ARCHITECTURE" code={`YOUR TERMINAL
     │
     ▼
Docker CLI  ──(REST API)──▶  dockerd (Docker Daemon)
                                   │
                          ┌────────▼────────┐
                          │   containerd    │  ← manages container lifecycle
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │      runc       │  ← creates the actual container using namespaces/cgroups
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │   Container     │  ← your isolated app process
                          └─────────────────┘`} />

            <Callout type="info">
                In Kubernetes, Docker is not required. Kubernetes uses the <strong>Container Runtime Interface (CRI)</strong>
                which supports containerd, CRI-O, or Docker (via cri-dockerd). Most modern clusters use <strong>containerd</strong> directly.
            </Callout>

            <h3>Images and Layers</h3>
            <p>
                A Docker <strong>image</strong> is a read-only template made of stacked layers. Each instruction in a
                Dockerfile creates a new layer. Layers are cached — if layer 3 changes, Docker only rebuilds layers 3 onwards.
            </p>

            <CodeBlock lang="Dockerfile" code={`# Layer 1: Base OS — pulled from Docker Hub
FROM node:20-alpine

# Layer 2: Working directory (tiny metadata layer)
WORKDIR /app

# Layer 3: Install dependencies (CACHED if package.json unchanged)
COPY package*.json ./
RUN npm ci --only=production

# Layer 4: Copy app source (changes frequently — put LAST)
COPY . .

# Layer 5: Expose port (metadata only, doesn't open firewall)
EXPOSE 3000

# CMD — NOT a layer, tells Docker what to run at startup
CMD ["node", "server.js"]`} />

            <Callout type="tip">
                Always copy <code>package.json</code> and run <code>npm install</code> BEFORE copying your source code.
                This way, Docker caches the dependency layer and rebuilds it only when <code>package.json</code> changes —
                saving minutes on every build.
            </Callout>

            <h3>Multi-Stage Builds (Production Must-Have)</h3>
            <p>
                Multi-stage builds keep your final Docker image small and secure by separating the <em>build environment</em>
                from the <em>runtime environment</em>. Only the compiled output is copied to the final image — not the compiler,
                build tools, or source code.
            </p>

            <CodeBlock lang="Dockerfile (Multi-Stage)" code={`# ──── Stage 1: Build ────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build          # outputs to /app/dist

# ──── Stage 2: Production Runtime ────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app

# Only copy the compiled output from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .

# Run as non-root user (security best practice)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000
CMD ["node", "dist/server.js"]

# Result: ~120MB vs ~800MB for a single-stage build`} />

            <h3>Volumes — Persistent Data</h3>
            <p>
                Containers are <strong>ephemeral</strong> — when a container is removed, all data written inside it is lost.
                Docker <strong>Volumes</strong> solve this by storing data outside the container lifecycle.
            </p>
            <ul>
                <li><strong>Named Volume:</strong> <code>docker run -v mydata:/var/lib/postgresql/data postgres</code> — Docker manages storage location</li>
                <li><strong>Bind Mount:</strong> <code>docker run -v $(pwd):/app node</code> — host directory mapped inside container (great for dev)</li>
                <li><strong>tmpfs:</strong> In-memory only — lost when container stops. Useful for secrets or temp files</li>
            </ul>

            <h3>Networking</h3>
            <p>
                Docker creates a virtual network bridge. By default, containers on the same network can communicate by
                container name (DNS). Ports must be explicitly published to be reachable from the host.
            </p>

            <CodeBlock lang="docker-compose.yml" code={`version: "3.9"
services:
  api:
    build: .
    ports:
      - "3000:3000"    # host:container port mapping
    environment:
      - DATABASE_URL=postgres://admin:secret@db:5432/mydb
    depends_on:
      - db

  db:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=secret

volumes:
  pgdata:   # named volume — persists across container restarts`} />

            <Callout type="prod">
                <strong>Never use Docker Compose in production.</strong> It runs on a single machine with no failover.
                Use Kubernetes for multi-node, self-healing container orchestration. Docker Compose is excellent for
                local development and integration testing.
            </Callout>

            <h3>Common Docker Commands Reference</h3>
            <CodeBlock lang="CLI Reference" code={`# ── Images ──────────────────────────────────────────────────
docker build -t myapp:1.0 .      # build image from Dockerfile
docker images                    # list local images
docker pull nginx:1.25           # pull specific version
docker push myregistry/myapp:1.0 # push to registry

# ── Containers ───────────────────────────────────────────────
docker run -d -p 8080:80 nginx   # run detached, map port
docker run -it ubuntu bash       # interactive shell
docker ps                        # list running containers
docker ps -a                     # list all (including stopped)
docker logs -f my-container      # follow logs
docker exec -it my-container sh  # shell into running container
docker stop my-container         # graceful stop (SIGTERM)
docker rm my-container           # remove stopped container

# ── System ───────────────────────────────────────────────────
docker system prune -a           # remove all unused data
docker stats                     # live resource usage`} />

            <Callout type="warning">
                Always pin image versions in production: use <code>nginx:1.25.3</code> not <code>nginx:latest</code>.
                The <code>:latest</code> tag can change unexpectedly, breaking your deployment. Use digest pinning
                (<code>nginx@sha256:abc123...</code>) for maximum reproducibility.
            </Callout>
        </div>
    );
}
