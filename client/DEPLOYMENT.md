# Deployment

## Configuration

You should copy `./src/assets/config/config.template` to `./src/assets/config/config.local.json` and modify it with your own settings.

```js
{
    "apiEndpoint": "ENDPOINT",                      /* The url of the api endpoint e.g. https://api.my-domain.com */
    "googleAnalyticsId": "GOOGLE-ANALYTICS-ID"      /* Optional, google analytics id */
}
```

e.g. To run it locally with the API

```json
{
    "apiEndpoint": "http://localhost:4000/"
}
```

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

A Dockerfile is also provided to run the application as a Docker container. First of all you should [configure](#Configuration) the application, to point to the corresponding API endpoint. The API endpoint might be based on Docker as well, as explained [here](../api/DEPLOYMENT.md).

Build the Docker image: 

```shell
docker build --tag iotaledger/explorer-webapp .
```

Create (if not created yet) a network for your container:

```shell
docker network create explorer
```

And finally run the container:

```shell
docker run --name explorer-webapp -p 8080:80 -d --network explorer iotaledger/explorer-webapp 
```

Your application will now be listening to the port `8080` of your localhost. 
