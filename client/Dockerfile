FROM node:12.14.1-alpine3.11
RUN apk update
RUN apk --no-cache add git
RUN apk --no-cache add nginx

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
    }\
  }' > /etc/nginx/conf.d/default.conf

# Running required steps to prepare the web app prod build
RUN npm install
RUN npm run build

RUN mkdir /run/nginx
EXPOSE 80

# Serve the prod build
CMD ["nginx", "-g", "daemon off;"]
