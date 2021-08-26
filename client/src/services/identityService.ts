import { ServiceFactory } from "../factories/serviceFactory";
import { IIdentityDidResolveResponse } from "../models/api/IIdentityResolveResponse";
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
}
