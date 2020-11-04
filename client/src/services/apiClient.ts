import { FetchHelper } from "../helpers/fetchHelper";
import { IMessageDetailsRequest } from "../models/api/chrysalis/IMessageDetailsRequest";
import { IMessageDetailsResponse } from "../models/api/chrysalis/IMessageDetailsResponse";
import { ISearchRequest } from "../models/api/chrysalis/ISearchRequest";
import { ISearchResponse } from "../models/api/chrysalis/ISearchResponse";
import { ICurrenciesResponse } from "../models/api/ICurrenciesResponse";
import { IMarketGetRequest } from "../models/api/IMarketGetRequest";
import { IMarketGetResponse } from "../models/api/IMarketGetResponse";
import { IMilestonesGetRequest } from "../models/api/IMilestonesGetRequest";
import { IMilestonesGetResponse } from "../models/api/IMilestonesGetResponse";
import { INetworkGetResponse } from "../models/api/INetworkGetResponse";
import { IResponse } from "../models/api/IResponse";
import { IAddressGetRequest } from "../models/api/og/IAddressGetRequest";
import { IAddressGetResponse } from "../models/api/og/IAddressGetResponse";
import { ITransactionActionRequest } from "../models/api/og/ITransactionActionRequest";
import { ITransactionActionResponse } from "../models/api/og/ITransactionActionResponse";
import { ITransactionsGetRequest } from "../models/api/og/ITransactionsGetRequest";
import { ITransactionsGetResponse } from "../models/api/og/ITransactionsGetResponse";
import { ITrytesRetrieveRequest } from "../models/api/og/ITrytesRetrieveRequest";
import { ITrytesRetrieveResponse } from "../models/api/og/ITrytesRetrieveResponse";

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
        const { network, hash, ...rest } = request;

        return this.callApi<unknown, ITransactionsGetResponse>(
            `transactions/${network}/${hash}/${FetchHelper.urlParams(rest)}`,
            "get"
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
     * Perform tangle operation on hash.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async transactionAction(request: ITransactionActionRequest): Promise<ITransactionActionResponse> {
        return this.callApi<unknown, ITransactionActionResponse>(
            `transactions/${request.network}/${request.hash}/action/${request.action}`,
            "get"
        );
    }

    /**
     * Perform tangle operation on address.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async addressGet(request: IAddressGetRequest): Promise<IAddressGetResponse> {
        return this.callApi<unknown, IAddressGetResponse>(
            `address/${request.network}/${request.hash}`,
            "get"
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
     * Find items from the tangle.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async search(request: ISearchRequest): Promise<ISearchResponse> {
        return this.callApi<unknown, ISearchResponse>(
            `search/${request.network}/${request.query}`,
            "get"
        );
    }

    /**
     * Get the message details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async messageDetails(request: IMessageDetailsRequest): Promise<IMessageDetailsResponse> {
        return this.callApi<unknown, ISearchResponse>(
            `message/${request.network}/${request.messageId}/${request.fields}`,
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
