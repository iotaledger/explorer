FROM node:14-alpine3.13 AS build
RUN apk --no-cache add git curl python3 build-base cmake

# Working DIR
WORKDIR /usr/src/app

# Copy everything from current Folder
COPY . ./

# Update NPM
RUN npm install -g npm

# Set the env variables
ARG CONFIG_ID
RUN echo "CONFIG_ID=$CONFIG_ID"

# Install all packages necessary for compilation, then remove the devDependencies
RUN npm install && npm run build-config && npm run build-compile && npm prune --production

FROM node:14-alpine3.13

WORKDIR /usr/src/app

RUN apk --no-cache add git

COPY --from=build /usr/src/app .

EXPOSE 4000

USER node
# Serve the prod build from the dist folder
CMD ["node", "dist/index"]
