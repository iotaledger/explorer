import { ServiceFactory } from "../../../../../factories/serviceFactory";
import { IResponse } from "../../../../../models/api/IResponse";
import { INetworkBoundGetRequest } from "../../../../../models/api/stardust/INetworkBoundGetRequest";
import { IAnalyticStats } from "../../../../../models/api/stats/IAnalyticStats";
import { IConfiguration } from "../../../../../models/configuration/IConfiguration";
import { IShimmerClaimedResponse } from "../../../../../models/services/stardust/IShimmerClaimedResponse";
import { NetworkService } from "../../../../../services/networkService";
import { InfluxDBService } from "../../../../../services/stardust/influx/influxDbService";
import { ValidationHelper } from "../../../../../utils/validationHelper";

/**
 * The response with the current cached data.
 */
type IAnalyticStatsReponse = IAnalyticStats & IShimmerClaimedResponse & IResponse;

/**
 * Get influx cached analytic stats for the requested network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    _: IConfiguration,
    request: INetworkBoundGetRequest
): Promise<IAnalyticStatsReponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const influxService = ServiceFactory.get<InfluxDBService>(`influxdb-${request.network}`);

    return influxService ? {
        nativeTokens: influxService.nativeTokensCount,
        nfts: influxService.nftsCount,
        totalAddresses: influxService.addressesWithBalance,
        dailyAddresses: "1337",
        lockedStorageDeposit: influxService.lockedStorageDeposit,
        unclaimedShimmer: influxService.totalUnclaimedShimmer
    } : {
        error: "Influx service not found for this network."
    };
}
