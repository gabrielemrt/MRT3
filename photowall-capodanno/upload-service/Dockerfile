FROM node:18-alpine

WORKDIR /app

# Installa wget per healthcheck
RUN apk add --no-cache wget

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN mkdir -p /app/uploads && chmod 755 /app/uploads

EXPOSE 3001

USER node

CMD ["node", "server.js"]