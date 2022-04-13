
export interface NFTDetailsState {
    /**
     * Current page in activity history table.
     */
    currentPage: number;

    /**
     * Page size in activity history table.
     */
    pageSize: number;

    /**
     * Page size in activity history table.
     */
    currentPageActivities: string[];

    /**
     * Show general items
     */
    showGeneralItems: boolean;

    /**
     * Show attributes
     */
    showAttributes: boolean;

    /**
     * Show description
     */
    showDescription: boolean;
}
