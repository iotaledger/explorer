import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IMilestoneStatsRequest } from "../../../../models/api/stardust/milestone/IMilestoneStatsRequest";
import { IMilestoneAnalyticStats } from "../../../../models/api/stats/IMilestoneAnalyticStats";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { IAnalyticsStore } from "../../../../models/db/IAnalyticsStore";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { IStorageService } from "../../../../models/services/IStorageService";
import { NetworkService } from "../../../../services/networkService";
import { ChronicleService } from "../../../../services/stardust/chronicleService";
import { ValidationHelper } from "../../../../utils/validationHelper";

const MILESTONE_CACHE_MAX = 20;

/**
 * Find the object from the network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: IMilestoneStatsRequest
): Promise<IMilestoneAnalyticStats> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.number(Number(request.milestoneId), "milestoneId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    const analyticsStorage = ServiceFactory.get<IStorageService<IAnalyticsStore>>("analytics-storage");
    const analyticsStore = await analyticsStorage.get(request.network);
    if (!analyticsStore.milestoneAnalytics) {
        analyticsStore.milestoneAnalytics = {};
    }

    if (analyticsStore) {
        const cachedStats = analyticsStore.milestoneAnalytics[request.milestoneId];
        if (cachedStats) {
            return cachedStats;
        }
    }

    const chronicleService = ServiceFactory.get<ChronicleService>(
        `chronicle-${networkConfig.network}`
    );

    const fetchedStats = await chronicleService.milestoneAnalytics(request.milestoneId);
    // Add new milestone stats to store
    analyticsStore.milestoneAnalytics[request.milestoneId] = fetchedStats;
    // Keep the milestone analytics object at MILESTONE_CACHE_MAX
    const milestoneIds = Object.keys(analyticsStore.milestoneAnalytics);
    if (Object.keys(analyticsStore.milestoneAnalytics).length > MILESTONE_CACHE_MAX) {
        delete analyticsStore.milestoneAnalytics[milestoneIds[0]];
    }

    // eslint-disable-next-line no-void
    void analyticsStorage.set(analyticsStore);

    return fetchedStats;
}

