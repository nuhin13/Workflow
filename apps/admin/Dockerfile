# syntax=docker/dockerfile:1
# E00-T03 · Garazo admin image (Next.js standalone output).

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
RUN pnpm --filter @garazo/admin run build

FROM node:24.4-alpine AS runtime
WORKDIR /app
RUN addgroup -S garazo && adduser -S -G garazo garazo

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# Next's standalone output ships only the traced runtime files.
COPY --from=build --chown=garazo:garazo /app/apps/admin/.next/standalone ./
COPY --from=build --chown=garazo:garazo /app/apps/admin/.next/static ./apps/admin/.next/static

USER garazo
EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/admin/server.js"]
