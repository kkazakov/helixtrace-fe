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

RUN echo 'IyEvYmluL3NoCmVudnN1YnN0IDwgL3Zhci93d3cvaHRtbC9jb25maWcuanMgPiAvdG1wL2NvbmZpZy5qcwpjcCAvdG1wL2NvbmZpZy5qcyAvdmFyL3d3dy9odG1sL2NvbmZpZy5qcwpleGVjIG5naW54IC1nICJkYWVtb24gb2ZmOyIK' | base64 -d > /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

CMD ["/docker-entrypoint.sh"]
