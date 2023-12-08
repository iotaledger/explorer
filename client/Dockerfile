# Use Debian-based Node 16 image
FROM node:16

# Update package lists and install dependencies
RUN apt-get update && apt-get install -y \
    git \
    nginx \
    && rm -rf /var/lib/apt/lists/*

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


# List all files and directories
RUN find -ls

# Make postinstall.sh executable
RUN chmod +x ./script/postinstall.sh

# Running required steps to prepare the web app prod build
RUN npm install
RUN npm run build

# Expose port 80
EXPOSE 80

# Serve the prod build
CMD ["nginx", "-g", "daemon off;"]
