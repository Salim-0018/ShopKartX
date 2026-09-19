FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY backend/package*.json ./

RUN npm ci --omit=dev

COPY backend/ ./

EXPOSE 5001

CMD ["node", "src/server.js"]
