export interface PaginationProps {

    /**
     * The total number of pages.
     */
    totalCount: number;

     /**
      * The number of current page.
      */
    currentPage: number;

     /**
      * The total number of sibling pages.
      */
    siblingsCount: number;

     /**
      * Number of results per page.
      */
    pageSize: number;

     /**
      * The optional additional CSS classes.
      */
    classNames?: string;

    /**
     * Page changed.
     * @param page Page navigated to.
     */
    onPageChange(page: number): void;

}
