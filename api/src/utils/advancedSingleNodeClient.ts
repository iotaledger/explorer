import { ClientError, IResponse, SingleNodeClientOptions } from "@iota/iota.js";
import { Converter } from "@iota/util.js";
import { ITransactionsDetailsResponse } from "../models/api/chrysalis/ITransactionsDetailsResponse";
/**
 * Client for API communication.
 */
export class AdvancedSingleNodeClient {
    /**
     * The endpoint for the API.
     */
    private readonly _endpoint: string;

    /**
     * The base path for the API.
     */
    private readonly _basePath: string;

    /**
     * The Api request timeout.
     */
    private readonly _timeout?: number;

    /**
     * Username for the endpoint.
     */
    private readonly _userName?: string;

    /**
     * Password for the endpoint.
     */
    private readonly _password?: string;

    /**
     * Additional headers to include in the requests.
     */
    private readonly _headers?: { [id: string]: string };

    /**
     * Create a new instance of client.
     * @param endpoint The endpoint.
     * @param options Options for the client.
     */
    constructor(endpoint: string, options?: SingleNodeClientOptions) {
        if (!endpoint) {
            throw new Error("The endpoint can not be empty");
        }
        this._endpoint = endpoint.replace(/\/+$/, "");
        this._basePath = options?.basePath ?? "/api/v1/";
        this._timeout = options?.timeout;
        this._userName = options?.userName;
        this._password = options?.password;
        this._headers = options?.headers;

        if (this._userName && this._password && !this._endpoint.startsWith("https")) {
            throw new Error("Basic authentication requires the endpoint to be https");
        }

        if (this._userName && this._password && (this._headers?.authorization || this._headers?.Authorization)) {
            throw new Error("You can not supply both user/pass and authorization header");
        }
    }

    public async transactionHistory(address: string): Promise<ITransactionsDetailsResponse> {
        try {
            const res = await
                this.fetchJson<never, ITransactionsDetailsResponse>("get", `transactions/ed25519/${address}`);
            return res;
        } catch (e) {
            return { error: e };
        }
    }

    /**
     * Perform a fetch request.
     * @param method The http method.
     * @param route The route of the request.
     * @param headers The headers for the request.
     * @param requestData Request to send to the endpoint.
     * @returns The response.
     */

    public async fetchWithTimeout(
        method: "get" | "post" | "delete",
        route: string,
        headers?: { [id: string]: string },
        body?: string | Uint8Array): Promise<Response> {
        let controller: AbortController | undefined;
        let timerId: NodeJS.Timeout | undefined;

        if (this._timeout !== undefined) {
            controller = new AbortController();
            timerId = setTimeout(
                () => {
                    if (controller) {
                        controller.abort();
                    }
                },
                this._timeout);
        }

        const finalHeaders: { [id: string]: string } = {};

        if (this._headers) {
            for (const header in this._headers) {
                finalHeaders[header] = this._headers[header];
            }
        }

        if (headers) {
            for (const header in headers) {
                finalHeaders[header] = headers[header];
            }
        }

        if (this._userName && this._password) {
            const userPass = Converter.bytesToBase64(Converter.utf8ToBytes(`${this._userName}:${this._password}`));
            finalHeaders.Authorization = `Basic ${userPass}`;
        }

        try {
            const response = await fetch(
                `${this._endpoint}${route}`,
                {
                    method,
                    headers: finalHeaders,
                    body,
                    signal: controller ? controller.signal : undefined
                }
            );

            return response;
        } catch (err) {
            throw err.name === "AbortError" ? new Error("Timeout") : err;
        } finally {
            if (timerId) {
                clearTimeout(timerId);
            }
        }
    }

    /**
     * Perform a request in json format.
     * @param method The http method.
     * @param route The route of the request.
     * @param requestData Request to send to the endpoint.
     * @returns The response.
     */
    public async fetchJson<T, U>(method: "get" | "post" | "delete", route: string, requestData?: T): Promise<U> {
        const response = await this.fetchWithTimeout(
            method,
            `${this._basePath}${route}`,
            { "Content-Type": "application/json" },
            requestData ? JSON.stringify(requestData) : undefined
        );

        let errorMessage: string | undefined;
        let errorCode: string | undefined;

        if (response.ok) {
            if (response.status === 204) {
                // No content
                return {} as U;
            }
            try {
                const responseData: IResponse<U> = await response.json();

                if (responseData.error) {
                    errorMessage = responseData.error.message;
                    errorCode = responseData.error.code;
                } else {
                    return responseData.data;
                }
            } catch {
            }
        }

        if (!errorMessage) {
            try {
                const json = await response.json();
                if (json.error) {
                    errorMessage = json.error.message;
                    errorCode = json.error.code;
                }
            } catch { }
        }

        if (!errorMessage) {
            try {
                const text = await response.text();
                if (text.length > 0) {
                    const match = /code=(\d+), message=(.*)/.exec(text);
                    if (match?.length === 3) {
                        errorCode = match[1];
                        errorMessage = match[2];
                    } else {
                        errorMessage = text;
                    }
                }
            } catch { }
        }

        throw new ClientError(
            errorMessage ?? response.statusText,
            route,
            response.status,
            errorCode ?? response.status.toString()
        );
    }
}
