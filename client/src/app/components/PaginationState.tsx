export interface PaginationState {
    /**
     * Pagination last page.
     */
    lastPage: number;

    /**
     * Pagination range.
     */
    paginationRange: (number|string)[];

    /**
     * Is mobile view.
     */
    isMobile: boolean;
}
