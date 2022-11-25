import { IBlockMetadataRequest } from "../../models/api/proto/IBlockMetadataRequest";
import { IBlockMetadataResponse } from "../../models/api/proto/IBlockMetadataResponse";
import { IBlockRequest } from "../../models/api/proto/IBlockRequest";
import { IBlockResponse } from "../../models/api/proto/IBlockResponse";
import { IEpochRequest } from "../../models/api/proto/IEpochRequest";
import { IEpochResponse } from "../../models/api/proto/IEpochResponse";
import { INodeInfoRequest } from "../../models/api/stardust/INodeInfoRequest";
import { INodeInfoResponse } from "../../models/api/stardust/INodeInfoResponse";
import { ApiClient } from "../apiClient";

/**
 * Class to handle api communications with the prototype.
 */
export class ProtoApiClient extends ApiClient {
    /**
     * Perform a request to get the base token info for a network.
     * @param request The Base token request.
     * @returns The response from the request.
     */
    public async nodeInfo(request: INodeInfoRequest): Promise<INodeInfoResponse> {
        return this.callApi<unknown, INodeInfoResponse>(
            `node-info/${request.network}`,
            "get"
        );
    }

    public async block(request: IBlockRequest): Promise<IBlockResponse> {
        return this.callApi<unknown, IBlockResponse>(
            `block/id/${request.id}`,
            "get"
        );
    }

    public async blockMeta(request: IBlockMetadataRequest): Promise<IBlockMetadataResponse> {
        return this.callApi<unknown, IBlockMetadataResponse>(
            `block/id/${request.id}/meta`,
            "get"
        );
    }

    public async epoch(request: IEpochRequest): Promise<IEpochResponse> {
        if (request.index) {
            return this.callApi<unknown, IEpochResponse>(
                `epoch/index/${request.index}`,
                "get"
            );
        }
        return this.callApi<unknown, IEpochResponse>(
            `epoch/id/${request.id}`,
            "get"
        );
    }
}

