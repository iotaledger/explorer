import { IIdentityStardustResolveResponse } from "../../../models/api/IIdentityStardustResolveResponse";
export interface IdentityStardustResolverState {
    did?: string;
    aliasId?: string;
    error: boolean;
    errorMessage: string;
    resolvedIdentity?: IIdentityStardustResolveResponse;
}
