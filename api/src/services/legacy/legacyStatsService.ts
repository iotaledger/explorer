import { ServiceFactory } from "../../factories/serviceFactory";
import { INetwork } from "../../models/db/INetwork";
import { BaseStatsService } from "../chrysalis/baseStatsService";
import { LegacyItemsService } from "./legacyItemsService";

/**
 * Class to handle stats service.
 */
export class LegacyStatsService extends BaseStatsService {
    /**
     * The items service.
     */
    private readonly _legacyItemsService: LegacyItemsService;

    /**
     * Create a new instance of LegacyStatsService.
     * @param networkConfiguration The network configuration.
     */
    constructor(networkConfiguration: INetwork) {
        super(networkConfiguration);
        this._legacyItemsService = ServiceFactory.get<LegacyItemsService>(`items-${this._networkConfiguration.network}`);
    }

    /**
     * Gather more statistics.
     */
    protected async updateStatistics(): Promise<void> {
        try {
            const stats = this._legacyItemsService.getStats();

            this._statistics.push({
                itemsPerSecond: stats.itemsPerSecond,
                confirmedItemsPerSecond: stats.confirmedItemsPerSecond,
                confirmationRate: stats.confirmationRate,
                latestMilestoneIndex: stats.latestMilestoneIndex,
                latestMilestoneIndexTime: stats.latestMilestoneIndexTime
            });

            if (this._statistics.length > 30) {
                this._statistics = this._statistics.slice(-30);
            }
        } catch (err) {
            console.error(err);
        }
    }
}
