# ==========================================
# Stage 1: Build Image
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first (cached layer)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source and build
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Production Server
# ==========================================
FROM nginx:1.27-alpine

# Remove default nginx assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Security: remove nginx version from headers
RUN sed -i 's/# server_tokens off;/server_tokens off;/' /etc/nginx/nginx.conf

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Default environment
ENV BACKEND_URL=http://backend:3001

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
