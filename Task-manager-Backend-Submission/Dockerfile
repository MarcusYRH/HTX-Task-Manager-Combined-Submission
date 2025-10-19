FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

# Use npm ci when a lockfile exists; otherwise fall back to npm install so the build doesn't fail
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY src ./src
COPY openapi.yaml ./

RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# For the runtime image install prod deps only; prefer lockfile but fall back to install if missing
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/openapi.yaml ./

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/index.js"]
