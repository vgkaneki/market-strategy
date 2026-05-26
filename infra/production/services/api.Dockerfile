FROM node:22-alpine AS deps
WORKDIR /app
COPY services/api/package*.json ./services/api/
COPY packages ./packages
RUN cd services/api && npm ci

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/services/api/node_modules ./services/api/node_modules
COPY services/api ./services/api
COPY packages ./packages
WORKDIR /app/services/api
EXPOSE 8787
CMD ["npm", "run", "start"]
