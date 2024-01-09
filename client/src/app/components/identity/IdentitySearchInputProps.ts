export interface IdentitySearchInputProps {
    network: string;

    /**
     * show in compact mode
     */
    compact: boolean;

    /**
     * Perform a search.
     * @param did The DID to search for.
     */
    onSearch(did: string): void;
}
