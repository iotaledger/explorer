import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IMilestoneStatsRequest } from "../../../../models/api/stardust/milestone/IMilestoneStatsRequest";
import { IMilestoneAnalyticStats } from "../../../../models/api/stats/IMilestoneAnalyticStats";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { InfluxServiceStardust } from "../../../../services/stardust/influx/influxServiceStardust";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Find the object from the network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: IMilestoneStatsRequest): Promise<IMilestoneAnalyticStats> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.number(Number(request.milestoneIndex), "milestoneIndex");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    const influxService = ServiceFactory.get<InfluxServiceStardust>(`influxdb-${request.network}`);

    if (!influxService) {
        return { error: "Influx service not found for this network." };
    }

    const milestoneIndex = Number.parseInt(request.milestoneIndex, 10);
    let maybeMsStats = await influxService.fetchAnalyticsForMilestoneWithRetries(milestoneIndex);

    if (!maybeMsStats) {
        maybeMsStats = await influxService.fetchAnalyticsForMilestone(milestoneIndex);
    }

    return maybeMsStats
        ? {
              milestoneIndex: maybeMsStats.milestoneIndex,
              blockCount: maybeMsStats.blockCount,
              perPayloadType: maybeMsStats.perPayloadType,
          }
        : {
              message: `Could not fetch milestone analytics for ${request.milestoneIndex}`,
          };
}
