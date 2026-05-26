FROM node:22-alpine AS deps
WORKDIR /app
COPY apps/web/package*.json ./apps/web/
RUN cd apps/web && npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY apps/web ./apps/web
WORKDIR /app/apps/web
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app/apps/web
ENV NODE_ENV=production
COPY --from=build /app/apps/web ./
EXPOSE 3000
CMD ["npm", "run", "start"]
