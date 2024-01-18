export enum Status {
    InFlight = "INFLIGHT",
    Verified = "VERIFIED",
    Error = "ERROR",
}

export interface DIDDomainResolverState {
    verifiedDomainsPresentation: Map<
        string,
        {
            status: Status;
            message?: string;
        }
    >;
}
