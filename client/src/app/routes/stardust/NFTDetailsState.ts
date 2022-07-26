import { INftDetailsResponse } from "../../../models/api/stardust/nft/INftDetailsResponse";

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
     * History details
     */
    nftDetails: INftDetailsResponse;

}
