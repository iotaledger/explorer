import { SingleNodeClient } from "@iota/iota.js-stardust";
import { BaseStatsService } from "../baseStatsService";

/**
 * Class to handle stats service.
 */
export class StardustStatsService extends BaseStatsService {
    /**
     * Gather more statistics.
     */
    protected async updateStatistics(): Promise<void> {
        try {
            const client = new SingleNodeClient(this._networkConfiguration.provider);
            const info = await client.info();

            if (info) {
                this._statistics.push({
                    itemsPerSecond: info.metrics.messagesPerSecond,
                    confirmedItemsPerSecond: info.metrics.referencedMessagesPerSecond,
                    confirmationRate: info.metrics.referencedRate,
                    latestMilestoneIndex: info.status.latestMilestoneIndex,
                    latestMilestoneIndexTime: info.status.latestMilestoneTimestamp * 1000
                });

                if (this._statistics.length > 30) {
                    this._statistics = this._statistics.slice(-30);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }
}
