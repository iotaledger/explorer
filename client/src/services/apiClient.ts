
import { FetchHelper } from "../helpers/fetchHelper";
import { IMessageDetailsRequest } from "../models/api/chrysalis/IMessageDetailsRequest";
import { IMessageDetailsResponse } from "../models/api/chrysalis/IMessageDetailsResponse";
import { IMilestoneDetailsRequest } from "../models/api/chrysalis/IMilestoneDetailsRequest";
import { IMilestoneDetailsResponse } from "../models/api/chrysalis/IMilestoneDetailsResponse";
import { IOutputDetailsRequest } from "../models/api/chrysalis/IOutputDetailsRequest";
import { IOutputDetailsResponse } from "../models/api/chrysalis/IOutputDetailsResponse";
import { ISearchRequest } from "../models/api/chrysalis/ISearchRequest";
import { ISearchResponse } from "../models/api/chrysalis/ISearchResponse";
import { ITransactionsDetailsRequest } from "../models/api/chrysalis/ITransactionsDetailsRequest";
import { ITransactionsDetailsResponse } from "../models/api/chrysalis/ITransactionsDetailsResponse";
import { ICurrenciesResponse } from "../models/api/ICurrenciesResponse";
import { IIdentityDidHistoryRequest } from "../models/api/IIdentityDidHistoryRequest";
import { IIdentityDidHistoryResponse } from "../models/api/IIdentityDidHistoryResponse";
import { IIdentityDidResolveRequest } from "../models/api/IIdentityDidResolveRequest";
import { IIdentityDiffHistoryRequest } from "../models/api/IIdentityDiffHistoryRequest";
import { IIdentityDidResolveResponse } from "../models/api/IIdentityResolveResponse";
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
import { IStatsGetRequest } from "../models/api/stats/IStatsGetRequest";
import { IStatsGetResponse } from "../models/api/stats/IStatsGetResponse";
import { IIdentityDiffHistoryResponse } from "./../models/api/IIdentityDiffHistoryResponse";
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
        return this.callApi<unknown, INetworkGetResponse>("networks", "get");
    }

    /**
     * Perform a request to get the currency information.
     * @returns The response from the request.
     */
    public async currencies(): Promise<ICurrenciesResponse> {
        return this.callApi<unknown, ICurrenciesResponse>("currencies", "get");
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

        return this.callApi<unknown, ITransactionsGetResponse>(`trytes/${network}`, "post", rest);
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
        return this.callApi<unknown, IAddressGetResponse>(`address/${request.network}/${request.hash}`, "get");
    }

    /**
     * Get milestones from the tangle.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async milestonesGet(request: IMilestonesGetRequest): Promise<IMilestonesGetResponse> {
        return this.callApi<unknown, IMilestonesGetResponse>(`milestones/${request.network}`, "get");
    }

    /**
     * Perform a request to get the market data information.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async marketGet(request: IMarketGetRequest): Promise<IMarketGetResponse> {
        return this.callApi<unknown, IMarketGetResponse>(`market/${request.currency}`, "get");
    }

    /**
     * Find items from the tangle.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async search(request: ISearchRequest): Promise<ISearchResponse> {
        return this.callApi<unknown, ISearchResponse>(
            `search/${request.network}/${request.query}${request.cursor ? `?cursor=${request.cursor}` : ""}`,
            "get"
        );
    }

    /**
     * Get the message details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async messageDetails(request: IMessageDetailsRequest): Promise<IMessageDetailsResponse> {
        return this.callApi<unknown, IMessageDetailsResponse>(`message/${request.network}/${request.messageId}`, "get");
    }

    /**
     * Get the output details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async outputDetails(request: IOutputDetailsRequest): Promise<IOutputDetailsResponse> {
        return this.callApi<unknown, IOutputDetailsResponse>(`output/${request.network}/${request.outputId}`, "get");
    }

    /**
     * Get the transaction history details of an address.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async transactionsDetails(request: ITransactionsDetailsRequest): Promise<ITransactionsDetailsResponse> {
        return this.callApi<unknown, ITransactionsDetailsResponse>(
            `transactionhistory/${request.network}/${request.address}`,
            "get"
        );
    }

    /**
     * Get the milestone details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async milestoneDetails(request: IMilestoneDetailsRequest): Promise<IMilestoneDetailsResponse> {
        return this.callApi<unknown, IMilestoneDetailsResponse>(
            `milestone/${request.network}/${request.milestoneIndex}`,
            "get"
        );
    }

    /**
     * Get the stats.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async stats(request: IStatsGetRequest): Promise<IStatsGetResponse> {
        return this.callApi<unknown, IStatsGetResponse>(
            `stats/${request.network}?includeHistory=${request.includeHistory ? "true" : "false"}`,
            "get"
        );
    }

    /**
     * Get the message details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async didDocument(request: IIdentityDidResolveRequest): Promise<IIdentityDidResolveResponse> {
        return this.callApi<unknown, IIdentityDidResolveResponse>(
            `did/${request.network}/${request.did}/document`, "get"
            );
    }

    /**
     * Get the history of a DID.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async didHistory(request: IIdentityDidHistoryRequest): Promise<IIdentityDidHistoryResponse> {
        return this.callApi<unknown, IIdentityDidResolveResponse>(
            `did/${request.network}/${request.did}/history?version=${request.version}`,
            "get"
        );
    }

    /**
     * Get the history of a an integration message.
     * @param request The request to send.
     * @param payload body of request
     * @returns The response from the request.
     */
    public async diffHistory(
        request: IIdentityDiffHistoryRequest,
        payload: unknown
    ): Promise<IIdentityDiffHistoryResponse> {
        return this.callApi<unknown, IIdentityDiffHistoryResponse>(
            `did/${request.network}/diffHistory/${request.integrationMsgId}?version=${request.version}`,
            "post",
            payload
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
}
