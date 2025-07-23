# Stage di build
FROM node:18-alpine AS builder
WORKDIR /app

# Installa pnpm
RUN npm install -g pnpm

# Copia file di definizione delle dipendenze
COPY package.json pnpm-lock.yaml ./

# Installa le dipendenze
RUN pnpm install --no-frozen-lockfile

# Copia tutto il codice sorgente
COPY . ./

# Costruisci l'app in modalità produzione
RUN pnpm build

# Stage finale: runtime
FROM node:18-alpine AS runner
WORKDIR /app

# Installa pnpm e copia solo le dipendenze di produzione
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --no-frozen-lockfile

# Copia output di build e configurazioni
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs .

# Espone la porta dell'app Next.js
EXPOSE 3000

# Avvia in modalità produzione
CMD ["pnpm", "start"]
