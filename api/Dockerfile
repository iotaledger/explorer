FROM node:16.20.2-bullseye

## Include the build tools for any npm packages that rebuild
RUN apt install git curl python3

# Working DIR
WORKDIR /usr/src/app

# Copy everything from current Folder
COPY . ./

# Set the env variables
ARG CONFIG_ID

# Install all packages necessary for compilation, build, then remove the devDependencies
# Seems to fail for arm64 images if maxsockets is not set to 1. https://github.com/npm/cli/issues/4652#issuecomment-1157594100
RUN npm install --maxsockets 1
RUN npm run build-compile
RUN npm run build-config
RUN npm prune --production

# Expose the external port for binding to
EXPOSE 4000

# Increase security by running as node user instead of root
USER node

# Serve the prod build from the dist folder
CMD ["node", "dist/index"]
