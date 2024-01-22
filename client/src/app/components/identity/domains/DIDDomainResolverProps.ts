export interface DIDDomainResolverProps {
    verifiedDomains?: Map<string, Promise<void>>;
}
