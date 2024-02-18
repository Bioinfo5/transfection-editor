FROM nginx:alpine

# Add your custom CA certificate
ADD cp-https.crt /usr/local/share/ca-certificates/cp-https.crt
RUN update-ca-certificates

# Install additional packages
RUN apk update && \
    apk add vim && \
    apk add --update net-tools

# Remove default Nginx HTML files
RUN rm -rf /usr/share/nginx/html

# Copy your Nginx configuration and website files
COPY nginx.conf /etc/nginx
COPY ./ /usr/share/nginx/html 

# Ensure files have the correct permissions and ownership
# Change ownership to `nginx` user and group
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

RUN ls -la /usr/share/nginx/html/*