# syntax=docker/dockerfile:1
# E00-T03 · Garazo worker image.
#
# Same shape as the API image. The worker exposes NO port: its health is a
# readiness marker on disk, written after bootstrap and removed on shutdown.
# Adding an HTTP listener purely for health checks would mean shipping a
# network surface with no other reason to exist.

FROM node:24.4-alpine AS deps
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/worker/package.json apps/worker/
COPY apps/admin/package.json apps/admin/
COPY packages/server-core/package.json packages/server-core/
COPY packages/runtime-config/package.json packages/runtime-config/
COPY packages/design-tokens/package.json packages/design-tokens/
COPY packages/api-client-typescript/package.json packages/api-client-typescript/
RUN pnpm install --frozen-lockfile

FROM node:24.4-alpine AS build
WORKDIR /app
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @garazo/server-core --filter @garazo/runtime-config --filter @garazo/worker run build
RUN pnpm --filter @garazo/worker --prod deploy --legacy --config.node-linker=hoisted /app/bundle

FROM node:24.4-alpine AS runtime
WORKDIR /app
RUN addgroup -S garazo && adduser -S -G garazo garazo

ENV NODE_ENV=production
COPY --from=build --chown=garazo:garazo /app/bundle ./

USER garazo

# The marker is written only after bootstrap completes, so "healthy" cannot
# precede "actually running".
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "process.exit(require('node:fs').existsSync('/tmp/garazo-worker-ready')?0:1)"

# SIGTERM must reach node itself, not a shell wrapper, or graceful shutdown
# never runs and every deploy risks interrupting work mid-write.
CMD ["node", "dist/main.js"]
