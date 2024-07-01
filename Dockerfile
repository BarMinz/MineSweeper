FROM nginx:stable-alpine3.19

# Copy nginx configuration and static files
COPY nginx.conf /etc/nginx/conf.d/
COPY css /var/www/html/
COPY js /var/www/html/
COPY index.html /var/www/html/

# Create appuser and switch to it
RUN useradd -m appuser

# Adjust ownership of copied files
RUN chown -R appuser:appuser /etc/nginx/conf.d /var/www/html

# Healthcheck command
HEALTHCHECK CMD curl --fail http://localhost:80 || exit 1

# Switch to the appuser
USER appuser
