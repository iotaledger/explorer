# Deployment

## Configuration

To configure the `api` you should copy `./src/data/config.json.template` to `./src/data/config.local.json` and modify the content.

```js
{
    "fixerApiKey": "FIXER_API_KEY"                   /* API Key for using fixer.io */
    "dynamoDbConnection": {
        "region": "AWS-REGION",                      /* AWS Region e.g. eu-central-1 */
        "accessKeyId": "AWS-ACCESS-KEY-ID",          /* AWS Access Key e.g. AKIAI57SG4YC2ZUCSABC */
        "secretAccessKey": "AWS-SECRET-ACCESS-KEY",  /* AWS Secret e.g. MUo72/UQWgL97QArGt9HVUA */
        "dbTablePrefix": "DATABASE-TABLE-PREFIX"     /* Prefix for database table names e.g. explorer-dev- */
    },
    "networks": [                                    /* List of networks to support */
        {
            "network": "mainnet",                    /* Network type */
            "label": "Mainnet",                      /* Nework display label */
            "node": {                                /* Node for requests */
                "provider": "NODE_1",                /* Address for node */
                "depth": 3,                          /* Depth for network */             
                "mwm": 14                            /* MWM for network */
            },
            "zmqEndpoint": "ZMQ_ENDPOINT",           /* Endpoint for zmq subscriptions */
            "permaNodeEndpoint": "PERMA_ENDPOINT",   /* Permanode endpoint for historical transactions */
            "coordinatorAddress": "AAA...ZZZ"        /* Coordinator Address on network */
        }
    ],
    "allowedDomains": [                              /* A list of domains for the cors allow-origin */
        "www.mydomain.com"
    ]
}
```

## Build

```shell
npm run build
```

## Deploy

The `api` package is setup to be deployed to zeit/now, you should modify the config in `./now.json` to suit your own requirements and then execute the following.

If you want to use a different name for the config file you can specify an environment variable of CONFIG_ID, e.g. set CONFIG_ID to `dev` will load `config.dev.json` instead.

```shell
now
```
