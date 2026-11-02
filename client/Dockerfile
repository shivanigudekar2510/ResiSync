# ==========================================
# RESISYNC Frontend - Multi-Stage Production Dockerfile
# ==========================================

# Stage 1: Build Vite Production Assets
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for environment variables embedded at build time
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm ci

COPY . .

# Compile TypeScript and bundle with Vite
RUN npm run build

# ==========================================
# Stage 2: High-Performance Nginx Web Server
# ==========================================
FROM nginx:1.25-alpine AS runner

# Remove default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy built SPA artifacts
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy internal Nginx configuration for SPA routing & caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Security: forward request logs to Docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

