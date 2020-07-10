import { join } from "path";
import { inspect } from "util";
import { initServices } from "../initServices";
import { IDataResponse } from "../models/api/IDataResponse";
import { IHttpRequest } from "../models/app/IHttpRequest";
import { IHttpResponse } from "../models/app/IHttpResponse";
import { IRoute } from "../models/app/IRoute";
import { IConfiguration } from "../models/configuration/IConfiguration";

/**
 * Find a route to match
 * @param findRoutes The routes to match against.
 * @param url The url to find.
 * @param method The method to find.
 * @returns The matching route if there is one and any extracted params.
 */
export function findRoute(findRoutes: IRoute[], url: string, method: string): {
    /**
     * The matching route.
     */
    route: IRoute;
    /**
     * Matching parameters for the route.
     */
    params: { [id: string]: string };
} | undefined {
    const urlParts = url.replace(/\/$/, "").split("/");

    for (const route of findRoutes) {
        if (route.method === method) {
            const routeParts = route.path.split("/");
            const params: { [id: string]: string } = {};

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
                        params[routeParts[i].substr(1).replace("?", "")] = urlParts[i];
                    }
                } else {
                    break;
                }
            }

            if (i === urlParts.length) {
                return {
                    route,
                    params
                };
            }
        }
    }
    return undefined;
}

/**
 * Execute the route which matches the path.
 * @param req The request.
 * @param res The response.
 * @param config The configuration.
 * @param route The route.
 * @param pathParams The params extracted from the url.
 * @param globalInitServices The services have already been initialised.
 * @param logHook Optional hook for logging errors.
 */
export async function executeRoute(
    req: IHttpRequest,
    res: IHttpResponse,
    config: IConfiguration,
    route: IRoute,
    pathParams: { [id: string]: string },
    globalInitServices: boolean = false,
    logHook?: (message: string, statusCode: number, params: unknown) => Promise<void>): Promise<void> {

    let response;
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

        console.log(`===> ${route.method.toUpperCase()} ${route.path}`);
        console.log(inspect(filteredParams, false, null, false));

        if (route.func) {
            let modulePath;
            if (route.folder) {
                modulePath = join(__dirname, "..", "routes", route.folder, route.func);
            } else {
                modulePath = join(__dirname, "..", "routes", route.func);
            }
            let mod;
            try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                mod = require(modulePath);
            } catch (err) {
                console.error(err);
            }
            if (mod) {
                if (mod[route.func]) {
                    if (!globalInitServices) {
                        await initServices(config);
                    }
                    response = await mod[route.func](config, params, body, req.headers || {});
                    status = 200;
                } else {
                    status = 400;
                    response = {
                        success: false,
                        message: `Route '${route.path}' module '${
                            modulePath}' does not contain a method '${route.func}'`
                    };
                }
            } else {
                status = 400;
                response = { success: false, message: `Route '${route.path}' module '${modulePath}' failed to load` };
            }
        } else if (route.inline !== undefined) {
            await initServices(config);
            response = await route.inline(config, params, body, req.headers || {});
            status = 200;
        } else {
            status = 400;
            response = { success: false, message: `Route ${route.path} has no func or inline property set` };
        }
    } catch (err) {
        status = err.httpCode || 400;
        response = { success: false, message: err.message };
        if (logHook) {
            await logHook(err.message, status, filteredParams);
        }
    }

    console.log(`<=== duration: ${Date.now() - start}ms`);
    console.log(inspect(response, false, null, false));

    if (route.dataResponse) {
        const dataResponse = response as IDataResponse;
        if (!dataResponse.success) {
            status = 400;
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

        res.status(status).send(dataResponse.data);
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
// tslint:disable: no-any
function logParams(obj: { [id: string]: any }): { [id: string]: string } {
    const newobj: { [id: string]: any } = {};
    for (const key in obj) {
        if (key.indexOf("pass") >= 0) {
            newobj[key] = "*************";
        } else if (key.indexOf("base64") >= 0 || key.indexOf("binaryData") >= 0) {
            newobj[key] = "<base64>";
        } else {
            if (obj[key] !== undefined && obj[key] !== null) {
                if (obj[key].constructor.name === "Object") {
                    newobj[key] = logParams(obj[key]);
                } else if (Array.isArray(obj[key])) {
                    newobj[key] = obj[key].map(logParams);
                } else {
                    newobj[key] = obj[key];
                }
            } else {
                newobj[key] = obj[key];
            }
        }
    }
    return newobj;
}

/**
 * Handle cors.
 * @param req Request The request.
 * @param res Response The response.
 * @param allowOrigins The allowed origins.
 * @param allowMethods The allowed methods.
 * @param allowHeaders The allowed headers.
 */
export function cors(
    req: IHttpRequest,
    res: IHttpResponse,
    allowOrigins: string | string[] | undefined,
    allowMethods: string | undefined,
    allowHeaders: string | undefined): void {

    if (!allowOrigins || allowOrigins === "*") {
        res.setHeader("Access-Control-Allow-Origin", "*");
    } else if (allowOrigins) {
        const requestOrigin = req.headers.origin;
        const origins = Array.isArray(allowOrigins) ? allowOrigins : allowOrigins.split(";");
        let isAllowed;
        for (const origin of origins) {
            if (requestOrigin === origin || origin === "*") {
                isAllowed = origin;
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
                "Accept"].join(",")
        );
    }
}
