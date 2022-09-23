import { ServiceFactory } from "../../../factories/serviceFactory";
import { IAnalyticStats } from "../../../models/api/stats/IAnalyticStats";
import { IAnalyticStatsRequest } from "../../../models/api/stats/IAnalyticStatsRequest";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { IShimmerClaimingStatsResponse } from "../../../models/services/stardust/IShimmerClaimingStatsResponse";
import { NetworkService } from "../../../services/networkService";
import { StardustStatsService } from "../../../services/stardust/stardustStatsService";
import { ValidationHelper } from "../../../utils/validationHelper";

type IAnalyticStatsReponse = IAnalyticStats & IShimmerClaimingStatsResponse;

/**
 * Get chornicle analytics for the requested network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: IAnalyticStatsRequest
): Promise<IAnalyticStatsReponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const statsService = ServiceFactory.get<StardustStatsService>(`stats-${request.network}`);
    const analytics = await statsService.getAnalytics();
    const shimmerClaimingCount = await statsService.getShimmerStats();

    const response = {
        ...analytics,
        totalShimmerTokensClaimed: shimmerClaimingCount
    };

    return response;
}
