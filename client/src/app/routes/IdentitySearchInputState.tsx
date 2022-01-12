export interface IdentitySearchInputState {
    /**
     * The search text.
     */
    did: string;

    /**
     * Is the DID valid.
     */
    isValid: boolean;

    /**
     * network name in DID mismatches the network name in URL
     */
    networkMismatch: boolean;
}