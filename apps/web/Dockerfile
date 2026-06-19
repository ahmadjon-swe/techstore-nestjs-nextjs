FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.6.0 --activate
WORKDIR /app

# ---- deps ----
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/config/package.json ./packages/config/
RUN pnpm install --frozen-lockfile

# ---- development ----
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY . .
EXPOSE 3000
CMD ["pnpm", "--filter", "@techstore/web", "dev"]

# ---- build ----
FROM deps AS builder
COPY . .
# NEXT_PUBLIC_API_URL is baked into the JS bundle at build time
# so next.config.ts can add the production domain to remotePatterns.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ARG NEXT_PUBLIC_DEV_MODE
ENV NEXT_PUBLIC_DEV_MODE=${NEXT_PUBLIC_DEV_MODE}
RUN pnpm --filter @techstore/web build

# ---- production ----
FROM node:20-alpine AS production
RUN apk add --no-cache tini curl
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Next.js standalone server runs fine as the unprivileged 'node' user
RUN chown -R node:node /app
USER node

EXPOSE 3000
ENV PORT=3000
# Next.js standalone binds to $HOSTNAME, which Docker sets to the container ID —
# so localhost (and the HEALTHCHECK below) wouldn't reach it. Force 0.0.0.0.
ENV HOSTNAME=0.0.0.0
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:3000 || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/web/server.js"]
