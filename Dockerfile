FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist/BFSI-Frontend ./dist/BFSI-Frontend

EXPOSE 4000

CMD ["node", "dist/BFSI-Frontend/server/server.mjs"]
