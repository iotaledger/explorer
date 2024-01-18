import { INetworkBoundGetRequest } from "~/models/api/INetworkBoundGetRequest";
import { IOutputDetailsRequest } from "~/models/api/IOutputDetailsRequest";
import { IAccountRequest } from "~/models/api/nova/IAccountRequest";
import { IAccountResponse } from "~/models/api/nova/IAccountResponse";
import { IAssociationsResponse } from "~/models/api/nova/IAssociationsResponse";
import { INodeInfoResponse } from "~/models/api/nova/INodeInfoResponse";
import { IOutputDetailsResponse } from "~/models/api/nova/IOutputDetailsResponse";
import { IAssociationsRequest } from "~/models/api/stardust/IAssociationsRequest";
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
        return this.callApi<unknown, INodeInfoResponse>(`node-info/${request.network}`, "get");
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
}
