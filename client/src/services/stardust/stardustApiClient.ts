import { IMilestoneDetailsRequest } from "../../models/api/IMilestoneDetailsRequest";
import { IOutputDetailsRequest } from "../../models/api/IOutputDetailsRequest";
import { IBaseTokenGetRequest } from "../../models/api/stardust/IBaseTokenGetRequest";
import { IBaseTokenGetResponse } from "../../models/api/stardust/IBaseTokenGetResponse";
import { IBlockDetailsRequest } from "../../models/api/stardust/IBlockDetailsRequest";
import { IBlockDetailsResponse } from "../../models/api/stardust/IBlockDetailsResponse";
import { IFoundryOutputsRequest } from "../../models/api/stardust/IFoundryOutputsRequest";
import { IFoundryOutputsResponse } from "../../models/api/stardust/IFoundryOutputsResponse";
import { IMilestoneDetailsResponse } from "../../models/api/stardust/IMilestoneDetailsResponse";
import { INftDetailsRequest } from "../../models/api/stardust/INftDetailsRequest";
import { INftOutputsRequest } from "../../models/api/stardust/INftOutputsRequest";
import { INftOutputsResponse } from "../../models/api/stardust/INftOutputsResponse";
import { IOutputDetailsResponse } from "../../models/api/stardust/IOutputDetailsResponse";
import { ISearchRequest } from "../../models/api/stardust/ISearchRequest";
import { ISearchResponse } from "../../models/api/stardust/ISearchResponse";
import { IStatsGetRequest } from "../../models/api/stats/IStatsGetRequest";
import { IStatsGetResponse } from "../../models/api/stats/IStatsGetResponse";
import { ApiClient } from "../apiClient";

/**
 * Class to handle api communications on stardust.
 */
export class StardustApiClient extends ApiClient {
    /**
     * Perform a request to get the base token info for a network.
     * @param request The Base token request.
     * @returns The response from the request.
     */
    public async baseTokenInfo(request: IBaseTokenGetRequest): Promise<IBaseTokenGetResponse> {
        return this.callApi<unknown, IBaseTokenGetResponse>(
            `token/${request.network}`,
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
            `stardust/search/${request.network}/${request.query}`,
            "get"
        );
    }

    /**
     * Get the block details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async blockDetails(request: IBlockDetailsRequest): Promise<IBlockDetailsResponse> {
        return this.callApi<unknown, IBlockDetailsResponse>(
            `stardust/block/${request.network}/${request.blockId}`, "get"
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
     * Get the foundry outputs.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async foundryOutputs(request: IFoundryOutputsRequest): Promise<IFoundryOutputsResponse> {
        return this.callApi<unknown, IFoundryOutputsResponse>(
            `stardust/foundry/${request.network}/${request.address}`,
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

