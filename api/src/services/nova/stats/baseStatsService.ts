import { INetwork } from "../../../models/db/INetwork";
import { IStatistics } from "../../../models/services/IStatistics";
import { IStatsService } from "../../../models/services/IStatsService";

/**
 * Class to handle stats service.
 */
export abstract class BaseStatsService implements IStatsService {
    /**
     * The network configuration.
     */
    protected readonly _networkConfiguration: INetwork;

    /**
     * The statistics.
     */
    protected _statistics: IStatistics[];

    /**
     * Create a new instance of BaseStatsService.
     * @param networkConfiguration The network configuration.
     */
    constructor(networkConfiguration: INetwork) {
        this._networkConfiguration = networkConfiguration;
        this._statistics = [
            {
                itemsPerSecond: 0,
                confirmedItemsPerSecond: 0,
                confirmationRate: 0,
            },
        ];

        setInterval(async () => this.updateStatistics(), 2000);
    }

    /**
     * Get the current stats.
     * @returns The statistics for the network.
     */
    public getStats(): IStatistics {
        return this._statistics.at(-1);
    }

    /**
     * Get the stats history.
     * @returns The historical statistics for the network.
     */
    public getItemsPerSecondHistory(): number[] {
        return this._statistics.map((s) => s.itemsPerSecond);
    }

    /**
     * Gather more statistics.
     */
    protected abstract updateStatistics(): Promise<void>;
}
