import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IResponse } from "../../../../models/api/nova/IResponse";
import { IEpochAnalyticStats } from "../../../../models/api/nova/stats/epoch/IEpochAnalyticStats";
import { IEpochAnalyticStatsRequest } from "../../../../models/api/nova/stats/epoch/IEpochAnalyticStatsRequest";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { NOVA } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { InfluxServiceNova } from "../../../../services/nova/influx/influxServiceNova";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * The response with the current cached data.
 */
type IEpochAnalyticStatsReponse = IEpochAnalyticStats & IResponse;

/**
 * Find the object from the network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: IEpochAnalyticStatsRequest): Promise<IEpochAnalyticStatsReponse> {
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
    const maybeEpochStats = await influxService.getEpochAnalyticStats(epochIndex);

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
