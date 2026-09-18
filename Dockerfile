# Unified Container: Nginx + Python 3.12 Asymmetric Crypto API
FROM python:3.12-slim

# Set POSIX shell environment file so docker exec sh commands automatically load updated secrets
ENV ENV=/etc/environment

# Install Nginx and gettext (for envsubst)
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    gettext-base \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python crypto dependencies
COPY crypto_app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python Crypto API source code
COPY crypto_app ./crypto_app

# Copy Nginx template & entrypoint script
COPY docker/nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy static Web Frontend assets
COPY src/ /usr/share/nginx/html/

# Create persistent keys directory
RUN mkdir -p /app/keys

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
