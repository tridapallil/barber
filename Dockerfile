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

# Os scripts de migração e de dados rodam de dentro do container quando preciso
COPY --from=builder --chown=salao:nodejs /app/scripts ./scripts
COPY --from=builder --chown=salao:nodejs /app/exemplo ./exemplo

# Sem volume: os dados vivem no MongoDB, fora do container.
# É isso que faz um redeploy não encostar em nada.

USER salao
EXPOSE 3210

CMD ["node", "server.js"]
