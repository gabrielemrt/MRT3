# Run production server
FROM node:18-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "start"]
