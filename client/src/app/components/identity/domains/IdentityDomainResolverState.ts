export enum Status {
  InFlight = "INFLIGHT",
  Verified = "VERIFIED",
  Error = "ERROR",
}

export interface IdentityDomainResolverState {
  verifiedDomainsPresentation: Map<
    string,
    {
      status: Status;
      message?: string;
    }
  >;
}
