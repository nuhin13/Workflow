# syntax=docker/dockerfile:1
# E00-T03 · Garazo API image.
#
# Multi-stage so the runtime image carries no compiler, no source and no dev
# dependency — less to patch and less to exploit.
#
# The base is pinned to the minor tag node:24.4-alpine, matching .node-version.
# A digest pin is stronger — a tag can be repointed, so two "identical" deploys
# can ship different bytes and a rollback stops meaning anything — but the
# digest must be resolved from the registry the project actually deploys from,
# and no registry has been chosen yet (ADR-0006 open item). Recorded in
# infra/vm/recovery-open-items.md; do NOT invent a digest here.

# ── deps ─────────────────────────────────────────────────────────────────────
FROM node:24.4-alpine AS deps
WORKDIR /app
RUN corepack enable pnpm
# Only the manifests, so this layer is cached until a dependency actually
# changes rather than on every source edit.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/worker/package.json apps/worker/
COPY apps/admin/package.json apps/admin/
COPY packages/server-core/package.json packages/server-core/
COPY packages/runtime-config/package.json packages/runtime-config/
COPY packages/design-tokens/package.json packages/design-tokens/
COPY packages/api-client-typescript/package.json packages/api-client-typescript/
RUN pnpm install --frozen-lockfile

# ── build ────────────────────────────────────────────────────────────────────
FROM node:24.4-alpine AS build
WORKDIR /app
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY . .
RUN pnpm --filter @garazo/server-core --filter @garazo/runtime-config --filter @garazo/api run build
# Drop dev dependencies before they can reach the runtime stage.
# --legacy: pnpm 11 assumes injected workspace dependencies for `deploy`; this
# workspace links them normally, so the legacy resolution is the correct one.
# node-linker=hoisted: the default linker leaves workspace packages as symlinks
# into ../../packages, which do not exist in the runtime stage, so the image
# builds fine and then dies on require(). Hoisting copies real files.
RUN pnpm --filter @garazo/api --prod deploy --legacy --config.node-linker=hoisted /app/bundle

# ── runtime ──────────────────────────────────────────────────────────────────
FROM node:24.4-alpine AS runtime
WORKDIR /app

# Never run as root. A container escape from an unprivileged process is a much
# smaller problem than one from root.
RUN addgroup -S garazo && adduser -S -G garazo garazo

ENV NODE_ENV=production
COPY --from=build --chown=garazo:garazo /app/bundle ./

USER garazo
EXPOSE 3000

# Readiness, not liveness: the API is only useful once its dependencies are
# reachable, and reporting healthy before then sends traffic into failures.
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.API_PORT||3000)+'/api/v1/system/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/main.js"]
