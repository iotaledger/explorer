const fs = require("fs");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const evalSourceMap = require("react-dev-utils/evalSourceMapMiddleware");
const redirectServedPath = require("react-dev-utils/redirectServedPathMiddleware");
const noopServiceWorker = require("react-dev-utils/noopServiceWorkerMiddleware");

module.exports = {
    eslint: {
        enable: false
    },
    webpack: {
        plugins: {
            add: [
                new NodePolyfillPlugin({
                    excludeAliases: ["console"],
                }),
            ],
        },
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
        };
        return devServerConfig;
    },
};
