import { ServiceFactory } from "../factories/serviceFactory";
import { IIdentityDidHistoryResponse } from "../models/api/IIdentityDidHistoryResponse";
import { IIdentityDidResolveResponse } from "../models/api/IIdentityResolveResponse";
import { CHRYSALIS } from "../models/db/protocolVersion";
import { IIdentityDiffHistoryResponse } from "./../models/api/IIdentityDiffHistoryResponse";
import { ChrysalisApiClient } from "./chrysalis/chrysalisApiClient";

export class IdentityService {
    /**
     * resolves DID into it's DID document
     * @param  {string} did DID to be resolved
     * @param  {string} network network name
     * @returns Promise
     */
    public async resolveIdentity(did: string, network: string): Promise<IIdentityDidResolveResponse> {
        const apiClient = ServiceFactory.get<ChrysalisApiClient>(`api-client-${CHRYSALIS}`);

        const response = await apiClient.didDocument({ network, did });

        return response;
    }

    /**
     * resolves history of DID
     * @param  {string} did DID of which the history to be resolved
     * @param  {string} network network name
     * @param  {string} version version of the DID
     * @returns Promise
     */
    public async resolveHistory(did: string, network: string, version: string): Promise<IIdentityDidHistoryResponse> {
        const apiClient = ServiceFactory.get<ChrysalisApiClient>(`api-client-${CHRYSALIS}`);

        const response = await apiClient.didHistory({ network, did, version });

        return response;
    }

    /**
     * resolves Diff history of and integration message
     * @param  {string} integrationMsgId MessageId of the parent integration message
     * @param  {string} network network name
     * @param  {string} version DID version
     * @param payload the body of the request
     * @returns Promise
     */
    public async resolveDiffHistory(
        integrationMsgId: string,
        network: string,
        version: string,
        payload: unknown
    ): Promise<IIdentityDiffHistoryResponse> {
        const apiClient = ServiceFactory.get<ChrysalisApiClient>(`api-client-${CHRYSALIS}`);

        const response = await apiClient.diffHistory({ network, integrationMsgId, version }, payload);

        return response;
    }
}
