FROM node:20-alpine AS builder

WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM alpine:3.19

RUN apk add --no-cache nginx gettext

COPY --from=builder /build/dist /var/www/html
COPY public/config.js /var/www/html/config.js

RUN printf 'server {\n    listen 80;\n    root /var/www/html;\n    index index.html;\n    location / {\n        try_files $uri $uri/ /index.html;\n    }\n}\n' > /etc/nginx/http.d/default.conf

RUN printf '#!/bin/sh\nexport API_BASE_URL=${API_BASE_URL}\nenvsubst < /var/www/html/config.js > /tmp/config.js\ncp /tmp/config.js /var/www/html/config.js\nexec nginx -g "daemon off;"\n' > /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

CMD ["/docker-entrypoint.sh"]
