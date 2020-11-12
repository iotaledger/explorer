import { ServiceFactory } from "../../factories/serviceFactory";
import { IStatsGetRequest } from "../../models/api/og/IStatsGetRequest";
import { IStatsGetResponse } from "../../models/api/og/IStatsGetResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { IItemsService } from "../../models/services/IItemsService";
import { NetworkService } from "../../services/networkService";
import { ValidationHelper } from "../../utils/validationHelper";

/**
 * Get stats for the requested network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: IStatsGetRequest
): Promise<IStatsGetResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = (await networkService.networks()).map(n => n.network);
    ValidationHelper.oneOf(request.network, networks, "network");

    const itemsService = ServiceFactory.get<IItemsService>(`items-${request.network}`);

    return itemsService ? itemsService.getStats() : {
        itemsPerSecond: 0,
        confirmedItemsPerSecond: 0,
        confirmationRate: 0
    };
}
