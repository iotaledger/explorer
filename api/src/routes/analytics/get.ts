import { ServiceFactory } from "../../factories/serviceFactory";
import { IAnalyticStats } from "../../models/api/stats/IAnalyticStats";
import { IAnalyticStatsRequest } from "../../models/api/stats/IAnalyticStatsRequest";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { IAnalyticsStatsService } from "../../models/services/stardust/IAnalyticsStatsService";
import { NetworkService } from "../../services/networkService";
import { ValidationHelper } from "../../utils/validationHelper";

/**
 * Get chornicle analytics for the requested network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: IAnalyticStatsRequest
): Promise<IAnalyticStats> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const statsService = ServiceFactory.get<IAnalyticsStatsService >(`stats-${request.network}`);

    return statsService.getAnalytics();
}
