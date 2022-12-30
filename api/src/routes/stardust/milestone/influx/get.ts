import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IMilestoneStatsRequest } from "../../../../models/api/stardust/milestone/IMilestoneStatsRequest";
import { IMilestoneAnalyticStats } from "../../../../models/api/stats/IMilestoneAnalyticStats";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { InfluxDBService } from "../../../../services/stardust/influx/influxDbService";
import { ValidationHelper } from "../../../../utils/validationHelper";


/**
 * Find the object from the network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    _: IConfiguration,
    request: IMilestoneStatsRequest
): Promise<IMilestoneAnalyticStats> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.number(Number(request.milestoneIndex), "milestoneIndex");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    let influxService = ServiceFactory.get<InfluxDBService>(`influxdb-${request.network}`);

    if (!influxService) {
        return { error: "Influx service not found for this network." };
    }

    const MAX_RETRY = 30;
    const RETRY_TIMEOUT = 350;

    let retries = 0;
    const milestoneIndex = Number.parseInt(request.milestoneIndex, 10);
    let maybeMsStats = influxService.milestoneAnalytics.get(milestoneIndex);

    while (!maybeMsStats && retries < MAX_RETRY) {
        retries += 1;
        influxService = ServiceFactory.get<InfluxDBService>(`influxdb-${request.network}`);
        maybeMsStats = influxService.milestoneAnalytics.get(milestoneIndex);

        await new Promise(f => setTimeout(f, RETRY_TIMEOUT));
    }

    return maybeMsStats ? {
        milestoneIndex: maybeMsStats.milestoneIndex,
        blockCount: maybeMsStats.blockCount,
        perPayloadType: maybeMsStats.perPayloadType
    } : {
        error: `Could not fetch milestone analytics for ${request.milestoneIndex}`
    };
}

