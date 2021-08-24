import { ServiceFactory } from "../factories/serviceFactory";
import { IIdentityDidResolveResponse } from "../models/api/IIdentityResolveResponse";
import { IIdentityDIDHistoryResponse } from "./../models/api/IIdentityDIDHistoryResponse";
import { ApiClient } from "./apiClient";

export class IdentityService {
    /**
     * resolves DID into it's DID document
     * @param  {string} did DID to be resolved
     * @param  {string} network network name
     * @returns Promise
     */
    public async resolveIdentity(did: string, network: string): Promise<IIdentityDidResolveResponse> {
        const apiClient = ServiceFactory.get<ApiClient>("api-client");

        const response = await apiClient.didDocument({ network, did });

        return response;
    }

    /**
     * resolves history of DID
     * @param  {string} did DID of which the history to be resolved
     * @param  {string} network network name
     * @returns Promise
     */
    public async resolveHistory(did: string, network: string): Promise<IIdentityDIDHistoryResponse> {
        const apiClient = ServiceFactory.get<ApiClient>("api-client");

        const response = await apiClient.didHistory({ network, did });

        return response;
    }
}
