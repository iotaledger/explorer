import { INetworkBoundGetRequest } from "~/models/api/INetworkBoundGetRequest";
import { IBlockRequest } from "~/models/api/nova/block/IBlockRequest";
import { IBlockResponse } from "~/models/api/nova/block/IBlockResponse";
import { IOutputDetailsRequest } from "~/models/api/IOutputDetailsRequest";
import { INodeInfoResponse } from "~/models/api/nova/INodeInfoResponse";
import { IOutputDetailsResponse } from "~/models/api/nova/IOutputDetailsResponse";
import { ApiClient } from "../apiClient";

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
        return this.callApi<unknown, INodeInfoResponse>(
            `node-info/${request.network}`,
            "get"
        );
    }

    /**
     * Get a block.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async block(request: IBlockRequest): Promise<IBlockResponse> {
        return this.callApi<unknown, IBlockResponse>(
            `nova/block/${request.network}/${request.blockId}`, "get"
        );
    }

    /**
     * Get the output details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async outputDetails(request: IOutputDetailsRequest): Promise<IOutputDetailsResponse> {
        return this.callApi<unknown, IOutputDetailsResponse>(
            `nova/output/${request.network}/${request.outputId}`, "get"
        );
    }
}
