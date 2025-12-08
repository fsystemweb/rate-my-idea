FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/models ./apps/models
COPY apps/api ./apps/api

RUN npm i --workspace=api

RUN npm run build --workspace=api

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/api/index.mjs"]