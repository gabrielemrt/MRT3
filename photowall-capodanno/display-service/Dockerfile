FROM node:18-alpine

WORKDIR /app

# Installa wget per healthcheck
RUN apk add --no-cache wget

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3002

USER node

CMD ["node", "server.js"]