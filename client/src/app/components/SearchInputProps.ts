export interface SearchInputProps {
    /**
     * Search component to display.
     */
    query?: string;

    /**
     * Show in compact mode.
     */
    compact: boolean;

    /**
     * Perform a search.
     * @param query The query to search for.
     */
    onSearch(query: string): void;
}
