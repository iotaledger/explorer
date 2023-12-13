import { IIdentityDiffHistoryResponse } from "~models/api/IIdentityDiffHistoryResponse";
import { ChrysalisApiClient } from "./chrysalis/chrysalisApiClient";
import { StardustApiClient } from "./stardust/stardustApiClient";
import { ServiceFactory } from "~factories/serviceFactory";
import { IIdentityDidHistoryResponse } from "~models/api/IIdentityDidHistoryResponse";
import { IIdentityDidResolveResponse } from "~models/api/IIdentityResolveResponse";
import { IIdentityStardustResolveResponse } from "~models/api/IIdentityStardustResolveResponse";
import { CHRYSALIS, STARDUST } from "~models/config/protocolVersion";
import * as identity from "@iota/identity-wasm/web";

export class IdentityService {
    /**
     * Resolves DID into it's DID document (Chrysalis).
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
     * Resolves history of DID (Chrysalis).
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
     * Resolves Diff history of and integration message (Chrysalis).
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

    /**
     * Resolves DID into it's DID document (Stardust).
     * @param  {string} did DID to be resolved
     * @param  {string} network network name
     * @returns Promise
     */
    public async resolveIdentityStardust(did: string, network: string): Promise<IIdentityStardustResolveResponse> {
        const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);
        const response = await apiClient.didDocument({ did, network });
        return response;
    }

    public async initLibrary(path = "/wasm/identity_wasm_bg.wasm") {
        return await identity.init(path);
    }
}
