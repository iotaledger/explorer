import { INetworkBoundGetRequest } from "~/models/api/INetworkBoundGetRequest";
import { IBlockRequest } from "~/models/api/nova/block/IBlockRequest";
import { IBlockResponse } from "~/models/api/nova/block/IBlockResponse";
import { IOutputDetailsRequest } from "~/models/api/IOutputDetailsRequest";
import { IAccountDetailsRequest } from "~/models/api/nova/IAccountDetailsRequest";
import { IAccountDetailsResponse } from "~/models/api/nova/IAccountDetailsResponse";
import { IAssociationsResponse } from "~/models/api/nova/IAssociationsResponse";
import { INodeInfoResponse } from "~/models/api/nova/INodeInfoResponse";
import { IOutputDetailsResponse } from "~/models/api/nova/IOutputDetailsResponse";
import { IAssociationsRequest } from "~/models/api/nova/IAssociationsRequest";
import { ApiClient } from "../apiClient";
import { IBlockDetailsRequest } from "~/models/api/nova/block/IBlockDetailsRequest";
import { IBlockDetailsResponse } from "~/models/api/nova/block/IBlockDetailsResponse";
import { IRewardsRequest } from "~/models/api/nova/IRewardsRequest";
import { IRewardsResponse } from "~/models/api/nova/IRewardsResponse";
import { IStatsGetRequest } from "~/models/api/stats/IStatsGetRequest";
import { IStatsGetResponse } from "~/models/api/stats/IStatsGetResponse";
import { INftDetailsRequest } from "~/models/api/nova/INftDetailsRequest";
import { INftDetailsResponse } from "~/models/api/nova/INftDetailsResponse";
import { IAnchorDetailsRequest } from "~/models/api/nova/IAnchorDetailsRequest";
import { IAnchorDetailsResponse } from "~/models/api/nova/IAnchorDetailsResponse";

/**
 * Class to handle api communications on nova.
 */
export class NovaApiClient extends ApiClient {
    /**
     * Perform a request to get the base token info for the network.
     * @param request The Base token request.
     * @returns The response from the request.
     */
    public async nodeInfo(request: INetworkBoundGetRequest): Promise<INodeInfoResponse> {
        return this.callApi<unknown, INodeInfoResponse>(`node-info/${request.network}`, "get");
    }

    /**
     * Get a block.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async block(request: IBlockRequest): Promise<IBlockResponse> {
        return this.callApi<unknown, IBlockResponse>(`nova/block/${request.network}/${request.blockId}`, "get");
    }

    /**
     * Get the block details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async blockDetails(request: IBlockDetailsRequest): Promise<IBlockDetailsResponse> {
        return this.callApi<unknown, IBlockDetailsResponse>(`nova/block/metadata/${request.network}/${request.blockId}`, "get");
    }

    /**
     * Get the output details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async outputDetails(request: IOutputDetailsRequest): Promise<IOutputDetailsResponse> {
        return this.callApi<unknown, IOutputDetailsResponse>(`nova/output/${request.network}/${request.outputId}`, "get");
    }

    /**
     * Get the account output details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async accountDetails(request: IAccountDetailsRequest): Promise<IAccountDetailsResponse> {
        return this.callApi<unknown, IAccountDetailsResponse>(`nova/account/${request.network}/${request.accountId}`, "get");
    }

    /**
     * Get the nft output details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async nftDetails(request: INftDetailsRequest): Promise<INftDetailsResponse> {
        return this.callApi<unknown, INftDetailsResponse>(`nova/nft/${request.network}/${request.nftId}`, "get");
    }

    /**
     * Get the anchor output details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async anchorDetails(request: IAnchorDetailsRequest): Promise<IAnchorDetailsResponse> {
        return this.callApi<unknown, IAnchorDetailsResponse>(`nova/anchor/${request.network}/${request.anchorId}`, "get");
    }

    /**
     * Get the associated outputs.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async associatedOutputs(request: IAssociationsRequest) {
        return this.callApi<unknown, IAssociationsResponse>(
            `nova/output/associated/${request.network}/${request.addressDetails.bech32}`,
            "post",
            { addressDetails: request.addressDetails },
        );
    }

    /**
     * Get the output mana rewards.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async getRewards(request: IRewardsRequest): Promise<IRewardsResponse> {
        return this.callApi<unknown, IRewardsResponse>(`nova/output/rewards/${request.network}/${request.outputId}`, "get");
    }

    /**
     * Get the stats.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async stats(request: IStatsGetRequest): Promise<IStatsGetResponse> {
        return this.callApi<unknown, IStatsGetResponse>(
            `stats/${request.network}?includeHistory=${request.includeHistory ? "true" : "false"}`,
            "get",
        );
    }
}
