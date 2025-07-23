# Stage 1: build
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install && pnpm build

# Stage 2: run
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
