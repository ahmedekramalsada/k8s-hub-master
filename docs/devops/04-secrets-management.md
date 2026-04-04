# Secrets Management with External Secrets Operator

## The Problem with Secrets in Git

Kubernetes Secrets are **not encrypted** — they are only base64 encoded. Anyone with access to the repo or the cluster can decode them:

```bash
echo "c3VwZXItc2VjcmV0LWtleQ==" | base64 -d
# Output: super-secret-key
```

Committing secrets to Git means:
- **Every clone** has the secrets forever (even after deletion, they exist in git history)
- **No rotation** — changing a secret requires rewriting git history
- **No audit trail** — who accessed which secret and when?
- **No fine-grained access** — anyone with repo read access gets all secrets

## K8s Secrets: Base64, Not Encryption

A native Kubernetes Secret looks like this:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: my-secret
type: Opaque
data:
  password: c3VwZXItc2VjcmV0LWtleQ==   # base64 encoded, NOT encrypted
```

The `data` field stores base64-encoded values. Use `stringData` for plain text (K8s encodes it automatically):

```yaml
stringData:
  password: "super-secret-key"    # K8s will base64-encode this
```

K8s Secrets are stored in etcd. Without etcd encryption at rest, they are readable by anyone with etcd access.

## External Secrets Operator (ESO) Architecture

ESO introduces three custom resources that bridge external secret managers with Kubernetes:

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Infisical   │────▶│ ClusterSecret    │────▶│ External     │
│  (Vault)     │     │ Store            │     │ Secret       │
└──────────────┘     └──────────────────┘     └──────┬───────┘
                                                     │
                                                     ▼
                                              ┌──────────────┐
                                              │ K8s Secret   │
                                              │ (auto-created│
                                              │  by ESO)     │
                                              └──────┬───────┘
                                                     │
                                                     ▼
                                              ┌──────────────┐
                                              │ Pod consumes │
                                              │ via envFrom  │
                                              └──────────────┘
```

| Resource | Purpose | Scope |
|---|---|---|
| `ClusterSecretStore` | Defines how to connect to the secret provider | Cluster-wide |
| `SecretStore` | Same as above, but namespace-scoped | Single namespace |
| `ExternalSecret` | Defines which secrets to fetch and where to store them | Single namespace |

## Infisical as a Secret Manager

Infisical is an open-source secret management platform. In this project, it stores API keys and credentials that should never appear in Git.

**Setup in Infisical:**
1. Go to **Access Control → Machine Identities**
2. Create a machine identity with **Universal Auth**
3. Grant it **read access** to your project
4. Save the **Client ID** and **Client Secret**

## The Complete Flow Explained

### Step 1: ClusterSecretStore (`k3s/manifests/secret-store.yaml`)

This tells ESO how to authenticate with Infisical:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ClusterSecretStore
metadata:
  name: infisical-store
spec:
  provider:
    infisical:
      hostAPI: https://app.infisical.com          # Infisical API endpoint

      auth:
        universalAuthCredentials:
          clientId:
            name: infisical-credentials           # K8s Secret name
            key: client-id                        # Key inside the secret
            namespace: k8s-hub
          clientSecret:
            name: infisical-credentials
            key: client-secret
            namespace: k8s-hub

      secretsScope:
        projectSlug: secret-management            # Infisical project
        environmentSlug: dev                      # Environment (dev/staging/prod)
        secretsPath: "/"                          # Root path in the project
```

**Line-by-line breakdown:**

| Lines | What it does |
|---|---|
| 14-15 | Defines a cluster-scoped secret store named `infisical-store` |
| 19-20 | Uses the Infisical provider |
| 23 | Points to the US region API (`eu.infisical.com` for EU) |
| 26-34 | References the K8s Secret `infisical-credentials` for auth credentials |
| 36-39 | Scopes which Infisical project/environment/path to read from |

### Step 2: ExternalSecret (`k3s/manifests/external-secret.yaml`)

This defines which specific secrets to pull:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: k8s-hub-external-secret
  namespace: k8s-hub
spec:
  refreshInterval: 1h                          # Re-fetch secrets every hour

  secretStoreRef:
    name: infisical-store                      # References the ClusterSecretStore
    kind: ClusterSecretStore

  target:
    name: k8s-hub-secrets                      # Name of the K8s Secret to create
    creationPolicy: Owner                      # ESO owns the lifecycle of this Secret

  data:
    - secretKey: openrouter-api-key            # Key name in the K8s Secret
      remoteRef:
        key: "OPENROUTER_API_KEY"              # Secret name in Infisical
```

### Step 3: Pod Consumes the Secret

The Deployment references the secret via `secretKeyRef`:

```yaml
env:
  - name: OPENROUTER_API_KEY
    valueFrom:
      secretKeyRef:
        name: k8s-hub-secrets          # Created by ESO
        key: openrouter-api-key        # Key defined in ExternalSecret
        optional: true                 # Pod starts even if secret is missing
```

## Machine Identity Authentication

Instead of using static tokens, this project uses **Universal Auth** (Machine Identity):

```
┌─────────────────┐     Client ID + Secret     ┌──────────────┐
│  ESO in K8s     │ ──────────────────────────▶ │  Infisical   │
│  (credentials   │                            │  validates   │
│   in K8s Secret)│ ◀───────────────────────── │  and returns │
└─────────────────┘     Access Token           │  secrets     │
                                                └──────────────┘
```

The credentials are stored in a K8s Secret created by the bootstrap script:

```bash
kubectl create secret generic infisical-credentials \
  --namespace k8s-hub \
  --from-literal=client-id="$INFISICAL_CLIENT_ID" \
  --from-literal=client-secret="$INFISICAL_CLIENT_SECRET"
```

The example file `k3s/manifests/infisical-credentials.example.yaml` shows the structure without real values:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: infisical-credentials
  namespace: k8s-hub
type: Opaque
stringData:
  client-id: "PLACEHOLDER_CLIENT_ID"
  client-secret: "PLACEHOLDER_CLIENT_SECRET"
```

## Best Practices

| Practice | Why | How |
|---|---|---|
| Never commit secrets | Base64 is not encryption | Use ESO + external vault |
| Use `optional: true` | Pods can start before secrets are synced | `secretKeyRef: optional: true` |
| Rotate credentials regularly | Limits blast radius of leaks | Update Machine Identity in Infisical |
| Use `refreshInterval` | Auto-picks up secret rotations | Set to `1h` or shorter |
| Least privilege | Machine identity should only read needed secrets | Grant read-only access in Infisical |
| Separate environments | Dev secrets ≠ Prod secrets | Use different `environmentSlug` per env |
| Audit access | Know who accessed what | Enable Infisical audit logs |

## Common Mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| Wrong `projectSlug` | "project not found" error | Verify the slug in Infisical URL |
| Missing `installCRDs: true` | ESO CRDs not created | Set `--set installCRDs=true` in Helm |
| Credentials secret in wrong namespace | ESO can't find credentials | Must be in `k8s-hub` namespace |
| Forgetting `refreshInterval` | Secrets never update after rotation | Always set a refresh interval |
| Committing `infisical-credentials.yaml` | Real credentials in Git | Only commit the `.example.yaml` file |
| Wrong `secretsPath` | Secret not found | Use `/` for root, or `/folder/` for subfolders |
