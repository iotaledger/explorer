/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import compression from "compression";
import * as dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import { Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NetworkConfigurationError } from "./errors/networkConfigurationError";
import { initServices } from "./initServices";
import logger from "./logger";
import { IFeedUnsubscribeRequest } from "./models/api/IFeedUnsubscribeRequest";
import { INetworkBoundGetRequest } from "./models/api/INetworkBoundGetRequest";
import { IConfiguration } from "./models/configuration/IConfiguration";
import { routes } from "./routes";
import { subscribe } from "./routes/feed/subscribe";
import { unsubscribe } from "./routes/feed/unsubscribe";
import { cors, executeRoute, matchRouteUrl } from "./utils/apiHelper";

const configId = process.env.CONFIG_ID || "local";
const config: IConfiguration = require(`./data/config.${configId}.json`);

const configAllowedDomains: (string | RegExp)[] | undefined = [];
const configAllowedMethods: string | undefined =
    !config.allowedMethods || config.allowedMethods === "ALLOWED-METHODS"
        ? undefined : config.allowedMethods;
const configAllowedHeaders: string | undefined =
    !config.allowedHeaders || config.allowedHeaders === "ALLOWED-HEADERS"
        ? undefined : config.allowedHeaders;

if (Array.isArray(config.allowedDomains)) {
    for (const dom of config.allowedDomains) {
        if (dom.indexOf("*") > 0) {
            configAllowedDomains.push(new RegExp(dom.replace(/\*/g, "(.*)")));
        } else {
            configAllowedDomains.push(dom);
        }
    }
}

const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 4000;

const app: Application = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(compression());

app.use((req, res, next) => {
    let allowedDomains = configAllowedDomains;
    let allowedMethods = configAllowedMethods;
    let allowedHeaders = configAllowedHeaders;

    if (config.routeCors) {
        const foundRoute = matchRouteUrl(config.routeCors.map(c => c.path), req.url);

        if (foundRoute) {
            const routeCors = config.routeCors[foundRoute.index];
            allowedDomains = routeCors.allowedDomains ?? allowedDomains;
            allowedMethods = routeCors.allowedMethods ?? allowedMethods;
            allowedHeaders = routeCors.allowedHeaders ?? allowedHeaders;
        }
    }

    cors(
        req,
        res,
        allowedDomains,
        allowedMethods,
        allowedHeaders);
    next();
});

for (const route of routes) {
    app[route.method](route.path, async (req, res) => {
        await executeRoute(
            req,
            res,
            config,
            route,
            req.params,
            config.verboseLogging);
    });
}

const server = new Server(app);
const socketServer = new SocketIOServer(server, { pingInterval: 5000, pingTimeout: 2000 });

const sockets: {
    [socketId: string]: string;
} = {};

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

socketServer.on("connection", socket => {
    logger.debug(`Socket::Connection [${socket.id}]`);
    socket.on("subscribe", async (data: INetworkBoundGetRequest) => {
        const response = await subscribe(config, socket, data);
        if (!response.error) {
            sockets[socket.id] = data.network;
        }
        logger.debug(`Socket::Subscribe [${socket.id}]`);
        socket.emit("subscribe", response);
    });

    socket.on("replayAttack", async (data: INetworkBoundGetRequest) => {
        logger.debug(`Socket::ReplayAttack [${socket.id}]`);

        const maxIterations = 5;

        for (let i = 0; i < maxIterations; i++) {
            console.log(`Iteration: ${i}`);
            socket.emit("replayAttack", {foo: 'bar'});
            await delay(1000); // Delay of 1 second for each iteration
        }
        socket.emit("replayAttackEnd");
    });

    socket.on("unsubscribe", (data: IFeedUnsubscribeRequest) => {
        logger.debug(`Socket::Unsubscribe [${socket.id}]`);
        const response = unsubscribe(config, socket, data);
        if (sockets[socket.id]) {
            delete sockets[socket.id];
        }
        socket.emit("unsubscribe", response);
    });

    socket.on("disconnect", async () => {
        logger.debug(`Socket::Disconnect [${socket.id}]`);
        if (sockets[socket.id]) {
            await unsubscribe(config, socket, {
                subscriptionId: socket.id,
                network: sockets[socket.id]
            });
            delete sockets[socket.id];
        }
    });
});

server.listen(port, async () => {
    const version = process.env.npm_package_version ? `(v${process.env.npm_package_version})` : "";
    const env = process.env.NODE_ENV ? `Env: ${process.env.NODE_ENV}` : "";
    logger.info(`Running Explorer API ${version} on port: ${port}. ${env}`);
    logger.verbose(`Config: "${configId}", Logger level: "${logger.level}"`);

    try {
        logger.verbose("Initializing services...");
        await initServices(config);
        logger.info("Services Initialized");
    } catch (err) {
        if (err instanceof NetworkConfigurationError) {
            throw err;
        }
    }
});

