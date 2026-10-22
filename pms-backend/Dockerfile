# syntax=docker/dockerfile:1

# ---------- Etapa de build ----------
FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json server_config.json ./
COPY src ./src
RUN npm run build
# analytics_worker.js es JS plano: tsc no lo copia a dist, lo hacemos nosotros
RUN mkdir -p dist/src/workers \
 && cp src/workers/analytics_worker.js dist/src/workers/analytics_worker.js

# ---------- Etapa de runtime ----------
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

EXPOSE 3000
USER node
CMD ["node", "dist/src/main.js"]
