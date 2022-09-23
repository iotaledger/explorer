import { IShimmerClaimed } from "../../api/stats/IShimmerClaimed";

/**
 * Interface for shimmer stats service.
 */
export interface IShimmerStatsService {
    /**
     * Gets the stats.
     */
    getShimmerClaimed(): IShimmerClaimed;
}

