export interface IdentitySearchInputProps {
    network: string;

    /**
     * the default input value
     */
    did?: string;

    /**
     * Show in compact mode.
     */
    compact?: boolean;

    /**
     * Perform a search.
     * @param did The DID to search for.
     */
    onSearch(did: string): void;
}
