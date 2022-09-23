import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IAnalyticStatsRequest } from "../../../../models/api/stats/IAnalyticStatsRequest";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { IShimmerClaimedResponse } from "../../../../models/services/stardust/IShimmerClaimedResponse";
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
): Promise<IShimmerClaimedResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const stardustStatsService = ServiceFactory.get<StardustStatsService>(`stats-${request.network}`);
    const shimmerClaimed = stardustStatsService.getShimmerClaimed();

    return { shimmerClaimed };
}
