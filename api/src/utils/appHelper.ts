import bodyParser from "body-parser";
import cors from "cors";
import express, { Application } from "express";
import path from "path";
import { inspect } from "util";
import { HttpError } from "../errors/httpError";
import { IDataResponse } from "../models/api/IDataResponse";
import { IRoute } from "../models/app/IRoute";
import { IConfiguration } from "../models/configuration/IConfiguration";

/**
 * Class to help with expressjs routing.
 */
export class AppHelper {
    /**
     * Build the application from the routes and the configuration.
     * @param routes The routes to build the application with.
     * @param onComplete Callback called when app is successfully built.
     * @param customListener If true uses a custom listener otherwise listens for you during build process.
     * @returns The express js application.
     */
    public static build(
        routes: IRoute[],
        onComplete?: (app: Application, config: IConfiguration, port: number) => Promise<void>,
        customListener: boolean = false): Application {
        // tslint:disable:no-var-requires no-require-imports
        const packageJson = require("../../package.json");
        const configId = process.env.CONFIG_ID || "local";
        // tslint:disable-next-line:non-literal-require
        const config: IConfiguration = require(`../data/config.${configId}.json`);

        const app: Application = express();

        const corsConfig = {
            origin: config.allowedDomains && config.allowedDomains.length > 0 ? config.allowedDomains : "*",
            methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
            allowedHeaders: ["content-type", "authorization"]
        };

        app.use(cors(corsConfig));

        app.use(bodyParser.json({ limit: "10mb" }));
        app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
        app.use(bodyParser.json());

        routes.unshift(
            {
                path: "/",
                method: "get",
                inline: async () => ({ name: packageJson.name, version: packageJson.version })
            });

        app.use("/docs", express.static(path.resolve(__dirname, "../", "docs")));

        AppHelper.buildRoutes(config, app, routes);

        const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
        if (!customListener) {
            app.listen(port, async err => {
                if (err) {
                    throw err;
                }

                console.log(`Started API Server on port ${port} v${packageJson.version}`);
                console.log(`Running Config '${configId}'`);

                if (onComplete) {
                    try {
                        await onComplete(app, config, port);
                    } catch (err) {
                        console.error("Failed running startup", err);
                    }
                }
            });
        } else {
            if (onComplete) {
                onComplete(app, config, port).catch(err => {
                    console.error("Failed running startup", err);
                });
            }
        }

        return app;
    }

    /**
     * Build routes and connect them to express js.
     * @param config The configuration.
     * @param app The expressjs app.
     * @param routes The routes.
     */
    public static buildRoutes(config: IConfiguration, app: Application, routes: IRoute[]): void {
        for (const route of routes) {
            app[route.method](route.path, async (req, res) => {
                let response;
                const start = Date.now();

                try {
                    let params = { ...req.params, ...req.query };
                    let body;
                    if (route.dataBody) {
                        body = req.body;
                    } else {
                        params = { ...params, ...req.query, ...req.body };
                    }

                    console.log(`===> ${route.method.toUpperCase()} ${route.path}`);
                    console.log(inspect(params, false, null, true));

                    if (route.func) {
                        let modulePath = "../routes/";
                        if (route.folder) {
                            modulePath += `${route.folder}/`;
                        }
                        modulePath += route.func;
                        // tslint:disable-next-line:non-literal-require
                        const mod = require(modulePath);
                        response = await mod[route.func](config, params, body, req.headers || {});
                    } else if (route.inline !== undefined) {
                        response = await route.inline(config, params, body, req.headers || {});
                    }
                } catch (err) {
                    res.status(err.httpCode || 400);
                    response = { success: false, message: err.message };
                }
                console.log(`<=== duration: ${Date.now() - start}ms`);
                //console.log(inspect(response, false, null, true));
                if (route.dataResponse) {
                    const dataResponse = response as IDataResponse;
                    if (!dataResponse.success) {
                        res.status(HttpError.BAD_REQUEST);
                    }
                    if (dataResponse.contentType) {
                        res.setHeader("Content-Type", dataResponse.contentType);
                    }
                    let filename = "";
                    if (dataResponse.filename) {
                        filename = `; filename="${dataResponse.filename}"`;
                    }
                    res.setHeader(
                        "Content-Disposition", `${dataResponse.inline ? "inline" : "attachment"}${filename}`);

                    res.setHeader(
                        "Content-Length", dataResponse.data.length);

                    res.send(dataResponse.data);
                } else {
                    res.setHeader("Content-Type", "application/json");
                    res.send(JSON.stringify(response));
                }
                res.end();
            });
        }
    }
}
