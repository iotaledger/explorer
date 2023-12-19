# Use Debian-based Node 16 image
FROM node:16

# Update package lists and install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libssl-dev \
    libudev-dev \
    cmake \
    clang \
    curl \
    git \
    python3 \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Working DIR
WORKDIR /usr/src/app

# Copy everything from current Folder
# COPY . ./

# Copy iota-sdk-nova deps REMOVE THIS for prod
# Get Rust
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH="${PATH}:/root/.cargo/bin"

COPY ./client ./
COPY ./iota-sdk/ ../iota-sdk/

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

# Running required steps to prepare the web app prod build
RUN npm install
RUN npm run build

# Expose port 80
EXPOSE 80

# Serve the prod build
CMD ["nginx", "-g", "daemon off;"]
