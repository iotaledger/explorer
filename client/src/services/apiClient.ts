import { FetchHelper } from "../helpers/fetchHelper";
import { ICurrenciesResponse } from "../models/api/ICurrenciesResponse";
import { IMarketGetRequest } from "../models/api/IMarketGetRequest";
import { IMarketGetResponse } from "../models/api/IMarketGetResponse";
import { IMilestonesGetRequest } from "../models/api/IMilestonesGetRequest";
import { IMilestonesGetResponse } from "../models/api/IMilestonesGetResponse";
import { INetworkGetResponse } from "../models/api/INetworkGetResponse";
import { IResponse } from "../models/api/IResponse";
import { ITransactionsGetRequest } from "../models/api/ITransactionsGetRequest";
import { ITransactionsGetResponse } from "../models/api/ITransactionsGetResponse";
import { ITrytesRetrieveRequest } from "../models/api/ITrytesRetrieveRequest";
import { ITrytesRetrieveResponse } from "../models/api/ITrytesRetrieveResponse";

/**
 * Class to handle api communications.
 */
export class ApiClient {
    /**
     * The endpoint for performing communications.
     */
    private readonly _endpoint: string;

    /**
     * Create a new instance of ApiClient.
     * @param endpoint The endpoint for the api.
     */
    constructor(endpoint: string) {
        this._endpoint = endpoint;
    }

    /**
     * Perform a request to get the networks.
     * @returns The response from the request.
     */
    public async networks(): Promise<INetworkGetResponse> {
        return this.callApi<unknown, INetworkGetResponse>(
            "networks",
            "get"
        );
    }

    /**
     * Perform a request to get the currency information.
     * @returns The response from the request.
     */
    public async currencies(): Promise<ICurrenciesResponse> {
        return this.callApi<unknown, ICurrenciesResponse>(
            "currencies",
            "get"
        );
    }

    /**
     * Find transactions from the tangle.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async transactionsGet(request: ITransactionsGetRequest): Promise<ITransactionsGetResponse> {
        const { network, ...rest } = request;

        return this.callApi<unknown, ITransactionsGetResponse>(
            `transactions/${network}${FetchHelper.urlParams(rest)}`,
            "get",
            undefined,
            30000
        );
    }

    /**
     * Get trytes from the tangle.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async trytesRetrieve(request: ITrytesRetrieveRequest): Promise<ITrytesRetrieveResponse> {
        const { network, ...rest } = request;

        return this.callApi<unknown, ITransactionsGetResponse>(
            `trytes/${network}`,
            "post",
            rest
        );
    }

    /**
     * Get milestones from the tangle.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async milestonesGet(request: IMilestonesGetRequest): Promise<IMilestonesGetResponse> {
        return this.callApi<unknown, IMilestonesGetResponse>(
            `milestones/${request.network}`,
            "get"
        );
    }

    /**
     * Perform a request to get the market data information.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async marketGet(request: IMarketGetRequest): Promise<IMarketGetResponse> {
        return this.callApi<unknown, IMarketGetResponse>(
            `market/${request.currency}`,
            "get"
        );
    }

    /**
     * Perform a request to get the networks.
     * @param path The path to send the request.
     * @param method The method for sending the request.
     * @param request The request to send.
     * @param timeout The timeout to use.
     * @returns The response from the request.
     */
    private async callApi<U, T extends IResponse>(
        path: string,
        method: "get" | "post" | "put" | "delete",
        request?: U,
        timeout?: number): Promise<T> {
        let response: T;

        try {
            response = await FetchHelper.json<U, T>(
                this._endpoint,
                path,
                method,
                request,
                undefined,
                timeout
            );
        } catch (err) {
            response = {
                error: `There was a problem communicating with the API.\n${err}`
            } as T;
        }

        return response;
    }
}
