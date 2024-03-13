import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IEpochAnalyticStats } from "../../../../models/api/nova/stats/epoch/IEpochAnalyticStats";
import { IEpochStatsRequest } from "../../../../models/api/nova/stats/epoch/IEpochStatsRequest";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { NOVA } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { InfluxServiceNova } from "../../../../services/nova/influx/influxServiceNova";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Find the object from the network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: IEpochStatsRequest): Promise<IEpochAnalyticStats> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.number(Number(request.epochIndex), "epochIndex");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    const influxService = ServiceFactory.get<InfluxServiceNova>(`influxdb-${request.network}`);

    if (!influxService) {
        return { error: "Influx service not found for this network." };
    }

    const epochIndex = Number.parseInt(request.epochIndex, 10);
    let maybeEpochStats = await influxService.fetchAnalyticsForEpochWithRetries(epochIndex);

    if (!maybeEpochStats) {
        maybeEpochStats = await influxService.fetchAnalyticsForEpoch(epochIndex);
    }

    return maybeEpochStats
        ? {
              epochIndex: maybeEpochStats.epochIndex,
              blockCount: maybeEpochStats.blockCount,
              perPayloadType: maybeEpochStats.perPayloadType,
          }
        : {
              message: `Could not fetch epoch analytics for ${request.epochIndex}`,
          };
}
