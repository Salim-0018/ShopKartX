FROM node:22-alpine

WORKDIR /app

COPY server.js ./

ENV NODE_ENV=production
ENV PORT=9105

EXPOSE 9105

CMD ["node", "server.js"]
