export interface SearchState {
    /**
     * The status message to display.
     */
    status: string;

    /**
     * Is this an error.
     */
    completion: string;

    /**
     * Redirect to another page.
     */
    redirect: string;
}
