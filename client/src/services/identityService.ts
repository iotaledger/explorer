import { ServiceFactory } from "../factories/serviceFactory";
import { IIdentityDidHistoryResponse } from "../models/api/IIdentityDidHistoryResponse";
import { IIdentityDidResolveResponse } from "../models/api/IIdentityResolveResponse";
import { IIdentityDiffHistoryResponse } from "./../models/api/IIdentityDiffHistoryResponse";
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
    public async resolveHistory(did: string, network: string): Promise<IIdentityDidHistoryResponse> {
        const apiClient = ServiceFactory.get<ApiClient>("api-client");

        const response = await apiClient.didHistory({ network, did });

        return response;
    }

    /**
     * resolves Diff history of and integration message
     * @param  {string} integrationMsgId MessageId of the parent integration message
     * @param  {string} network network name
     * @param payload the body of the request
     * @returns Promise
     */
    public async resolveDiffHistory(
        integrationMsgId: string,
        network: string,
        payload: unknown
    ): Promise<IIdentityDiffHistoryResponse> {
        const apiClient = ServiceFactory.get<ApiClient>("api-client");

        const response = await apiClient.diffHistory({ network, integrationMsgId }, payload);

        return response;
    }
}
