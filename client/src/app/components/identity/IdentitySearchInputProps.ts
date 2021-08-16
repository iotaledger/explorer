export interface IdentitySearchInputProps {
    network: string;

    /**
     * Perform a search.
     * @param did The DID to search for.
     */
    onSearch(did: string): void;
}
