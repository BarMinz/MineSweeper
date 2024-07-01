FROM ubuntu/nginx:1.18-20.04_beta
COPY nginx.conf /etc/nginx/conf.d/
COPY css /var/www/html/
COPY js /var/www/html/
COPY index.html /var/www/html/

RUN useradd -m appuser
USER appuser

HEALTHCHECK CMD curl --fail http://localhost:80 || exit 1
