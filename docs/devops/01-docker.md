# DevOps Guide 01: Docker

## What is Docker?

Docker packages your application and all its dependencies into a **container** — a lightweight, portable unit that runs identically on any machine that has Docker installed.

Think of it like a shipping container for software. Just as a shipping container holds goods and fits on any ship, truck, or train, a Docker container holds your app and runs on any server.

## Your Dockerfiles Explained

### Frontend Dockerfile (`/Dockerfile`)

This is a **multi-stage build** — it uses two Docker images: one to build the app, one to serve it.

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:1.27-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
RUN sed -i 's/# server_tokens off;/server_tokens off;/' /etc/nginx/nginx.conf
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
ENV BACKEND_URL=http://backend:3001
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Line by line:**

| Line | What it does | Why |
|---|---|---|
| `FROM node:20-alpine AS builder` | Use Node.js 20 on Alpine Linux (tiny, ~50MB) as the build environment | Alpine is much smaller than full Debian/Ubuntu |
| `WORKDIR /app` | Set working directory inside the container | All subsequent commands run from `/app` |
| `COPY package.json package-lock.json ./` | Copy only the dependency files first | Docker caches layers — if these don't change, `npm ci` is cached |
| `RUN npm ci --ignore-scripts` | Install exact dependencies from lockfile | `ci` is faster and more reproducible than `install` |
| `COPY . .` | Copy all source code | Now we copy the actual app code |
| `RUN npm run build` | Build the React app → static files in `dist/` | Vite compiles JSX, bundles JS, optimizes assets |
| `FROM nginx:1.27-alpine` | Start fresh with Nginx (the second stage) | The final image only has Nginx + static files — no Node.js! |
| `COPY --from=builder /app/dist` | Copy built files from Stage 1 | Only the output, not the build tools |
| `server_tokens off` | Hide Nginx version from HTTP headers | Security: don't reveal your Nginx version to attackers |
| `HEALTHCHECK` | Docker checks if the app is alive every 30s | Used by `docker-compose` and K8s to know if the container is healthy |
| `EXPOSE 80` | Document that port 80 is used | Informational — doesn't actually publish the port |
| `CMD ["nginx", "-g", "daemon off;"]` | Start Nginx in foreground mode | Docker needs the main process to stay in the foreground |

**Why multi-stage?**
- Stage 1 has Node.js, npm, source code, build tools (~300MB)
- Stage 2 only has Nginx + static files (~25MB)
- Final image is 10x smaller and has a smaller attack surface

### Backend Dockerfile (`/backend/Dockerfile`)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production --ignore-scripts
COPY . .
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup && \
    chown -R appuser:appgroup /app
USER appuser
EXPOSE 3001
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/health || exit 1
CMD ["node", "src/index.js"]
```

**Key differences from frontend:**
- Single stage (no build needed — Node.js runs the source directly)
- `--only=production` — only installs production dependencies (smaller image)
- Creates a non-root user (`appuser`) and switches to it with `USER appuser`
- Health check hits `/health` on port 3001

## Your `.dockerignore`

This file tells Docker which files to EXCLUDE from the build context (the files sent to the Docker daemon).

```
node_modules        # Don't send — npm ci installs them inside the container
.git                # Don't send — 50MB+ of git history
*.md                # Don't send — documentation isn't needed at runtime
docs/               # Don't send — learning docs aren't needed
k3s/                # Don't send — K8s manifests aren't needed
azure-pipelines.yml # Don't send — CI config isn't needed
```

**Why this matters:**
- Smaller build context = faster builds
- Sensitive files (`.env`, `.git`) don't end up in the image
- Image size is smaller

## docker-compose.yml

This file runs your ENTIRE stack with one command: `docker-compose up --build -d`

```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        BACKEND_URL: http://backend:3001
    ports:
      - "8080:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - k8s-hub

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    networks:
      - k8s-hub

networks:
  k8s-hub:
    driver: bridge
```

**Key concepts:**

| Concept | Explanation |
|---|---|
| `services` | Each service is one container. You have `frontend` and `backend` |
| `build.context` | Where to look for the Dockerfile |
| `ports: "8080:80"` | Map host port 8080 to container port 80 |
| `depends_on.condition: service_healthy` | Wait for backend's health check to pass before starting frontend |
| `networks` | Both containers share the `k8s-hub` network — they can talk via container names |

**How services talk to each other:**
```
Frontend container → http://backend:3001
                     ↑
                     Docker DNS resolves "backend" to the backend container's IP
```

## Common Docker Commands

```bash
docker-compose up --build -d     # Build and start all services
docker-compose down              # Stop and remove containers
docker-compose logs -f frontend  # Follow frontend logs
docker-compose ps                # Show running containers
docker-compose exec backend sh   # Shell into backend container
docker images                    # List all local images
docker rmi <image>               # Remove an image
docker system prune -a           # Remove all unused images (frees space!)
```

## Docker Best Practices You're Following

✅ Multi-stage build for frontend (smaller final image)
✅ Non-root user in backend (security)
✅ Health checks on both containers (reliability)
✅ `.dockerignore` to exclude unnecessary files (faster builds)
✅ Pin base image versions (`node:20-alpine`, `nginx:1.27-alpine`)
✅ Use `npm ci` instead of `npm install` (reproducible builds)

## What to Improve Later

- Use `distroless/nodejs20` instead of `node:20-alpine` for backend (even smaller, more secure)
- Add `--no-cache` flag in CI to ensure fresh builds
- Use Docker BuildKit for faster parallel builds
- Add labels to images (maintainer, version, description)
