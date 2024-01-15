import { IIdentityStardustResolveResponse } from "~/models/api/IIdentityStardustResolveResponse";

export interface IdentityStardustResolverProps {
    resolvedDID: IIdentityStardustResolveResponse | null;

    network: string;
}
