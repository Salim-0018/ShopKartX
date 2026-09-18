FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./

RUN npm install --omit=dev

COPY backend/src/ttm/server.js ./server.js

ENV NODE_ENV=production
ENV PORT=9105

EXPOSE 9105

USER node

CMD ["node", "server.js"]
