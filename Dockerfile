FROM nginx:stable-alpine3.19

# Create necessary directories and set permissions
RUN mkdir -p /var/cache/nginx 
RUN chown -R nginx:nginx /var/cache/nginx

# Copy nginx configuration and static files
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY css /var/www/html/css/
COPY js /var/www/html/js/
COPY index.html /var/www/html/

# Create appuser and switch to it
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /etc/nginx/conf.d /var/www/html \
    && chmod -R 755 /var/www/html

# Healthcheck command
HEALTHCHECK CMD curl --fail http://localhost:80 || exit 1

# Switch to the appuser
USER appuser
