# Sitio estatico servido con nginx. Pensado para Coolify (build pack: Dockerfile).
FROM nginx:1.27-alpine

COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY docker/nginx.conf            /etc/nginx/conf.d/default.conf

COPY index.html robots.txt support.js config.js /usr/share/nginx/html/
COPY assets/                                   /usr/share/nginx/html/assets/
COPY vendor/                                   /usr/share/nginx/html/vendor/
COPY admin/                                    /usr/share/nginx/html/admin/

EXPOSE 80
