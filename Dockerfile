FROM node:20-alpine AS builder

WORKDIR /app

COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci

COPY server/ ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app/server

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app/server/package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/server/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
