# Deployment

## Configuration

You should copy `./public/data/config.template.json` to `./public/data/config.local.json` and modify it with your own settings.

```js
{
    "apiEndpoint": "ENDPOINT",                      /* The url of the api endpoint e.g. https://api.my-domain.com */
    "nodesMainnet": [                               /* List of mainnet nodes to load balance across */  
        {
            "provider": "MYNODE",                   /* A node to perform Tangle operations */
            "depth": 3,                             /* Depth to use for attaches */
            "mwm": 9                                /* MWM to use for attaches */
        }
    ],
    "nodesDevnet": [                                /* List of devnet nodes to load balance across */  
        {
            "provider": "MYNODE",                   /* A node to perform Tangle operations */
            "depth": 3,                             /* Depth to use for attaches */
            "mwm": 9                                /* MWM to use for attaches */
        }
    ],
    "googleMapsKey": "GOOGLE-MAPS-KEY",             /* Key for using with Google maps API */
    "googleAnalyticsId": "GOOGLE-ANALYTICS-ID"      /* Optional, google analytics id */
}
```

## Build

```shell
npm run build
```

## Deploy

The app is configured to use zeit/now for hosting, you can configure `./now.json` to suit your own setup.

If you want to use a different name for the config file you can specify an environment variable of CONFIG_ID, e.g. set CONFIG_ID to `dev` will load `config.dev.json` instead.

After modifying the configuration files you can deploy using the folllowing commands:

```shell
now
```
