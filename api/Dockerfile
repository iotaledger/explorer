FROM node:14-alpine3.13
RUN apk --no-cache add git

# Working DIR
WORKDIR /usr/src/app

# Copy everything from current Folder
COPY . ./

# Update NPM
RUN npm install -g npm

# Set the env variables
ARG CONFIG_ID
RUN echo "CONFIG_ID=$CONFIG_ID"

# Running required steps to prepare the api prod build
RUN npm install
RUN npm run build

EXPOSE 4000

USER node
# Serve the prod build from the dist folder
CMD ["node", "dist/index"]
