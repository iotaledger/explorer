export interface IdentitySearchInputProps {
    network: string;

    /**
     * Perform a search.
     * @param query The query to search for.
     */
    onSearch(query: string): void;
}
