import { ServiceFactory } from "../../../../../factories/serviceFactory";
import { ISlotAnalyticStatsRequest } from "../../../../../models/api/nova/stats/slot/ISlotAnalyticStatsRequest";
import { ISlotAnalyticStatsResponse } from "../../../../../models/api/nova/stats/slot/ISlotAnalyticStatsResponse";
import { IConfiguration } from "../../../../../models/configuration/IConfiguration";
import { NOVA } from "../../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../../services/networkService";
import { InfluxServiceNova } from "../../../../../services/nova/influx/influxServiceNova";
import { ValidationHelper } from "../../../../../utils/validationHelper";

/**
 * Fetch the slot stats from influx nova.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: ISlotAnalyticStatsRequest): Promise<ISlotAnalyticStatsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.numberFromString(request.slotIndex, "slotIndex");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    const influxService = ServiceFactory.get<InfluxServiceNova>(`influxdb-${networkConfig.network}`);

    if (influxService) {
        const slotIndex = Number.parseInt(request.slotIndex, 10);
        const slotStats = await influxService.getSlotAnalyticStats(slotIndex);

        if (slotStats) {
            return slotStats;
        }

        return { error: `Could not fetch stats for slot ${request.slotIndex}` };
    }

    return { error: "Influx service not found for this network." };
}
