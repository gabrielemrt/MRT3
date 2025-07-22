# Stage di build
FROM node:18-alpine AS builder
WORKDIR /app

# Installa pnpm
RUN npm install -g pnpm

# Copia file di definizione delle dipendenze\COPY package.json pnpm-lock.yaml ./
# Installa le dipendenze
RUN pnpm install --frozen-lockfile

# Copia tutto il codice sorgente
COPY . .

# Costruisci l'app in modalità produzione
RUN pnpm build

# Stage finale: runtime
FROM node:18-alpine AS runner
WORKDIR /app

# Solo dipendenze di produzione
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# Copia dati compilati dallo stage di build
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs .

# Espone la porta dell'app Next.js
EXPOSE 3000

# Avvia in modalità produzione
CMD ["pnpm", "start"]