import { Client } from "@iota/sdk-stardust";
import { BaseStatsService } from "./baseStatsService";
import { ServiceFactory } from "../../../factories/serviceFactory";
import logger from "../../../logger";

/**
 * Class to handle stats service.
 */
export class StardustStatsService extends BaseStatsService {
    /**
     * Gather general statistics.
     */
    protected async updateStatistics(): Promise<void> {
        try {
            const client = ServiceFactory.get<Client>(`client-${this._networkConfiguration.network}`);
            const response = await client.getInfo();

            if (response) {
                this._statistics.push({
                    itemsPerSecond: response.nodeInfo.metrics.blocksPerSecond,
                    confirmedItemsPerSecond: response.nodeInfo.metrics.referencedBlocksPerSecond,
                    confirmationRate: response.nodeInfo.metrics.referencedRate,
                    latestMilestoneIndex: response.nodeInfo.status.latestMilestone.index,
                    latestMilestoneIndexTime: response.nodeInfo.status.latestMilestone.timestamp * 1000,
                });

                logger.debug(`[StardustStatsService] Updating network statistics for ${this._networkConfiguration.network}`);

                if (this._statistics.length > 30) {
                    this._statistics = this._statistics.slice(-30);
                }
            }
        } catch (err) {
            logger.debug(`[StardustStatsService] Update statistics failed: ${err}`);
        }
    }
}
