// eslint-disable-next-line import/no-unresolved
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
            const response = await client.getNodeInfo();

            if (response) {
                const metrics = response.info.metrics;
                this._statistics.push({
                    itemsPerSecond: Number(metrics.blocksPerSecond),
                    confirmedItemsPerSecond: Number(metrics.confirmedBlocksPerSecond),
                    confirmationRate: Number(metrics.confirmationRate),
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
