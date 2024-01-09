export interface SearchInputState {
    /**
     * The search text.
     */
    query: string;

    /**
     * Is the content valid.
     */
    isValid: boolean;

    /**
     * In mobile when a user clicked in search icon
     */
    showSearchInput: boolean;
}
