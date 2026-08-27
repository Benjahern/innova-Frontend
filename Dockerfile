# Frontend - Nuxt Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./

# Install deps targeting Linux arm64 musl (Alpine) so native binaries
# like @rollup/rollup-linux-arm64-musl are fetched correctly.
# Build approvals (esbuild, @parcel/watcher, vue-demi) live in pnpm-workspace.yaml.
RUN node -e "\
  const fs = require('fs'); \
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')); \
  pkg.pnpm = pkg.pnpm || {}; \
  pkg.pnpm.supportedArchitectures = { os: ['linux'], cpu: ['arm64'], libc: ['musl'] }; \
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2)); \
  " && \
    pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
