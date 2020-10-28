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
