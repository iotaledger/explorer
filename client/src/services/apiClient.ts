import { FetchHelper } from "../helpers/fetchHelper";
import { IMilestonesGetResponse } from "../models/api/IMilestonesGetResponse";
import { INetworkBoundGetRequest } from "../models/api/INetworkBoundGetRequest";
import { IRawResponse } from "../models/api/IRawResponse";
import { IResponse } from "../models/api/IResponse";

/**
 * Class to handle api communications.
 */
export class ApiClient {
    /**
     * The endpoint for performing communications.
     */
    protected readonly _endpoint: string;

    /**
     * Create a new instance of ApiClient.
     * @param endpoint The endpoint for the api.
     */
    constructor(endpoint: string) {
        this._endpoint = endpoint;
    }

    /**
     * Get milestones from the tangle.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async milestonesGet(request: INetworkBoundGetRequest): Promise<IMilestonesGetResponse> {
        return this.callApi<unknown, IMilestonesGetResponse>(`milestones/${request.network}`, "get");
    }

    /**
     * Perform a request to get the networks.
     * @param path The path to send the request.
     * @param method The method for sending the request.
     * @param request The request to send.
     * @param timeout The timeout to use.
     * @returns The response from the request.
     */
    protected async callApi<U, T extends IResponse>(
        path: string,
        method: "get" | "post" | "put" | "delete",
        request?: U,
        timeout?: number
    ): Promise<T> {
        let response: T;

        try {
            response = await FetchHelper.json<U, T>(this._endpoint, path, method, request, undefined, timeout);
        } catch (err) {
            response = {
                error: `There was a problem communicating with the API.\n${err}`
            } as T;
        }

        return response;
    }

    /**
     * Perform a request to get the networks.
     * @param path The path to send the request.
     * @param method The method for sending the request.
     * @param request The request to send.
     * @param timeout The timeout to use.
     * @returns The response from the request.
     */
    protected async callApiRaw(
        path: string,
        method: "get" | "post" | "put" | "delete",
        request?: unknown,
        timeout?: number
    ): Promise<IRawResponse> {
        let result: IRawResponse;
        const headers = { "Content-Type": "application/json" };

        try {
            result = {
                raw: await FetchHelper.raw(this._endpoint, path, method, request, headers, timeout)
            };
        } catch (err) {
            result = {
                error: `There was a problem communicating with the API.\n${err}`
            };
        }

        return result;
    }
}

