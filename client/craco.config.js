const fs = require("fs");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const evalSourceMap = require("react-dev-utils/evalSourceMapMiddleware");
const redirectServedPath = require("react-dev-utils/redirectServedPathMiddleware");
const noopServiceWorker = require("react-dev-utils/noopServiceWorkerMiddleware");
const CopyWebPlugin = require('copy-webpack-plugin');

const { addAfterLoader, loaderByName } = require('@craco/craco');

module.exports = {
    eslint: {
        enable: false
    },
    webpack: {
        configure: (webpackConfig) => {
            const wasmExtensionRegExp = /\.wasm$/;
            webpackConfig.resolve.extensions.push('.wasm');

            webpackConfig.module.rules.forEach((rule) => {
                (rule.oneOf || []).forEach((oneOf) => {
                    if (oneOf.loader && oneOf.loader.indexOf('file-loader') >= 0) {
                        oneOf.exclude.push(wasmExtensionRegExp);
                    }
                });
            });

            const wasmLoader = {
                loader: require.resolve('wasm-loader'),
            };

            addAfterLoader(webpackConfig, loaderByName('file-loader'), wasmLoader);

            return webpackConfig;
        },
        plugins: {
            add: [
                new CopyWebPlugin({
                    patterns: [
                        {
                            from: 'node_modules/@iota/sdk-wasm/web/wasm/iota_sdk_wasm_bg.wasm',
                            to: 'iota_sdk_wasm_bg.wasm'
                        },
                        {
                            from: 'node_modules/@iota/identity-wasm/web/identity_wasm_bg.wasm',
                            to: 'identity_wasm_bg.wasm'
                        }
                    ]
                }),
                new NodePolyfillPlugin({
                    excludeAliases: ["console"],
                })
            ],
        },
    },
    babel: {
        plugins: [["@babel/plugin-transform-typescript", { allowDeclareFields: true }]]
    },
    devServer: (devServerConfig, { env, paths }) => {
        devServerConfig = {
            onBeforeSetupMiddleware: undefined,
            onAfterSetupMiddleware: undefined,
            setupMiddlewares: (middlewares, devServer) => {
                if (!devServer) {
                    throw new Error("webpack-dev-server is not defined");
                }
                if (fs.existsSync(paths.proxySetup)) {
                    require(paths.proxySetup)(devServer.app);
                }
                middlewares.push(
                    evalSourceMap(devServer),
                    redirectServedPath(paths.publicUrlOrPath),
                    noopServiceWorker(paths.publicUrlOrPath)
                );
                return middlewares;
            },
            historyApiFallback: true
        };
        return devServerConfig;
    },
};
