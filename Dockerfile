# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=24-alpine

# ---- base -------------------------------------------------------------
FROM node:${NODE_VERSION} AS base
WORKDIR /app

# ---- build --------------------------------------------------------------
# Installs full deps (incl. devDependencies) and compiles TypeScript.
FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ---- prod-deps ----------------------------------------------------------
# Installs only production dependencies, in an isolated layer so they
# don't get invalidated by source changes.
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- runtime --------------------------------------------------------------
FROM node:${NODE_VERSION} AS runtime
ENV NODE_ENV=production
WORKDIR /app

RUN apk add --no-cache tini

COPY package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
