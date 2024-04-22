import { Client } from "@iota/sdk-nova";
import { BaseStatsService } from "./baseStatsService";
import { ServiceFactory } from "../../../factories/serviceFactory";
import logger from "../../../logger";

/**
 * Class to handle stats service.
 */
export class NovaStatsService extends BaseStatsService {
    /**
     * Gather general statistics.
     */
    protected async updateStatistics(): Promise<void> {
        try {
            const client = ServiceFactory.get<Client>(`client-${this._networkConfiguration.network}`);
            const metricsResponse = await client.getNetworkMetrics();

            if (metricsResponse) {
                this._statistics.push({
                    itemsPerSecond: Number(metricsResponse.blocksPerSecond),
                    confirmedItemsPerSecond: Number(metricsResponse.confirmedBlocksPerSecond),
                    confirmationRate: Number(metricsResponse.confirmationRate),
                });

                logger.debug(`[NovaStatsService] Updating network statistics for ${this._networkConfiguration.network}`);

                if (this._statistics.length > 30) {
                    this._statistics = this._statistics.slice(-30);
                }
            }
        } catch (err) {
            logger.debug(`[NovaStatsService] Update statistics failed: ${err}`);
        }
    }
}
