# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Build stage — compiles the Vite SPA.
# Firebase web config is PUBLIC (it is baked into the JS bundle) but is still
# injected at build time so the image is environment-specific.
# ---------------------------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID

ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
    VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET \
    VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID \
    VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

# Install dependencies first so this layer is cached across source changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# `npm run build` runs `vite build` and then scripts/gzip-dist.mjs, which
# pre-compresses the hashed assets so nginx can serve them with gzip_static.
RUN npm run build

# ---------------------------------------------------------------------------
# Runtime stage — static SPA served by non-root nginx on :8080 (internal only).
# ---------------------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:alpine AS runtime

# Replace the stock server block with the SPA config (cache, gzip_static,
# SPA fallback, /healthz).
COPY nginx/app.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
