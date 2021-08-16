export interface IdentitySearchInputState {
    /**
     * The search text.
     */
    query: string;

    /**
     * Is the content valid.
     */
    isValid: boolean;

    /**
     * network name in DID mismatches the network name in URL
     */
    networkMismatch: boolean;
}
