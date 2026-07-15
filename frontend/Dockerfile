# Aşama 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json* ./

RUN npm ci

COPY . .

# VITE_BACKEND_URL boş → socket window.location.origin kullanır (ismetpascha.com.tr)
ARG VITE_BACKEND_URL=""
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN npm run build

# Aşama 2: Nginx ile servis et
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
