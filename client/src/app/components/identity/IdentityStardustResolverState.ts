import { IIdentityStardustResolveResponse } from "../../../models/api/IIdentityStardustResolveResponse";
export interface IdentityStardustResolverState {
    /**
     * DID to be resolved.
     */
    did?: string;

    /**
     * ID of the Alias Output that contains the DID Document.
     */
    aliasId?: string;

    /**
     * Error message if resolving fails.
     */
    errorMessage: string;

    /**
     * The resolved document if resolution succeeds
     */
    resolvedIdentity?: IIdentityStardustResolveResponse;

    verifiedDomains?: Map<string, Promise<void>>;
}
