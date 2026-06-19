FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.6.0 --activate
WORKDIR /app

# ---- deps ----
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
RUN pnpm install --frozen-lockfile

# ---- development ----
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
EXPOSE 4000
CMD ["pnpm", "--filter", "@techstore/api", "start:dev"]

# ---- build ----
FROM deps AS builder
COPY . .
RUN pnpm --filter @techstore/db db:generate
RUN pnpm --filter @techstore/types build
RUN pnpm --filter @techstore/db build
RUN pnpm --filter @techstore/api build

# ---- production ----
FROM node:22-alpine AS production
# tini = proper PID 1 (signal handling / zombie reaping); curl for HEALTHCHECK
RUN apk add --no-cache tini curl && corepack enable && corepack prepare pnpm@11.6.0 --activate
WORKDIR /app
ENV NODE_ENV=production

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/db ./packages/db

# Run as the unprivileged 'node' user that ships with the image
RUN chown -R node:node /app
USER node

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:4000/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/api/dist/main"]
