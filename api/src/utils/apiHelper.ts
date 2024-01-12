/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Ed25519 } from "@iota/crypto.js";
import { Converter } from "@iota/util.js";
import path from "path";
import { inspect } from "util";
import logger from "../logger";
import { IDataResponse } from "../models/api/IDataResponse";
import { IResponse } from "../models/api/IResponse";
import { ISignedResponse } from "../models/api/ISignedResponse";
import { IHttpRequest } from "../models/app/IHttpRequest";
import { IHttpResponse } from "../models/app/IHttpResponse";
import { IRoute } from "../models/app/IRoute";
import { IConfiguration } from "../models/configuration/IConfiguration";

/**
 * Match a route url
 * @param matchUrls The urls to match against.
 * @param url The url to find.
 * @returns The params if the item matches.
 */
export function matchRouteUrl(matchUrls: string[], url: string): {
    index: number;
    params: { [id: string]: string };
} | undefined {
    const urlParts = url.replace(/\/$/, "").split("/");

    for (let m = 0; m < matchUrls.length; m++) {
        const routeParts = matchUrls[m].split("/");
        const params: { [id: string]: string } = {};

        if (routeParts.length === urlParts.length) {
            let i;
            for (i = 0; i < urlParts.length && i < routeParts.length; i++) {
                if (routeParts[i] === urlParts[i]) {
                    // This segment matches OK
                } else if (routeParts[i].startsWith(":") &&
                    (i < urlParts.length || routeParts[i].endsWith("?"))
                ) {
                    // Its a param match in the url
                    // or an undefined parameter past the end of the match
                    if (i < urlParts.length) {
                        params[routeParts[i].slice(1).replace("?", "")] = urlParts[i];
                    }
                } else {
                    break;
                }
            }
            if (i === urlParts.length) {
                return {
                    index: m,
                    params
                };
            }
        }
    }
}

/**
 * Execute the route which matches the path.
 * @param req The request.
 * @param res The response.
 * @param config The configuration.
 * @param route The route.
 * @param pathParams The params extracted from the url.
 * @param verboseLogging Log full details of requests.
 */
export async function executeRoute(
    req: IHttpRequest,
    res: IHttpResponse,
    config: IConfiguration,
    route: IRoute,
    pathParams: { [id: string]: string },
    verboseLogging: boolean): Promise<void> {
    let response: IResponse;
    const start = Date.now();
    let filteredParams;
    let status = 400;

    try {
        let params;
        let body;
        if (route.dataBody) {
            body = req.body;
            params = { ...pathParams, ...req.query };
        } else {
            params = { ...pathParams, ...req.query, ...req.body };
        }

        filteredParams = logParams(params);

        if (verboseLogging) {
            logger.debug(`===> ${route.method.toUpperCase()} ${route.path}`);
            logger.debug(inspect(filteredParams, false, undefined, false));
        }

        if (route.func) {
            const modulePath = route.folder
                ? path.join(__dirname, "..", "routes", route.folder, route.func)
                : path.join(__dirname, "..", "routes", route.func);
            let mod;
            try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                mod = require(modulePath);
            } catch (err) {
                logger.error(err);
            }
            if (mod) {
                if (mod[route.func]) {
                    response = await mod[route.func](config, params, body, req.headers || {});
                    if (response && !response.error) {
                        status = 200;
                    }
                } else {
                    response = {
                        error: `Route '${route.path}' module '${modulePath}' does not contain a method '${route.func}'`
                    };
                }
            } else {
                response = { error: `Route '${route.path}' module '${modulePath}' failed to load` };
            }
        } else if (route.inline) {
            response = await route.inline(config, params, body, req.headers || {});
            if (response && !response.error) {
                status = 200;
            }
        } else {
            response = { error: `Route ${route.path} has no func or inline property set` };
        }
    } catch (err) {
        status = err.httpCode || status;
        response = { error: err.message };
    }

    if (verboseLogging || (response?.error)) {
        logger.debug(`<=== duration: ${Date.now() - start}ms`);
        logger.debug(inspect(response, false, undefined, false));
    }

    if (route.sign && config.privateKeyEd25519 && config.privateKeyEd25519.length === 128) {
        (response as ISignedResponse).signature =
            Converter.bytesToHex(Ed25519.sign(
                Converter.hexToBytes(config.privateKeyEd25519),
                Converter.utf8ToBytes(JSON.stringify(response))));
    }

    if (route.dataResponse) {
        const dataResponse = response as IDataResponse;

        res.status(status);
        if (dataResponse.contentType) {
            res.setHeader("Content-Type", dataResponse.contentType);
        }
        let filename = "";
        if (dataResponse.filename) {
            filename = `; filename="${dataResponse.filename}"`;
        }
        res.setHeader(
            "Content-Disposition", `${dataResponse.inline ? "inline" : "attachment"}${filename}`
        );

        if (dataResponse.data) {
            res.setHeader(
                "Content-Length", dataResponse.data.length);

            res.send(dataResponse.data);
        }
    } else {
        res.setHeader("Content-Type", "application/json");
        res.status(status).send(JSON.stringify(response));
    }
    res.end();
}

/**
 * Convert the params to logable
 * @param obj The object to convert.
 * @returns The converted object.
 */
function logParams(obj: { [id: string]: unknown }): { [id: string]: unknown } {
    const newobj: { [id: string]: unknown } = {};
    for (const key in obj) {
        if (key.includes("pass")) {
            newobj[key] = "*************";
        } else if (key.includes("base64") || key.includes("binaryData")) {
            newobj[key] = "<base64>";
        } else if (obj[key] !== undefined && obj[key] !== null) {
            const prop = obj[key];
            if (prop.constructor.name === "Object") {
                newobj[key] = logParams(prop as { [id: string]: unknown });
            } else if (Array.isArray(prop)) {
                newobj[key] = prop.map(item => logParams(item));
            } else {
                newobj[key] = prop;
            }
        } else {
            newobj[key] = obj[key];
        }
    }
    return newobj;
}

/**
 * Handle cors.
 * @param req Request The request.
 * @param res Response The response.
 * @param allowDomains The allowed origins.
 * @param allowMethods The allowed methods.
 * @param allowHeaders The allowed headers.
 */
export function cors(
    req: IHttpRequest,
    res: IHttpResponse,
    allowDomains: string | (string | RegExp)[] | undefined,
    allowMethods: string | undefined,
    allowHeaders: string | undefined): void {
    if (!allowDomains || allowDomains === "*") {
        res.setHeader("Access-Control-Allow-Origin", "*");
    } else if (allowDomains) {
        const requestOrigin = req.headers.origin;
        const origins = Array.isArray(allowDomains) ? allowDomains : allowDomains.split(";");
        let isAllowed;
        for (const origin of origins) {
            if (typeof origin === "string") {
                if (requestOrigin === origin || origin === "*") {
                    isAllowed = origin;
                    break;
                }
            } else if (origin.test(requestOrigin)) {
                isAllowed = requestOrigin;
                break;
            }
        }
        if (isAllowed) {
            res.setHeader("Access-Control-Allow-Origin", isAllowed);
        }
    }

    if (req.method === "OPTIONS") {
        res.setHeader(
            "Access-Control-Allow-Methods",
            allowMethods || "GET, POST, OPTIONS, PUT, PATCH, DELETE"
        );

        res.setHeader(
            "Access-Control-Allow-Headers",
            allowHeaders || [
                "X-Requested-With",
                "Access-Control-Allow-Origin",
                "X-HTTP-Method-Override",
                "Content-Type",
                "Authorization",
                "Accept",
                "Accept-Encoding"
            ].join(",")
        );
    }
}
