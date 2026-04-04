# CI/CD Pipeline with Azure Pipelines

## What is CI/CD?

**CI (Continuous Integration)** automatically builds and tests code when changes are pushed. **CD (Continuous Delivery)** automatically deploys those changes to production. Together, they eliminate manual build/deploy steps and catch errors early.

```
git push → CI validates → builds images → scans for vulns → updates manifests → ArgoCD syncs
```

## Azure Pipelines Architecture

Azure Pipelines runs in the cloud on Microsoft-hosted agents (`ubuntu-latest`). It reads `azure-pipelines.yml` from your repo and executes stages sequentially.

### Trigger Configuration

```yaml
trigger:
  branches:
    include:
      - main
      - master
  paths:
    exclude:
      - "*.md"
      - "k3s/*"
      - "docs/*"
      - "mockup*.html"

pr: none
```

The pipeline triggers on pushes to `main`/`master` but ignores documentation and K8s manifest changes (to avoid loops when the pipeline itself updates manifests).

## The 4-Stage Pipeline

### Stage 0: ValidateManifests

Validates all K8s YAML files before anything else:

```yaml
- stage: ValidateManifests
  jobs:
    - job: validateYaml
      steps:
        - script: |
            pip install yamllint
            yamllint -d relaxed k3s/manifests/*.yaml
          displayName: "Lint K8s YAML files"
```

**Why this matters:** A typo in a YAML file would cause a failed deployment. Catching it early saves time.

### Stage 1: BuildFrontend

Builds the frontend Docker image, pushes to Docker Hub, and scans with Trivy:

```yaml
- stage: BuildFrontend
  dependsOn: ValidateManifests
  jobs:
    - job: buildFrontend
      steps:
        - task: Docker@2
          command: "build"
          repository: "$(FRONTEND_IMAGE)"
          Dockerfile: "Dockerfile"
          tags: |
            $(IMAGE_TAG)
            $(LATEST_TAG)

        - task: Docker@2
          command: "push"
          repository: "$(FRONTEND_IMAGE)"
          tags: |
            $(IMAGE_TAG)
            $(LATEST_TAG)

        - script: |
            trivy image --exit-code 0 --severity HIGH,CRITICAL \
              --format table $(FRONTEND_IMAGE):$(IMAGE_TAG)
          displayName: "Trivy Scan — Frontend Image"
```

### Stage 2: BuildBackend

Same process for the backend, using `backend/Dockerfile`:

```yaml
- stage: BuildBackend
  dependsOn: BuildFrontend
  jobs:
    - job: buildBackend
      steps:
        - task: Docker@2
          command: "build"
          repository: "$(BACKEND_IMAGE)"
          Dockerfile: "backend/Dockerfile"
          buildContext: "backend"
```

### Stage 3: UpdateManifests

Updates image tags in Git, which triggers ArgoCD to sync:

```yaml
- stage: UpdateManifests
  dependsOn: BuildBackend
  jobs:
    - job: updateManifests
      steps:
        - checkout: self
          persistCredentials: true

        - script: |
            git config --global user.email "ci@azure-devops.com"
            git config --global user.name "Azure DevOps CI"
            git checkout main

            # Update frontend image tag
            sed -i "s|image: .*/k8s-hub:.*|image: $(DOCKERHUB_USERNAME)/k8s-hub:$(IMAGE_TAG)|" \
              k3s/manifests/deployment.yaml

            # Update backend image tag
            sed -i "s|image: .*/k8s-hub-backend:.*|image: $(DOCKERHUB_USERNAME)/k8s-hub-backend:$(IMAGE_TAG)|" \
              k3s/manifests/deployment.yaml

            git add k3s/manifests/
            git diff --staged --quiet || git commit -m "ci: update image tags to $(IMAGE_TAG) [skip ci]"
            git push origin main
```

The `[skip ci]` in the commit message prevents an infinite loop (the new commit would trigger another pipeline run).

## Trivy Security Scanning

Trivy scans container images for known vulnerabilities in OS packages and application dependencies.

```bash
trivy image --exit-code 0 --severity HIGH,CRITICAL --format table $(FRONTEND_IMAGE):$(IMAGE_TAG)
```

| Flag | Meaning |
|---|---|
| `--exit-code 0` | Don't fail the pipeline on findings (report only) |
| `--severity HIGH,CRITICAL` | Only show HIGH and CRITICAL vulnerabilities |
| `--format table` | Human-readable table output |

### Severity Levels

| Level | Meaning | Action |
|---|---|---|
| LOW | Minor issues, often informational | Monitor |
| MEDIUM | Moderate risk, may have workarounds | Plan to fix |
| HIGH | Significant vulnerability, likely exploitable | Fix soon |
| CRITICAL | Actively exploited or trivially exploitable | Fix immediately |

To fail the pipeline on critical vulns, use `--exit-code 1 --severity CRITICAL`.

## The Full Flow

```
1. Developer pushes code to main
2. Azure Pipelines triggers
3. Stage 0: yamllint validates K8s manifests
4. Stage 1: Frontend Docker image built → pushed to Docker Hub → Trivy scanned
5. Stage 2: Backend Docker image built → pushed to Docker Hub → Trivy scanned
6. Stage 3: Pipeline updates deployment.yaml with new image tags
7. Pipeline commits and pushes the change to main
8. ArgoCD detects the git change (it watches every 3 minutes)
9. ArgoCD syncs: updates the Deployment with new image tags
10. K8s performs a rolling update (maxSurge: 1, maxUnavailable: 0)
11. New pods start serving traffic
```

## Debugging Failed Pipeline Runs

| Problem | Where to look | Fix |
|---|---|---|
| YAML lint fails | Stage 0 logs | Run `yamllint -d relaxed k3s/manifests/*.yaml` locally |
| Docker build fails | Stage 1/2 logs | Check Dockerfile syntax and build context |
| Docker Hub push fails | Stage 1/2 logs | Verify `dockerhub-credentials` variable group in Azure DevOps |
| Trivy finds CRITICAL vulns | Stage 1/2 scan output | Update base image (`node:20-alpine` → newer version) |
| Git push fails | Stage 3 logs | Check `persistCredentials: true` and branch permissions |
| Pipeline triggers on manifest changes | Check trigger config | Ensure `k3s/*` is in `paths.exclude` |

## Common Mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| Forgetting `[skip ci]` in commit message | Infinite pipeline loop | Always add `[skip ci]` to CI-generated commits |
| Wrong Dockerfile path | "Dockerfile not found" | Use `Dockerfile: "backend/Dockerfile"` with `buildContext: "backend"` |
| Missing variable group | `$(DOCKERHUB_USERNAME)` is empty | Create `dockerhub-credentials` group in Azure DevOps Library |
| `pr: none` missing | Pipeline runs on every PR | Add `pr: none` if you don't want PR builds |
| Trivy `--exit-code 1` on all severities | Pipeline fails on LOW vulns | Use `--severity HIGH,CRITICAL` for practical thresholds |
| Not pinning image tags | Using `latest` tag everywhere | Use `$(IMAGE_TAG)` for traceability |
