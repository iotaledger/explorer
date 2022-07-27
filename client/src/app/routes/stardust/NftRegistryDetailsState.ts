import { INftRegistryDetailsResponse } from "../../../models/api/stardust/nft/INftRegistryDetailsResponse";

export interface NftRegistryDetailsState {
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
    nftDetails: INftRegistryDetailsResponse;

}
