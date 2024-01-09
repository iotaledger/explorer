import { IStatistics } from "./IStatistics";

/**
 * Interface definition for a statis service.
 */
export interface IStatsService {
    /**
     * Get the current stats.
     * @returns The statistics for the network.
     */
    getStats(): IStatistics;

    /**
     * Get the stats history.
     * @returns The historical statistics for the network.
     */
    getItemsPerSecondHistory(): number[];
}
