import { INetworkBoundGetRequest } from "~/models/api/INetworkBoundGetRequest";
import { INodeInfoResponse } from "~/models/api/nova/INodeInfoResponse";
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
}
