/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import bodyParser from "body-parser";
import compression from "compression";
import express, { Application } from "express";
import { Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { initServices } from "./initServices";
import { IFeedSubscribeRequest } from "./models/api/IFeedSubscribeRequest";
import { IConfiguration } from "./models/configuration/IConfiguration";
import { routes } from "./routes";
import { subscribe } from "./routes/feed/subscribe";
import { unsubscribe } from "./routes/feed/unsubscribe";
import { cors, executeRoute, matchRouteUrl } from "./utils/apiHelper";

const configId = process.env.CONFIG_ID || "local";
const config: IConfiguration = require(`./data/config.${configId}.json`);

const configAllowedOrigins: string[] = config.allowedDomains ?? ["*"];
const configAllowedMethods: string =
    !config.allowedMethods || config.allowedMethods === "ALLOWED-METHODS"
        ? "GET, POST, OPTIONS" : config.allowedMethods;
const configAllowedHeaders: string =
    !config.allowedHeaders || config.allowedHeaders === "ALLOWED-HEADERS"
        ? "Content-Type" : config.allowedHeaders;

const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 4000;

const app: Application = express();

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use(compression());

app.use((req, res, next) => {
    let allowedOrigins = configAllowedOrigins;
    let allowedMethods = configAllowedMethods;
    let allowedHeaders = configAllowedHeaders;

    if (config.routeCors) {
        const foundRoute = matchRouteUrl(config.routeCors.map(c => c.path), req.url);

        if (foundRoute) {
            const routeCors = config.routeCors[foundRoute.index];
            allowedOrigins = routeCors.allowedDomains ?? allowedOrigins;
            allowedMethods = routeCors.allowedMethods ?? allowedMethods;
            allowedHeaders = routeCors.allowedHeaders ?? allowedHeaders;
        }
    }

    cors(
        req,
        res,
        allowedOrigins,
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
const socketServer = new SocketIOServer(server);

const sockets: {
    [socketId: string]: string;
} = {};

socketServer.on("connection", socket => {
    console.log("Socket::Connection", socket.id);
    socket.on("subscribe", async (data: IFeedSubscribeRequest) => {
        const response = await subscribe(config, socket, data);
        if (!response.error) {
            sockets[socket.id] = data.network;
        }
        console.log("Socket::Subscribe", socket.id);
        socket.emit("subscribe", response);
    });

    socket.on("unsubscribe", data => {
        console.log("Socket::Unsubscribe", socket.id);
        const response = unsubscribe(config, socket, data);
        if (sockets[socket.id]) {
            delete sockets[socket.id];
        }
        socket.emit("unsubscribe", response);
    });

    socket.on("disconnect", async () => {
        console.log("Socket::Disconnect", socket.id);
        if (sockets[socket.id]) {
            await unsubscribe(config, socket, {
                subscriptionId: sockets[socket.id],
                network: sockets[socket.id]
            });
            delete sockets[socket.id];
        }
    });
});

server.listen(port, async () => {
    console.log(`Running Config '${configId}'`);
    console.log(`API port ${port}`);

    try {
        console.log("Initializing Services");
        await initServices(config);
        console.log("Services Initialized");
    } catch (err) {
        console.error(err);
    }
});

