import { IIdentityDiffHistoryResponse } from ".././../models/api/IIdentityDiffHistoryResponse";
import { FetchHelper } from "../../helpers/fetchHelper";
import { IMessageDetailsRequest } from "../../models/api/chrysalis/IMessageDetailsRequest";
import { IMessageDetailsResponse } from "../../models/api/chrysalis/IMessageDetailsResponse";
import { IMilestoneDetailsResponse } from "../../models/api/chrysalis/IMilestoneDetailsResponse";
import { IOutputDetailsResponse } from "../../models/api/chrysalis/IOutputDetailsResponse";
import { ISearchRequest } from "../../models/api/chrysalis/ISearchRequest";
import { ISearchResponse } from "../../models/api/chrysalis/ISearchResponse";
import { ITransactionHistoryRequest } from "../../models/api/chrysalis/ITransactionHistoryRequest";
import { ITransactionHistoryResponse } from "../../models/api/chrysalis/ITransactionHistoryResponse";
import { ICurrenciesResponse } from "../../models/api/ICurrenciesResponse";
import { IIdentityDidHistoryRequest } from "../../models/api/IIdentityDidHistoryRequest";
import { IIdentityDidHistoryResponse } from "../../models/api/IIdentityDidHistoryResponse";
import { IIdentityDidResolveRequest } from "../../models/api/IIdentityDidResolveRequest";
import { IIdentityDiffHistoryRequest } from "../../models/api/IIdentityDiffHistoryRequest";
import { IIdentityDidResolveResponse } from "../../models/api/IIdentityResolveResponse";
import { IMilestoneDetailsRequest } from "../../models/api/IMilestoneDetailsRequest";
import { INetworkGetResponse } from "../../models/api/INetworkGetResponse";
import { IOutputDetailsRequest } from "../../models/api/IOutputDetailsRequest";
import { IStatsGetRequest } from "../../models/api/stats/IStatsGetRequest";
import { IStatsGetResponse } from "../../models/api/stats/IStatsGetResponse";
import { ApiClient } from "../apiClient";

/**
 * Class to handle api communications on chrystalis.
 */
export class ChrysalisApiClient extends ApiClient {
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
     * Get the transaction history of an address.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async transactionHistory(request: ITransactionHistoryRequest): Promise<ITransactionHistoryResponse> {
        const { network, address, ...params } = request;
        return this.callApi<unknown, ITransactionHistoryResponse>(
            `transactionhistory/${network}/${address}${params ? FetchHelper.urlParams(params) : ""}`,
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
            `chrysalis/did/${request.network}/${request.did}/document`, "get"
            );
    }

    /**
     * Get the history of a DID.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async didHistory(request: IIdentityDidHistoryRequest): Promise<IIdentityDidHistoryResponse> {
        return this.callApi<unknown, IIdentityDidResolveResponse>(
            `chrysalis/did/${request.network}/${request.did}/history?version=${request.version}`,
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
            `chrysalis/did/${request.network}/diffHistory/${request.integrationMsgId}?version=${request.version}`,
            "post",
            payload
        );
    }
}

