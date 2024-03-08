import { ServiceFactory } from "../../../../../factories/serviceFactory";
import { INetworkBoundGetRequest } from "../../../../../models/api/INetworkBoundGetRequest";
import { IResponse } from "../../../../../models/api/IResponse";
import { IAnalyticStats } from "../../../../../models/api/stats/IAnalyticStats";
import { IConfiguration } from "../../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../../models/db/protocolVersion";
import { IShimmerClaimedResponse } from "../../../../../models/services/stardust/IShimmerClaimedResponse";
import { NetworkService } from "../../../../../services/networkService";
import { InfluxServiceStardust } from "../../../../../services/stardust/influx/influxServiceStardust";
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
export async function get(_: IConfiguration, request: INetworkBoundGetRequest): Promise<IAnalyticStatsReponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    const networkConfig = networkService.get(request.network);
    ValidationHelper.oneOf(request.network, networks, "network");

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    const influxService = ServiceFactory.get<InfluxServiceStardust>(`influxdb-${request.network}`);

    return influxService
        ? {
              nativeTokens: influxService.nativeTokensCount,
              nfts: influxService.nftsCount,
              totalAddresses: influxService.addressesWithBalance,
              dailyAddresses: "",
              lockedStorageDeposit: influxService.lockedStorageDeposit,
              unclaimedShimmer: influxService.totalUnclaimedShimmer,
          }
        : {
              error: "Influx service not found for this network.",
          };
}
