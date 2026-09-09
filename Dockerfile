# ==============================================================================
# genericMed - Production Multi-Stage Dockerfile (Separated Frontend & Backend)
# Optimized for Node.js 20 LTS Alpine, Non-Root Security & Minimal Attack Surface
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Frontend Builder
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

RUN apk add --no-cache libc6-compat

# Copy frontend package manifests first for optimal layer caching
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source code & build production bundle
COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Backend Dependencies Pruning
# ------------------------------------------------------------------------------
FROM node:20-alpine AS backend-deps

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev

# ------------------------------------------------------------------------------
# Stage 3: Production Minimal Runner
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

RUN apk add --no-cache dumb-init curl

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy backend dependencies & source
COPY --from=backend-deps /app/backend/node_modules ./backend/node_modules
COPY backend/package*.json ./backend/
COPY backend/tsconfig.json ./backend/
COPY backend/src/ ./backend/src/

# Copy built frontend assets to serve or proxy
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create non-root system user & assign file ownership
RUN chown -R node:node /app

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health/live || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["npx", "tsx", "backend/src/index.ts"]
