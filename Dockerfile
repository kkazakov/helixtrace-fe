FROM node:20-alpine AS builder

WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
RUN VITE_API_BASE_URL=${VITE_API_BASE_URL} npm run build

FROM alpine:3.19

RUN apk add --no-cache nginx

COPY --from=builder /build/dist /var/www/html

RUN printf 'server {\n    listen 80;\n    root /var/www/html;\n    index index.html;\n    location / {\n        try_files $uri $uri/ /index.html;\n    }\n}\n' > /etc/nginx/http.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
