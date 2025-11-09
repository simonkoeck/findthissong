# ------------ Base ------------
FROM node:22-alpine AS base
WORKDIR /app

ENV CI=true \
    NX_DAEMON=false

# pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# ------------ Deps (dev deps for build) ------------
FROM base AS deps
COPY pnpm-lock.yaml package.json ./
# optional: COPY .npmrc ./
RUN pnpm install --frozen-lockfile

# ------------ Build ------------
FROM deps AS build
COPY . .
# Build your Nx target
RUN npx nx build task-processor

# ------------ Prod deps (prune dev) ------------
FROM deps AS prod-deps
RUN pnpm prune --prod

# ------------ Runtime ------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Tools needed at runtime + to build shazamio-core on Alpine/aarch64
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    apk add --no-cache \
      ffmpeg \
      python3 \
      py3-pip \
      build-base \
      rust \
      cargo \
      pkgconf \
      alsa-lib-dev

# Install shazamio (needs toolchain above on Alpine)
RUN pip3 install --no-cache-dir --break-system-packages shazamio

# Create writable folder
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

# Drop privileges
USER node

# Copy production node_modules and build output from previous stages
COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist/apps/task-processor ./dist/apps/task-processor
COPY --chown=node:node package.json pnpm-lock.yaml ./
# If you call a Python helper:
COPY --chown=node:node detect.py ./

CMD ["node", "dist/apps/task-processor/main.js"]

