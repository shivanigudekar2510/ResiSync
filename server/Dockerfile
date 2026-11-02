# ==========================================
# RESISYNC Backend - Multi-Stage Production Dockerfile
# ==========================================

# Stage 1: Build & Prisma Compilation
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma engine binary compatibility on Alpine
RUN apk add --no-cache openssl libc6-compat

# Copy package descriptors
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for TypeScript build)
RUN npm ci

# Copy TypeScript source code
COPY tsconfig.json ./
COPY src ./src/

# Generate Prisma Client & compile TypeScript to dist/
RUN npx prisma generate
RUN npm run build

# Prune devDependencies to keep image lean
RUN npm prune --production

# ==========================================
# Stage 2: Minimal Production Runtime
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat curl

ENV NODE_ENV=production
ENV PORT=5000

# Run container as unprivileged non-root user
USER node

# Copy production artifacts from builder
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma

# Expose internal API port
EXPOSE 5000

# Docker Healthcheck targeting live health probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "dist/index.js"]
