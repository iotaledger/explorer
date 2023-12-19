FROM node:16.20.2-bullseye

## Include the build tools for any npm packages that rebuild
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
    && rm -rf /var/lib/apt/lists/*

# Working DIR
WORKDIR /usr/src/app

# Copy everything from current Folder
# COPY . ./

# Copy iota-sdk-nova deps REMOVE THIS for prod
# Get Rust
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH="${PATH}:/root/.cargo/bin"

COPY ./api ./
COPY ./iota-sdk/ ../iota-sdk/

# Set the env variables
ARG CONFIG_ID

# Install all packages necessary for compilation, build, then remove the devDependencies
RUN npm install
RUN npm run build-compile
RUN npm run build-config
RUN npm prune --production

# Expose the external port for binding to
EXPOSE 4000

# Increase security by running as node user instead of root
USER node

# Serve the prod build from the dist folder
CMD ["node", "dist/index"]
