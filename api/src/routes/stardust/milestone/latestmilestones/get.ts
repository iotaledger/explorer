import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IAnalyticStatsRequest } from "../../../../models/api/stats/IAnalyticStatsRequest";
import { ILatestMilestone } from "../../../../models/api/latestmilestones/ILatestMilestone";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { StardustItemsService } from "../../../../services/stardust/stardustItemsService";
import { StardustStatsService } from "../../../../services/stardust/stardustStatsService";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Find the object from the network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: IAnalyticStatsRequest
): Promise<ILatestMilestone[] | Record<string, unknown>> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    const statsService = ServiceFactory.get<StardustStatsService>(`stats-${request.network}`);
    const currentMilesoneStats = statsService?.getMilestoneStats();

    const itemsService = ServiceFactory.get<StardustItemsService>(`items-${request.network}`);
    const latestMilestones = itemsService.getLatestMilestones();

    const milestones: ILatestMilestone[] = [];

    for (const milestone of latestMilestones) {
        if (currentMilesoneStats[milestone.milestoneId]) {
            milestones.push({
                id: milestone.id,
                properties: {
                    index: milestone.milestoneIndex,
                    milestoneId: milestone.milestoneId,
                    timestamp: milestone.timestamp
                }
            });
        }
    }

    return milestones;
}
