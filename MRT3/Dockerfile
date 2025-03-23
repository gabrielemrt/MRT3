FROM node:18 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY ./app .
RUN npm run build

# Production stage
FROM node:18
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN npm install -g serve

EXPOSE 8095
CMD ["serve", "-s", "dist", "-l", "8095"]