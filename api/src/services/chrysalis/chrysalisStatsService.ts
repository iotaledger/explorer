import { SingleNodeClient } from "@iota/iota.js-chrysalis";
import { BaseStatsService } from "./baseStatsService";

/**
 * Class to handle stats service.
 */
export class ChrysalisStatsService extends BaseStatsService {
    /**
     * Gather more statistics.
     */
    protected async updateStatistics(): Promise<void> {
        try {
            const client = new SingleNodeClient(this._networkConfiguration.provider);
            const info = await client.info();

            if (info) {
                this._statistics.push({
                    itemsPerSecond: info.messagesPerSecond,
                    confirmedItemsPerSecond: info.referencedMessagesPerSecond,
                    confirmationRate: info.referencedRate,
                    latestMilestoneIndex: info.latestMilestoneIndex,
                    latestMilestoneIndexTime: info.latestMilestoneTimestamp * 1000
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
