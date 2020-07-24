/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import bodyParser from "body-parser";
import express, { Application } from "express";
import { Server } from "http";
import SocketIO from "socket.io";
import { initServices } from "./initServices";
import { ITransactionsSubscribeRequest } from "./models/api/ITransactionsSubscribeRequest";
import { IConfiguration } from "./models/configuration/IConfiguration";
import { routes } from "./routes";
import { subscribe } from "./routes/transactions/subscribe";
import { unsubscribe } from "./routes/transactions/unsubscribe";
import { cors, executeRoute } from "./utils/apiHelper";

const configId = process.env.CONFIG_ID || "local";
const config: IConfiguration = require(`./data/config.${configId}.json`);

const app: Application = express();

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use((req, res, next) => {
    cors(
        req,
        res,
        config.allowedDomains ? config.allowedDomains.join(",") : undefined,
        "GET, POST, OPTIONS, PUT, PATCH, DELETE",
        "Content-Type, Authorization");
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
            config.verboseLogging,
            true);
    });
}

const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 4000;
const server = new Server(app);
// eslint-disable-next-line new-cap
const socketServer = SocketIO(server);

server.listen(port, async () => {
    console.log("Listening listener");
    console.log(`Started API Server on port ${port}`);
    console.log(`Running Config '${configId}'`);

    const sockets: {
        [socketId: string]: {
            network: string;
            subscriptionId: string;
        };
    } = {};

    socketServer.on("connection", socket => {
        socket.on("subscribe", (data: ITransactionsSubscribeRequest) => {
            const response = subscribe(config, socket, data);
            if (response.subscriptionId) {
                sockets[socket.id] = {
                    network: data.network,
                    subscriptionId: response.subscriptionId
                };
            }
            socket.emit("subscribe", response);
        });

        socket.on("unsubscribe", data => {
            const response = unsubscribe(config, socket, data);
            if (sockets[socket.id]) {
                delete sockets[socket.id];
            }
            socket.emit("unsubscribe", response);
        });

        socket.on("disconnect", () => {
            if (sockets[socket.id]) {
                unsubscribe(config, socket, sockets[socket.id]);
                delete sockets[socket.id];
            }
        });
    });

    await initServices(config);
});
