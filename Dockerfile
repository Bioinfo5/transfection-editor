FROM nginx:alpine

# Add your custom CA certificate
ADD cp-https.crt /usr/local/share/ca-certificates/cp-https.crt
RUN update-ca-certificates

# Remove default Nginx HTML files
RUN rm -rf /usr/share/nginx/html

# Copy your Nginx configuration and website files
COPY nginx.conf /etc/nginx
COPY ./ /usr/share/nginx/html 

# Ensure files have the correct permissions and ownership
# Change ownership to `nginx` user and group
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Environment variables with defaults
ENV API_URL="https://plate-editor-api.example.com"
ENV API_METADATA_OPTIONS="api/plateEditor/metadataOptions"

# Create entrypoint script to substitute environment variables at runtime
RUN echo '#!/bin/sh' > /docker-entrypoint.d/40-envsubst-config.sh && \
    echo 'envsubst < /usr/share/nginx/html/dist/config.json > /tmp/config.json && mv /tmp/config.json /usr/share/nginx/html/dist/config.json' >> /docker-entrypoint.d/40-envsubst-config.sh && \
    chmod +x /docker-entrypoint.d/40-envsubst-config.sh

RUN ls -la /usr/share/nginx/html/*