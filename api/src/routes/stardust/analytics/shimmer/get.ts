import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IAnalyticStatsRequest } from "../../../../models/api/stats/IAnalyticStatsRequest";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { IShimmerClaimingStatsResponse } from "../../../../models/services/stardust/IShimmerClaimingStatsResponse";
import { NetworkService } from "../../../../services/networkService";
import { StardustStatsService } from "../../../../services/stardust/stardustStatsService";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Get stats for the requested network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: IAnalyticStatsRequest
): Promise<IShimmerClaimingStatsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const stardustStatsService = ServiceFactory.get<StardustStatsService>(`stats-${request.network}`);

    const currentShimmerClaimStats = await stardustStatsService.getShimmerStats();

    return {
        totalShimmerTokensClaimed: currentShimmerClaimStats
    };
}
