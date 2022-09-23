import { IShimmerClaimStats } from "../../api/stats/IShimmerClaimStats";

/**
 * Interface for shimmer stats service.
 */
export interface IShimmerStatsService {
    /**
     * Gets the stats.
     */
    getShimmerStats(): Promise<IShimmerClaimStats>;
}

