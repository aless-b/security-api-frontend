# Base image: Nginx 1.27 Alpine
FROM nginx:1.27-alpine

# Copy Nginx template and entrypoint script from docker/ directory
COPY docker/nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY docker/docker-entrypoint.sh /docker-entrypoint.sh

# Ensure execution permissions for the entrypoint script
RUN chmod +x /docker-entrypoint.sh

# Copy static frontend assets from src/ directory
COPY src/ /usr/share/nginx/html/

# Expose HTTP port 80
EXPOSE 80

# Configure entrypoint script and default command
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
