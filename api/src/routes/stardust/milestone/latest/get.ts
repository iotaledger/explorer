import { ServiceFactory } from "../../../../factories/serviceFactory";
import { ILatestMilestonesReponse, ILatestMilestone } from "../../../../models/api/stardust/milestone/ILatestMilestonesResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { StardustItemsService } from "../../../../services/stardust/stardustItemsService";
import { StardustStatsService } from "../../../../services/stardust/stardustStatsService";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Find the object from the network.
 * @param _ The configuration.
 * @param request The request.
 * @param request.network The network in context.
 * @returns The response.
 */
export async function get(
    _: IConfiguration,
    request: { network: string }
): Promise<ILatestMilestonesReponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return { error: "Endpoint available only on Stardust networks.", milestones: [] };
    }

    const statsService = ServiceFactory.get<StardustStatsService>(`stats-${request.network}`);
    const currentMilesoneStats = statsService?.getMilestoneStats();

    const itemsService = ServiceFactory.get<StardustItemsService>(`items-${request.network}`);
    const latestMilestones = itemsService.getLatestMilestones();

    const milestones: ILatestMilestone[] = [];

    for (const milestone of latestMilestones) {
        const milestoneWithStats = currentMilesoneStats[milestone.milestoneId];
        if (milestones.length < 20 && milestoneWithStats) {
            milestones.push({
                ...milestone,
                blocksCount: milestoneWithStats.blocksCount,
                perPayloadType: milestoneWithStats.perPayloadType,
                perInclusionState: milestoneWithStats.perInclusionState
            });
        }
    }

    return { milestones };
}

