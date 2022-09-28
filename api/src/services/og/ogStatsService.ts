import { ServiceFactory } from "../../factories/serviceFactory";
import { INetwork } from "../../models/db/INetwork";
import { BaseStatsService } from "../chrysalis/baseStatsService";
import { OgItemsService } from "./ogItemsService";

/**
 * Class to handle stats service.
 */
export class OgStatsService extends BaseStatsService {
    /**
     * The items service.
     */
    private readonly _ogItemsService: OgItemsService;

    /**
     * Create a new instance of OgStatsService.
     * @param networkConfiguration The network configuration.
     */
    constructor(networkConfiguration: INetwork) {
        super(networkConfiguration);
        this._ogItemsService = ServiceFactory.get<OgItemsService>(`items-${this._networkConfiguration.network}`);
    }

    /**
     * Gather more statistics.
     */
    protected async updateStatistics(): Promise<void> {
        try {
            const stats = this._ogItemsService.getStats();

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
