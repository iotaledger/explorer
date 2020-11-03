# Deployment

## Configuration

To configure the `api` you should copy `./src/data/config.template` to `./src/data/config.local.json` and modify the content.

You can configure the application to store data either in Amazon DynamoDB `dynamoDbConnection` or local file storage `rootStorageFolder`. You will need a fixer API key for anything related to currency, you can signup for a free one at [https://fixer.io/](https://fixer.io/)

```js
{
    "fixerApiKey": "FIXER_API_KEY"                   /* API Key for using fixer.io */
    "dynamoDbConnection": {
        "region": "AWS-REGION",                      /* AWS Region e.g. eu-central-1 */
        "accessKeyId": "AWS-ACCESS-KEY-ID",          /* AWS Access Key e.g. AKIAI57SG4YC2ZUCSABC */
        "secretAccessKey": "AWS-SECRET-ACCESS-KEY",  /* AWS Secret e.g. MUo72/UQWgL97QArGt9HVUA */
        "dbTablePrefix": "DATABASE-TABLE-PREFIX"     /* Prefix for database table names e.g. explorer-dev- */
    },
    "rootStorageFolder": "../.local-storage",        /* Optional to use instead of DynamoDB */
    "allowedDomains": [                              /* A list of domains for the cors allow-origin */
        "www.mydomain.com"
    ],
    "verboseLogging": false                          /* Set to true for the API to log all its request/responses */
}
```

e.g. To run the API locally

```json
{
    "fixerApiKey": "MY-KEY",
    "rootStorageFolder": "../.local-storage",
    "allowedDomains": [
        "http://localhost:3000"
    ],
    "verboseLogging": false
}
```

## Build

```shell
npm run build
```

## Running

You can run the API by doing the following:

```shell
npm run start
```

## Deploy

Once the API is running you need to initialise the storage by visiting http://localhost:3000/init or wherever you have deployed the API.

You will need at least one network configured, if you have configured to use local storage folder e.g. `../.local-storage/` you can create a network record in a .json file there.

e.g. `../.local-storage/network/mainnet.json`

```json
{
    "network": "mainnet",
    "label": "Mainnet",
    "provider": "https://nodes.iota.cafe:443",
    "depth": 3,
    "mwm": 14,
    "feedEndpoint": "tcp://zmq.iota.org:5556",
    "coordinatorAddress": "UDYXTZBE9GZGPM9SSQV9LTZNDLJIZMPUVVXYXFYVBLIEUHLSEWFTKZZLXYRHHWVQV9MNNX9KZC9D9UZWZ",
    "coordinatorSecurityLevel": 2,
    "primaryColor": "#131F37",
    "secondaryColor": "#485776",
    "isEnabled": true,
    "showMarket": true,
    "order": 0,
    "description": "Mainnet is the IOTA network that uses the IOTA tokens that are traded on cryptocurrency exchanges. This network is the most stable."
}
```

An optional `permaNodeEndpoint` can be added if you have access to a chronicle node.
