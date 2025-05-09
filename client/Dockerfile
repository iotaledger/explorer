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
  }' > /etc/nginx/sites-available/default

# Set Content-Type so streaming compilation works
RUN mv ./nginx/wasm.conf /etc/nginx/conf.d/wasm.conf

# Running required steps to prepare the web app prod build
# Seems to fail for arm64 images if maxsockets is not set to 1. https://github.com/npm/cli/issues/4652#issuecomment-1157594100
RUN npm install --maxsockets 1
RUN npm run build

# Expose port 80
EXPOSE 80

# Serve the prod build
CMD ["nginx", "-g", "daemon off;"]