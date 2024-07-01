FROM nginx
COPY nginx.conf /etc/nginx/conf.d/
COPY css /var/www/html/
COPY js /var/www/html/
COPY index.html /var/www/html/
