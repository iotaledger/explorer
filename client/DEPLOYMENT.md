# Deployment

## Configuration

Add the URL of the api endpoint in `./public/env.js` (rename `./public/env.js.template`).

e.g. To run it locally.

```
window.env = {
  API_ENDPOINT: 'http://localhost:4000/'
};
```

Set `REACT_APP_IDENTITY_RESOLVER_ENABLED` to `true` in `./.env` to Enable the Identity Resolver Tool.

## Build

```shell
npm run build
```

## Running

Now that the app has been built you can run it with.

```shell
npm run start
```

## Running with Docker

A [Dockerfile](./Dockerfile) is also provided to run the web application as a Docker container. First of all you need to [configure](#Configuration) the application, to point to the corresponding API endpoint. The API endpoint might be based on Docker as well, as explained [here](../api/DEPLOYMENT.md#running-with-docker).

Build the Docker image: 

```shell
docker build --tag iotaledger/explorer-webapp .
```

Create (if not created yet) a network for your container (named `explorer` in the example below). Such network allows you to isolate your container from other containers. If you also run the [API endpoint](../api) through Docker it is advisable that you run both containers in the same network. 

```shell
docker network create explorer
```

And finally run the container for the web application:

```shell
docker run --name explorer-webapp -p 3000:80 --network explorer -d iotaledger/explorer-webapp 
```

Your application will now be listening to the port `3000` of your localhost. 
