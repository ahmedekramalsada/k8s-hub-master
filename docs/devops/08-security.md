# Kubernetes Security

## Pod Security Standards (PSS)

Kubernetes defines three security levels for pods:

| Standard | What it allows | Use case |
|---|---|---|
| **Privileged** | No restrictions | System pods, monitoring agents |
| **Baseline** | Prevents known privilege escalations | Most workloads |
| **Restricted** | Heavily restricted, follows best practices | Security-critical workloads |

This project enforces **PSS Restricted** — the strictest level.

## securityContext: Pod vs Container Level

Security contexts can be set at two levels:

```yaml
spec:
  template:
    spec:
      # Pod-level: applies to ALL containers in the pod
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        runAsGroup: 1001
        fsGroup: 1001
        seccompProfile:
          type: RuntimeDefault

      containers:
        - name: frontend
          # Container-level: overrides/adds to pod-level
          securityContext:
            readOnlyRootFilesystem: true
            allowPrivilegeEscalation: false
            capabilities:
              drop:
                - ALL
```

| Level | Scope | Example settings |
|---|---|---|
| Pod-level | All containers | `runAsNonRoot`, `runAsUser`, `fsGroup`, `seccompProfile` |
| Container-level | Single container | `readOnlyRootFilesystem`, `capabilities`, `allowPrivilegeEscalation` |

## Linux Capabilities: Drop ALL

Linux capabilities split root privileges into distinct units. By default, containers get a subset. Dropping ALL removes every capability:

```yaml
capabilities:
  drop:
    - ALL
```

| Capability | What it allows | Risk if kept |
|---|---|---|
| `NET_RAW` | Craft raw network packets | ARP spoofing, network attacks |
| `SYS_ADMIN` | Mount filesystems, many syscalls | Full container escape |
| `SYS_PTRACE` | Trace/debug processes | Read other process memory |
| `NET_BIND_SERVICE` | Bind to ports < 1024 | Low risk, but unnecessary |

If a container needs a specific capability, add it back:

```yaml
capabilities:
  drop:
    - ALL
  add:
    - NET_BIND_SERVICE    # Only if binding to port < 1024
```

## seccomp Profiles

seccomp (secure computing mode) restricts which system calls a process can make:

```yaml
seccompProfile:
  type: RuntimeDefault
```

| Type | Behavior |
|---|---|
| `RuntimeDefault` | Uses the container runtime's default profile (recommended) |
| `Localhost` | Custom profile from a file on the node |
| `Unconfined` | No restrictions (dangerous) |

The `RuntimeDefault` profile blocks dangerous syscalls like `mount`, `reboot`, and `ptrace`.

## readOnlyRootFilesystem

```yaml
# Frontend: true (nginx doesn't need to write)
securityContext:
  readOnlyRootFilesystem: true

# Backend: false (Node.js may need to write temp files)
securityContext:
  readOnlyRootFilesystem: false
```

When `readOnlyRootFilesystem: true`, the container cannot write to its filesystem. If the app needs temporary storage, add an `emptyDir` volume:

```yaml
volumeMounts:
  - name: tmp
    mountPath: /tmp
volumes:
  - name: tmp
    emptyDir: {}
```

## Non-Root Containers

Running as root inside a container means a container escape gives root on the host. This project runs as UID 1001:

```yaml
securityContext:
  runAsNonRoot: true       # K8s rejects if image tries to run as root
  runAsUser: 1001          # Non-root UID
  runAsGroup: 1001         # Non-root GID
```

The Dockerfile creates this user:

```dockerfile
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup && \
    chown -R appuser:appgroup /app
USER appuser
```

## allowPrivilegeEscalation

```yaml
allowPrivilegeEscalation: false
```

This prevents a process from gaining more privileges than its parent. It blocks `setuid` binaries and `sudo` inside the container.

## NetworkPolicy: Defense in Depth

NetworkPolicy adds a second layer of defense. Even if an attacker compromises a pod, they can't reach everything:

```yaml
# Ingress: only Traefik and same-namespace pods can reach us
# Egress: only DNS (port 53) and HTTPS (port 443) outbound
```

| Layer | What it protects |
|---|---|
| PSS Restricted | Prevents privilege abuse inside the container |
| NetworkPolicy | Limits lateral movement between pods |
| Secrets via ESO | No secrets in Git or container images |
| Image scanning (Trivy) | Catches vulnerable dependencies |

## Secrets Management Security

| Practice | Implementation |
|---|---|
| No secrets in Git | External Secrets Operator + Infisical |
| `optional: true` on secretKeyRef | Pods start even if secrets aren't synced yet |
| Machine Identity auth | No long-lived tokens, uses Universal Auth |
| Refresh interval | Secrets auto-rotate every 1h |

## Image Security with Trivy

The CI pipeline scans every image before deployment:

```yaml
trivy image --exit-code 0 --severity HIGH,CRITICAL --format table $(FRONTEND_IMAGE):$(IMAGE_TAG)
```

| Check | What it finds |
|---|---|
| OS packages | Vulnerable system libraries (OpenSSL, glibc, etc.) |
| Language dependencies | Vulnerable npm packages in Node.js |
| Misconfigurations | Dockerfile best practice violations |
| Secrets in image | Accidentally committed API keys or passwords |

## RBAC Basics

Role-Based Access Control limits who can do what in the cluster:

| Resource | Scope | Purpose |
|---|---|---|
| `Role` | Single namespace | Grants permissions within one namespace |
| `ClusterRole` | Cluster-wide | Grants permissions across all namespaces |
| `RoleBinding` | Single namespace | Binds a Role to a user/service account |
| `ClusterRoleBinding` | Cluster-wide | Binds a ClusterRole to a user/service account |

Principle of least privilege: give each service account only the permissions it needs.

## Common Mistakes

| Mistake | Risk | Fix |
|---|---|---|
| Running as root | Container escape = root on host | `runAsNonRoot: true`, `runAsUser: 1001` |
| Keeping default capabilities | Unnecessary attack surface | `capabilities.drop: ALL` |
| `readOnlyRootFilesystem: false` without reason | Attacker can modify binaries | Set to `true`, use `emptyDir` for temp files |
| No NetworkPolicy | Compromised pod reaches everything | Add ingress/egress rules |
| Secrets in env vars as plain text | Visible in `kubectl describe pod` | Use `secretKeyRef` |
| Skipping Trivy scans | Vulnerable images in production | Scan in CI, fail on CRITICAL |
| `allowPrivilegeEscalation: true` | Process can gain root via setuid | Always set to `false` |
