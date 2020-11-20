FROM node:12.14.1-alpine3.11
RUN apk add -U --no-cache git nginx

# Working DIR
WORKDIR /usr/src/app

# Copy everything from current Folder
COPY . ./

# A minimal NGINX configuration
RUN echo 'server {\
    listen       80;\
    server_name  localhost;\
    location / {\
        root   /usr/src/app/build;\
        index  index.html index.htm;\
        try_files $uri /index.html;\
    }\
  }' > /etc/nginx/conf.d/default.conf

# Running required steps to prepare the web app prod build
RUN npm install
RUN npm run build

RUN mkdir /run/nginx
EXPOSE 80

# Serve the prod build
CMD ["nginx", "-g", "daemon off;"]
