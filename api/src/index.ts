/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import { Server } from "http";
import SocketIO from "socket.io";
import bodyParser from "body-parser";
import express, { Application } from "express";
import { IConfiguration } from "./models/configuration/IConfiguration";
import { routes } from "./routes";
import { cors, executeRoute } from "./utils/apiHelper";
import { subscribe } from "./routes/transactions/subscribe";
import { unsubscribe } from "./routes/transactions/unsubscribe";
import { initServices } from "./initServices";

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
            true);
    });
}

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const server = new Server(app);
const socketServer = SocketIO(server);
server.listen(port, async () => {
    console.log("Listening listener");
    console.log(`Started API Server on port ${port}`);
    console.log(`Running Config '${configId}'`);

    socketServer.on("connection", socket => {
        socket.on("subscribe", data => socket.emit("subscribe", subscribe(config, socket, data)));
        socket.on("unsubscribe", data => socket.emit("unsubscribe", unsubscribe(config, socket, data)));
    });

    await initServices(config);
});
