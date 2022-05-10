import { FetchHelper } from "../../helpers/fetchHelper";
import { IMessageDetailsRequest } from "../../models/api/IMessageDetailsRequest";
import { IMilestoneDetailsRequest } from "../../models/api/IMilestoneDetailsRequest";
import { IOutputDetailsRequest } from "../../models/api/IOutputDetailsRequest";
import { ISearchRequest } from "../../models/api/ISearchRequest";
import { ITransactionsDetailsRequest } from "../../models/api/ITransactionsDetailsRequest";
import { IMessageDetailsResponse } from "../../models/api/stardust/IMessageDetailsResponse";
import { IMilestoneDetailsResponse } from "../../models/api/stardust/IMilestoneDetailsResponse";
import { INftDetailsRequest } from "../../models/api/stardust/INftDetailsRequest";
import { INftOutputsRequest } from "../../models/api/stardust/INftOutputsRequest";
import { INftOutputsResponse } from "../../models/api/stardust/INftOutputsResponse";
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
     * Get the nft details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async nftOutputs(request: INftOutputsRequest): Promise<INftOutputsResponse> {
        return this.callApi<unknown, INftOutputsResponse>(
            `stardust/nfts/${request.network}/${request.address}`,
            "get"
        );
    }

    /**
     * Get the nft details.
     * @param request The request to send.
     * @returns The response from the request.
     */
     public async nftDetails(request: INftDetailsRequest): Promise<INftOutputsResponse> {
        return this.callApi<unknown, INftOutputsResponse>(
            `stardust/nfts/${request.network}/${request.nftId}`,
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
}

