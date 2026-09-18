#!/bin/sh
set -e

# Export environment variables
export API_SECRET="${API_SECRET}"
export BACKEND_URL="${BACKEND_URL}"
export LDAP_API_URL="${LDAP_API_URL}"

# Write API_SECRET to /etc/environment so docker exec sh commands read active secret
echo "export API_SECRET=\"${API_SECRET}\"" > /etc/environment
echo "export BACKEND_URL=\"${BACKEND_URL}\"" >> /etc/environment
echo "export LDAP_API_URL=\"${LDAP_API_URL}\"" >> /etc/environment

# Substitute environment variables into Nginx configuration
envsubst '$API_SECRET $BACKEND_URL $LDAP_API_URL' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Start internal Python Crypto API service in background (loopback port 8000)
PYTHONPATH=/app uvicorn crypto_app.main:app --host 127.0.0.1 --port 8000 &

# Execute foreground Nginx command (CMD)
exec "$@"
