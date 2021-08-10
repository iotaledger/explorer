export interface IdentityResolverState{
    identityResolved: boolean;
    resolvedIdentity: string;
    did: string | undefined;
    error: boolean;
    errorMessage: string;
}
