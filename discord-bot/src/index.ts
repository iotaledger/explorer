import express from "express";
import { App } from "./app";
import { IConfiguration } from "./models/IConfiguration";

const configId = process.env.CONFIG_ID || "local";
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const config: IConfiguration = require(`./data/config.${configId}.json`);
const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 8080;

const botApplication = new App(config);

const app = express();

app.get("/", (req, res) => {
    res.send("Beep Boop, I am the IOTA Explorer Bot!");
});

app.get("/start", async (req, res) => {
    await botApplication.start();
    res.send("OK");
});

app.get("/stop", async (req, res) => {
    await botApplication.stop();
    res.send("OK");
});

app.listen(port, async () => {
    console.log(`Web server running on port ${port}`);
    await botApplication.start();
});
