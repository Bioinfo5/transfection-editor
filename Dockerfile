FROM nginx:alpine
#ENV NODE_ENV=production

ADD cp-https.crt /usr/local/share/ca-certificates/cp-https.crt
RUN update-ca-certificates

RUN apk update
RUN apk add vim
RUN apk add --update net-tools

#WORKDIR /opt/app

RUN rm -rf /usr/share/nginx/html

COPY nginx.conf /etc/nginx
COPY ./ /usr/share/nginx/html 

RUN ls -la /usr/share/nginx/html/*
