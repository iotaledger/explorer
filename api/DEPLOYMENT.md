# Deployment

## Configuration

To configure the `api` you should copy `./src/data/config.template` to `./src/data/config.local.json` and modify the content.

You can configure the application to store data either in Amazon DynamoDB `dynamoDbConnection` or local file storage `rootStorageFolder`. You will need a fixer API key for anything related to currency, you can signup for a free one at [https://fixer.io/](https://fixer.io/)

```js
{
    "fixerApiKey": "FIXER_API_KEY",                  /* API Key for using fixer.io */
    "dynamoDbConnection": {
        "region": "AWS-REGION",                      /* AWS Region e.g. eu-central-1 */
        "accessKeyId": "AWS-ACCESS-KEY-ID",          /* AWS Access Key e.g. AKIAI57SG4YC2ZUCSABC */
        "secretAccessKey": "AWS-SECRET-ACCESS-KEY",  /* AWS Secret e.g. MUo72/UQWgL97QArGt9HVUA */
        "dbTablePrefix": "DATABASE-TABLE-PREFIX"     /* Prefix for database table names e.g. explorer-dev- */
    },
    "rootStorageFolder": "../.local-storage",        /* Optional to use instead of DynamoDB */
    "allowedDomains": [                              /* A list of domains for the cors allow-origin */
        "https://www.mydomain.com"
    ],
    "verboseLogging": false,                         /* Set to true for the API to log all its request/responses */
    "itemsFeedApiUrl": "https://feeds-api.my-domain.com"  /* Optional, if you have offloaded live feeds to a secondary API instance set this field  */
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
    "protocolVersion": "og",
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

For a chrysalis network we use a different `protocolVersion`, add `bechHrp` and remove `depth`, `mwm`, `coordinatorAddress`, `coordinatorSecurityLevel`, also update the `feedEndpoint` to be mqtt.

e.g. `../.local-storage/network/chrysalis.json`

```json
{
    "network": "chrysalis",
    "label": "Chrysalis",
    "provider": "https://api.mynode.com/",
    "primaryColor": "#2E8698",
    "secondaryColor": "#77c6d6",
    "isEnabled": true,
    "isHidden": false,
    "order": 3,
    "feedEndpoint": "mqtt://api.mynode.com:1883",
    "protocolVersion": "chrysalis",
    "bechHrp": "iot",
    "description": "Chrysalis Alphanet network. This network makes no guarantees of its stability."
}
```

An optional `permaNodeEndpoint` can be added if you have access to a chronicle node.

## Running with Docker

A [Dockerfile](./Dockerfile) is also provided, so that you can run the API endpoint as a Docker container. As per the instructions on API [Configuration](#Configuration), you need to provide a configuration for local file storage on the container:

```js
{
    "fixerApiKey": "MY-KEY",
    "rootStorageFolder": "/app/data/.local-storage",  /* container's folder used for local storage */
    "allowedDomains": [
        "http://localhost:3000"
    ],
    "verboseLogging": false
}
```

and copy it to  `./src/data/config.local.json`. 

Afterwards, you need to create a new local folder (for instance `./application-data`) that will be used to store locally the temporary data used by the API implementation. Additionally, under such folder you need to include a `network` sub-folder that will contain the JSON configuration files of the networks managed, as explained in the [Deploy Section](#Deploy). 

When running the Docker container, the folder for data storage (named `/app/data/.local-storage` in our example) will have to be made available through a Volume (see example below) mapped to our folder on the host (`./application-data` in our example).

After the preparations described above, the instructions to be performed are as follows (assuming your current working directory is `api`):

Build the Docker image:

```shell
docker build --tag iotaledger/explorer-api .
```

Create a network (named `explorer` in the example below) for your container (if not created yet). Such network allows you to isolate your container from other containers. If you also run the [client web application](../client) through Docker it is advisable that you run both containers on the same network: 

```shell
docker network create explorer
```

and finally run the container. 

```shell
docker run --name explorer-api --network explorer -p 4000:4000 --volume $(pwd)/application-data:/app/data/.local-storage -d iotaledger/explorer-api
```

Your API endpoint will now be listening to the port `4000` of your localhost. 
