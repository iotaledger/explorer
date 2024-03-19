import { ServiceFactory } from "../../../../../factories/serviceFactory";
import { INetworkBoundGetRequest } from "../../../../../models/api/INetworkBoundGetRequest";
import { IResponse } from "../../../../../models/api/nova/IResponse";
import { IAnalyticStats } from "../../../../../models/api/nova/stats/IAnalyticStats";
import { IConfiguration } from "../../../../../models/configuration/IConfiguration";
import { NOVA } from "../../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../../services/networkService";
import { InfluxServiceNova } from "../../../../../services/nova/influx/influxServiceNova";
import { ValidationHelper } from "../../../../../utils/validationHelper";

/**
 * The response with the current cached data.
 */
type IAnalyticStatsReponse = IAnalyticStats & IResponse;

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

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    const influxService = ServiceFactory.get<InfluxServiceNova>(`influxdb-${request.network}`);

    return influxService
        ? {
              nativeTokens: influxService.nativeTokensCount,
              nfts: influxService.nftsCount,
              accountAddressesWithBalance: influxService.accountAddressesWithBalance,
              lockedStorageDeposit: influxService.lockedStorageDeposit,
              delegatorsCount: influxService.delegatorsCount,
          }
        : {
              error: `Influx service not found for this network: ${request.network}`,
          };
}
