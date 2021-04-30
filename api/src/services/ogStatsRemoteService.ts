import { IStatsGetResponse } from "../models/api/stats/IStatsGetResponse";
import { INetwork } from "../models/db/INetwork";
import { FetchHelper } from "../utils/fetchHelper";
import { BaseStatsService } from "./baseStatsService";

/**
 * Class to handle stats service.
 */
export class OgStatsRemoteService extends BaseStatsService {
    /**
     * Remote feed instance url.
     */
    private readonly _feedInstanceUrl: string;

    /**
     * Create a new instance of OgStatsService.
     * @param networkConfiguration The network configuration.
     * @param feedInstanceUrl Feed instance url.
     */
    constructor(networkConfiguration: INetwork, feedInstanceUrl: string) {
        super(networkConfiguration);
        this._feedInstanceUrl = feedInstanceUrl;
    }

    /**
     * Gather more statistics.
     */
    protected async updateStatistics(): Promise<void> {
        try {
            const statsResponse = await FetchHelper.json<unknown, IStatsGetResponse>(
                this._feedInstanceUrl,
                `stats/${this._networkConfiguration.network}?includeHistory=true`,
                "get");

            this._statistics.push({
                itemsPerSecond: statsResponse.itemsPerSecond,
                confirmedItemsPerSecond: statsResponse.confirmedItemsPerSecond,
                confirmationRate: statsResponse.confirmationRate,
                latestMilestoneIndex: statsResponse.latestMilestoneIndex,
                latestMilestoneIndexTime: statsResponse.latestMilestoneIndexTime
            });

            if (this._statistics.length > 30) {
                this._statistics = this._statistics.slice(-30);
            }
        } catch (err) {
            console.error(err);
        }
    }
}
