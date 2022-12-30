import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IMilestoneStatsRequest } from "../../../../models/api/stardust/milestone/IMilestoneStatsRequest";
import { IMilestoneAnalyticStats } from "../../../../models/api/stats/IMilestoneAnalyticStats";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { ChronicleService } from "../../../../services/stardust/chronicleService";
import { StardustStatsService } from "../../../../services/stardust/stardustStatsService";
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

    const statsService = ServiceFactory.get<StardustStatsService>(`stats-${request.network}`);
    const currentMilesoneStats = statsService?.getMilestoneStats();

    let stats: IMilestoneAnalyticStats | PromiseLike<IMilestoneAnalyticStats>;

    if (currentMilesoneStats[request.milestoneId]?.blocksCount) {
        stats = currentMilesoneStats[request.milestoneId];
    } else {
        if (!networkConfig.permaNodeEndpoint) {
            return {};
        }

        const chronicleService = ServiceFactory.get<ChronicleService>(
            `chronicle-${networkConfig.network}`
        );

        const fetchedStats = await chronicleService.milestoneAnalytics(request.milestoneId);
        currentMilesoneStats[request.milestoneId] = fetchedStats;

        // remove last
        const milestoneIds = Object.keys(currentMilesoneStats);
        if (Object.keys(currentMilesoneStats).length > MILESTONE_CACHE_MAX) {
            delete currentMilesoneStats[milestoneIds[0]];
        }

        stats = fetchedStats;
    }

    return stats;
}

