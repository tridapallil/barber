# ---------- dependências ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- build ----------
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- execução ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3210
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S salao -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=salao:nodejs /app/.next/standalone ./
COPY --from=builder --chown=salao:nodejs /app/.next/static ./.next/static

# Onde os JSON ficam guardados.
#
# NÃO declare `VOLUME ["/app/data"]` aqui: sem um volume nomeado montado, o
# Docker cria um volume ANÔNIMO novo a cada `docker run`. Como o Coolify
# recria o container a cada deploy, os dados do deploy anterior viram um
# volume órfão e o sistema sobe vazio — parece persistir até o primeiro
# redeploy. A persistência tem que ser declarada no Coolify (Storages →
# Volume Mount → /app/data), não aqui.
RUN mkdir -p /app/data && chown -R salao:nodejs /app/data

USER salao
EXPOSE 3210

CMD ["node", "server.js"]
