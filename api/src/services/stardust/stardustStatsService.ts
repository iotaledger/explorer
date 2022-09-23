/* eslint-disable no-void */
import { SingleNodeClient } from "@iota/iota.js-stardust";
import { ServiceFactory } from "../../factories/serviceFactory";
import { BaseStatsService } from "./baseStatsService";
import { ChronicleService } from "./chronicleService";


/**
 * Class to handle stats service.
 */
export class StardustStatsService extends BaseStatsService {
    /**
     * Gather more statistics.
     */
    protected async updateStatistics(): Promise<void> {
        void this.refreshGeneralStatistics();
        void this.refreshShimmerClaimingStatistics();
    }

    /**
     * Refresh analytic stats from chronicle.
     * @returns The fresh analytic stats.
     */
    protected async fetchAnalyticStats(): Promise<void> {
        const network = this._networkConfiguration.network;
        const chronicleService = ServiceFactory.get<ChronicleService>(`chronicle-${network}`);

        const analyticsStore = await this._analyticsStorage.get(network);

        try {
            const latestMsFromStatistics: number = this._statistics[this._statistics.length - 1].latestMilestoneIndex;

            if (analyticsStore && chronicleService && latestMsFromStatistics !== 0) {
                const analyitcsMsFirst = analyticsStore.dailyMilestones?.first;
                const analyticsMsLast = analyticsStore.dailyMilestones?.last;

                const yesterdaysFirstMilestone = analyitcsMsFirst ?? this._statistics[0].latestMilestoneIndex;

                const yesterdaysLastMilestone =
                    (analyticsMsLast && analyticsMsLast > yesterdaysFirstMilestone) ?
                    analyticsMsLast : latestMsFromStatistics;

                console.log("[StatsService] Refreshing chronicle analytics...");
                const start = Date.now();
                const analytics = await chronicleService.analytics(
                    latestMsFromStatistics,
                    yesterdaysFirstMilestone,
                    yesterdaysLastMilestone
                );
                console.log("Analytics for", network, "refreshed in", (Date.now() - start) / 1000, "s");

                analyticsStore.analytics = analytics;
                await this._analyticsStorage.set(analyticsStore);
            } else {
                console.log("Retrying Analytics refresh in 10s...");
                setTimeout(() => {
                    this.setupAnalytics();
                }, 10000);
            }
        } catch (e) {
            console.log(e);
        }
    }

    private async refreshGeneralStatistics(): Promise<void> {
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

                if (this._statistics.length > 30) {
                    this._statistics = this._statistics.slice(-30);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    private async refreshShimmerClaimingStatistics(): Promise<void> {
        const network = this._networkConfiguration.network;
        const chronicleService = ServiceFactory.get<ChronicleService>(`chronicle-${network}`);

        const claimingStats = await chronicleService.shimmerClaimingStatistics();
        const analyticsStore = await this._analyticsStorage.get(network);

        if (claimingStats?.count && analyticsStore) {
            analyticsStore.shimmerClaimingStats = claimingStats.count;
            await this._analyticsStorage.set(analyticsStore);
        }
    }
}
