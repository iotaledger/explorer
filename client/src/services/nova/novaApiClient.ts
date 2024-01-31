import { INetworkBoundGetRequest } from "~/models/api/INetworkBoundGetRequest";
import { IBlockRequest } from "~/models/api/nova/block/IBlockRequest";
import { IBlockResponse } from "~/models/api/nova/block/IBlockResponse";
import { IOutputDetailsRequest } from "~/models/api/IOutputDetailsRequest";
import { IAccountRequest } from "~/models/api/nova/IAccountRequest";
import { IAccountResponse } from "~/models/api/nova/IAccountResponse";
import { IAssociationsResponse } from "~/models/api/nova/IAssociationsResponse";
import { INodeInfoResponse } from "~/models/api/nova/INodeInfoResponse";
import { IOutputDetailsResponse } from "~/models/api/nova/IOutputDetailsResponse";
import { IAssociationsRequest } from "~/models/api/stardust/IAssociationsRequest";
import { ApiClient } from "../apiClient";
import { IBlockDetailsRequest } from "~/models/api/nova/block/IBlockDetailsRequest";
import { IBlockDetailsResponse } from "~/models/api/nova/block/IBlockDetailsResponse";
import { IRewardsRequest } from "~/models/api/nova/IRewardsRequest";
import { IRewardsResponse } from "~/models/api/nova/IRewardsResponse";

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
    public async accountDetails(request: IAccountRequest): Promise<IAccountResponse> {
        return this.callApi<unknown, IAccountResponse>(`nova/account/${request.network}/${request.accountId}`, "get");
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
}
