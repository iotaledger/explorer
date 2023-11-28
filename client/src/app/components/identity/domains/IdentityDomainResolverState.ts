export interface IdentityDomainResolverState {
    verifiedDomainsPresentation: Map<string, {
        status: "in-flight" | "verified" | "error";
        message?: string;
    }>;
}
