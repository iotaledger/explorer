import { ServiceFactory } from "../../factories/serviceFactory";
import { IStatsGetRequest } from "../../models/api/stats/IStatsGetRequest";
import { IStatsGetResponse } from "../../models/api/stats/IStatsGetResponse";
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
    if (request.network === "chrysalis") {
        request.network = "mainnet";
    }
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = (await networkService.networks()).map(n => n.network);
    ValidationHelper.oneOf(request.network, networks, "network");

    const itemsService = ServiceFactory.get<IItemsService>(`items-${request.network}`);

    const stats = itemsService.getStats();

    if (stats) {
        const timeSinceLastMsInMinutes = (Date.now() - stats.latestMilestoneIndexTime) / 60000;
        let health = 0;
        let healthReason = "No milestone within 5 minutes";
        if (timeSinceLastMsInMinutes < 2) {
            health = 2; // good
            healthReason = "OK";
        } else if (timeSinceLastMsInMinutes < 5) {
            health = 1; // degraded
            healthReason = "No milestone within 2 minutes";
        }
        return {
            ...stats,
            health,
            healthReason
        };
    }

    return {
        itemsPerSecond: 0,
        confirmedItemsPerSecond: 0,
        confirmationRate: 0,
        latestMilestoneIndex: 0,
        latestMilestoneIndexTime: 0,
        health: 0
    };
}
