import fetch from "node-fetch";
import logger from "../logger";

/**
 * Fetch from an endpoint.
 */
export class FetchHelper {
    /**
     * Fetch a payload from an endpoint.
     * @param baseUrl The base url for the api.
     * @param path The path for the endpoint.
     * @param method The method to send the request with.
     * @param payload The payload to send.
     * @param headers The headers to include in the fetch.
     * @param timeout Timeout for the request.
     * @returns The fetched payload.
     */
    public static async json<T, U>(
        baseUrl: string,
        path: string,
        method: "get" | "post" | "put" | "delete",
        payload?: T,
        headers?: { [id: string]: string },
        timeout?: number
    ): Promise<U> {
        headers = headers ?? {};
        headers["Content-Type"] = "application/json";
        logger.verbose(`[fetchHelper] Request for json with path ${path}`);

        let controller: AbortController | undefined;
        let timerId: NodeJS.Timeout | undefined;

        if (timeout !== undefined) {
            controller = new AbortController();
            timerId = setTimeout(
                () => {
                    if (controller) {
                        controller.abort();
                    }
                },
                timeout
            );
        }

        try {
            const res = await fetch(
                `${baseUrl.replace(/\/$/, "")}${path.length > 0 ? `/${path.replace(/^\//, "")}` : ""}`,
                {
                    method,
                    headers,
                    body: payload ? JSON.stringify(payload) : undefined,
                    signal: controller ? controller.signal : undefined
                }
            );

            const json = await res.json();
            return json as U;
        } catch (err) {
            throw err instanceof Error && err.name === "AbortError" ? new Error("Timeout") : err;
        } finally {
            if (timerId) {
                clearTimeout(timerId);
            }
        }
    }

    /**
     * Join params onto command.
     * @param params The params to add.
     * @returns The joined parameters.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static urlParams(params: { [id: string]: any }): string {
        const urlParams = [];
        for (const key in params) {
            if (params[key] !== null && params[key] !== undefined) {
                urlParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key] as string)}`);
            }
        }
        return urlParams.length > 0 ? `?${urlParams.join("&")}` : "";
    }

    /**
     * Convert request to curl format.
     * @param baseUrl The baseUrl.
     * @param path The path.
     * @param method The method.
     * @param headers The headers.
     * @param req The request.
     * @returns The curl command.
     */
    public static convertToCurl(
        baseUrl: string, path: string, method: string, headers: { [id: string]: string }, req?: unknown): string {
        const endpoint = `${baseUrl.replace(/\/$/, "")}${path.length > 0 ? `/${path.replace(/^\//, "")}` : ""}`;

        const curl = [`curl ${endpoint} \\`];
        curl.push(`-X ${method.toUpperCase()} \\`);
        for (const header in headers) {
            curl.push(`-H '${header}: ${headers[header]}' \\`);
        }
        if (req) {
            curl.push(`-d '${JSON.stringify(req, undefined, "   ")}'`);
        }
        return curl.join("\n");
    }
}
