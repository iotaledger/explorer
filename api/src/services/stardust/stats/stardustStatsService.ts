/* eslint-disable no-void */
import { SingleNodeClient } from "@iota/iota.js-stardust";
import logger from "../../../logger";
import { BaseStatsService } from "./baseStatsService";


/**
 * Class to handle stats service.
 */
export class StardustStatsService extends BaseStatsService {
    /**
     * Gather general statistics.
     */
    protected async updateStatistics(): Promise<void> {
        try {
            const client = new SingleNodeClient(this._networkConfiguration.provider);
            const info = await client.info();

            if (info) {
                this._statistics.push({
                    itemsPerSecond: info.metrics.blocksPerSecond,
                    confirmedItemsPerSecond: info.metrics.referencedBlocksPerSecond,
                    confirmationRate: info.metrics.referencedRate,
                    latestMilestoneIndex: info.status.latestMilestone.index,
                    latestMilestoneIndexTime: info.status.latestMilestone.timestamp * 1000
                });

                logger.debug(
                    `[StardustStatsService] Updating network statistics for ${this._networkConfiguration.network}`
                );

                if (this._statistics.length > 30) {
                    this._statistics = this._statistics.slice(-30);
                }
            }
        } catch (err) {
            logger.debug(`[StardustStatsService] Update statistics failed: ${err}`);
        }
    }
}

