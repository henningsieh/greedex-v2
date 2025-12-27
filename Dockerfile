# Base stage - for shared dependencies
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Install Node.js (required for some Next.js tooling)
RUN apk add --no-cache nodejs

# Dependencies stage - install all dependencies including dev
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Builder stage - build the application
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy .env if it exists (for local builds)
COPY .env* ./

# Copy source code
COPY . .

# Set build-time environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
# Next.js will automatically read NEXT_PUBLIC_* vars from:
# 1. .env file (local builds)
# 2. Build ARGs from Coolify (available as process.env during build)
RUN bun run build

# Remove standalone .env to prevent runtime override
RUN rm -f .next/standalone/.env

# Production dependencies only
FROM base AS prod-deps
WORKDIR /app

COPY package.json bun.lock ./

# Install only production dependencies
RUN bun install --frozen-lockfile --production

# Runner stage - final production image
FROM oven/bun:1-alpine AS runner
WORKDIR /app

# Install Node.js in runner (required for Next.js runtime)
RUN apk add --no-cache nodejs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy source files needed for runtime
COPY --from=builder --chown=nextjs:nodejs /app/src/socket-server.ts ./src/socket-server.ts
COPY --from=builder --chown=nextjs:nodejs /app/src/env.ts ./src/env.ts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json

USER nextjs

EXPOSE 3000
EXPOSE 4000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start both Next.js and Socket.IO server
CMD ["bun", "run", "start"]
