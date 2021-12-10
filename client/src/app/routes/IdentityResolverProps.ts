export interface IdentityResolverProps {
    /**
     * The network channel details to lookup.
     */
    network: string;

    /**
     * The DID to be resoloved/debugged
     */
    did?: string;
}
