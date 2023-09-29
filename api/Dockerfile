FROM node:16-alpine

## Include the build tools for any npm packages that rebuild
RUN apk --no-cache add git curl python3 build-base cmake

# Get Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
ENV PATH="/root/.cargo/bin:${PATH}"

# Working DIR
WORKDIR /usr/src/app

# Copy everything from current Folder
COPY . ./

# Set the env variables
ARG CONFIG_ID

# Install all packages necessary for compilation, build, then remove the devDependencies
RUN npm install --loglevel verbose
RUN npm run build-compile
RUN npm run build-config
RUN npm prune --production

# Expose the external port for binding to
EXPOSE 4000

# Increase security by running as node user instead of root
USER node

# Serve the prod build from the dist folder
CMD ["node", "dist/index"]
