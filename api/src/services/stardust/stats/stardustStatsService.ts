/* eslint-disable no-void */
import { Client } from "@iota/sdk";
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
            const client = new Client({ nodes: [this._networkConfiguration.provider] });
            const response = await client.getInfo();

            if (response) {
                this._statistics.push({
                    itemsPerSecond: response.nodeInfo.metrics.blocksPerSecond,
                    confirmedItemsPerSecond: response.nodeInfo.metrics.referencedBlocksPerSecond,
                    confirmationRate: response.nodeInfo.metrics.referencedRate,
                    latestMilestoneIndex: response.nodeInfo.status.latestMilestone.index,
                    latestMilestoneIndexTime: response.nodeInfo.status.latestMilestone.timestamp * 1000
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

