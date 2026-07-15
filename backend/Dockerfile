FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json* ./

RUN npm install --omit=dev

COPY . .

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server.js"]
