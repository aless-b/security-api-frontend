#!/bin/sh
set -e

# Fallback default values if environment variables are omitted
export API_KEY="${API_KEY:-SECRET_EDUCATIONAL_KEY_12345}"
export BACKEND_URL="${BACKEND_URL:-http://host.docker.internal:3000}"

# Substitute environment variables into Nginx template
# Explicitly specifying $API_KEY and $BACKEND_URL prevents envsubst from overwriting Nginx variables like $uri
envsubst '$API_KEY $BACKEND_URL' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Execute the container's primary command (CMD)
exec "$@"
