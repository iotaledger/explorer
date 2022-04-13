import { FetchHelper } from "../../helpers/fetchHelper";
import { ICurrenciesResponse } from "../../models/api/ICurrenciesResponse";
import { IIdentityDidHistoryRequest } from "../../models/api/IIdentityDidHistoryRequest";
import { IIdentityDidHistoryResponse } from "../../models/api/IIdentityDidHistoryResponse";
import { IIdentityDidResolveRequest } from "../../models/api/IIdentityDidResolveRequest";
import { IIdentityDiffHistoryRequest } from "../../models/api/IIdentityDiffHistoryRequest";
import { IIdentityDiffHistoryResponse } from "../../models/api/IIdentityDiffHistoryResponse";
import { IIdentityDidResolveResponse } from "../../models/api/IIdentityResolveResponse";
import { IMarketGetRequest } from "../../models/api/IMarketGetRequest";
import { IMarketGetResponse } from "../../models/api/IMarketGetResponse";
import { IMessageDetailsRequest } from "../../models/api/IMessageDetailsRequest";
import { IMilestoneDetailsRequest } from "../../models/api/IMilestoneDetailsRequest";
import { INetworkGetResponse } from "../../models/api/INetworkGetResponse";
import { IOutputDetailsRequest } from "../../models/api/IOutputDetailsRequest";
import { ISearchRequest } from "../../models/api/ISearchRequest";
import { ITransactionsDetailsRequest } from "../../models/api/ITransactionsDetailsRequest";
import { IAddressGetRequest } from "../../models/api/og/IAddressGetRequest";
import { IAddressGetResponse } from "../../models/api/og/IAddressGetResponse";
import { ITransactionActionRequest } from "../../models/api/og/ITransactionActionRequest";
import { ITransactionActionResponse } from "../../models/api/og/ITransactionActionResponse";
import { ITransactionsGetRequest } from "../../models/api/og/ITransactionsGetRequest";
import { ITransactionsGetResponse } from "../../models/api/og/ITransactionsGetResponse";
import { ITrytesRetrieveRequest } from "../../models/api/og/ITrytesRetrieveRequest";
import { ITrytesRetrieveResponse } from "../../models/api/og/ITrytesRetrieveResponse";
import { IMessageDetailsResponse } from "../../models/api/stardust/IMessageDetailsResponse";
import { IMilestoneDetailsResponse } from "../../models/api/stardust/IMilestoneDetailsResponse";
import { IOutputDetailsResponse } from "../../models/api/stardust/IOutputDetailsResponse";
import { ISearchResponse } from "../../models/api/stardust/ISearchResponse";
import { ITransactionsDetailsResponse } from "../../models/api/stardust/ITransactionsDetailsResponse";
import { IStatsGetRequest } from "../../models/api/stats/IStatsGetRequest";
import { IStatsGetResponse } from "../../models/api/stats/IStatsGetResponse";
import { ApiClient } from "../apiClient";

/**
 * Class to handle api communications on stardust.
 */
export class StardustApiClient extends ApiClient {
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
            `stardust/search/${request.network}/${request.query}${request.cursor ? `?cursor=${request.cursor}` : ""}`,
            "get"
        );
    }

    /**
     * Get the message details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async messageDetails(request: IMessageDetailsRequest): Promise<IMessageDetailsResponse> {
        return this.callApi<unknown, IMessageDetailsResponse>(
            `stardust/message/${request.network}/${request.messageId}`, "get"
        );
    }

    /**
     * Get the output details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async outputDetails(request: IOutputDetailsRequest): Promise<IOutputDetailsResponse> {
        return this.callApi<unknown, IOutputDetailsResponse>(
            `stardust/output/${request.network}/${request.outputId}`, "get"
        );
    }

    /**
     * Get the transaction history details of an address.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async transactionsDetails(request: ITransactionsDetailsRequest): Promise<ITransactionsDetailsResponse> {
        const { network, address, query } = request;
        return this.callApi<unknown, ITransactionsDetailsResponse>(
            `stardust/transactionhistory/${network}/${address}${query ? FetchHelper.urlParams(query) : ""}`,
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
            `stardust/milestone/${request.network}/${request.milestoneIndex}`,
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
}

