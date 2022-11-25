import { ServiceFactory } from "../../../../factories/serviceFactory";
import { INetworkBoundGetRequest } from "../../../../models/api/stardust/INetworkBoundGetRequest";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { NetworkService } from "../../../../services/networkService";
import {
    IAddressesWithBalanceDailyInflux,
    IAvgAddressesPerMilestoneDailyInflux,
    IBlocksDailyInflux, IOutputsDailyInflux, ITokensHeldPerOutputDailyInflux,
    ITokensTransferredDailyInflux, ITransactionsDailyInflux
} from "../../../../services/stardust/influx/influxDbClient";
import { InfluxDBService } from "../../../../services/stardust/influx/influxDbService";
import { ValidationHelper } from "../../../../utils/validationHelper";

export interface IDailyAnalyticsResponse {
    error?: string;
    blocksDaily?: IBlocksDailyInflux[];
    transactionsDaily?: ITransactionsDailyInflux[];
    outputsDaily?: IOutputsDailyInflux[];
    tokensHeldDaily?: ITokensHeldPerOutputDailyInflux[];
    addressesWithBalanceDaily?: IAddressesWithBalanceDailyInflux[];
    avgAddressesPerMilestoneDaily?: IAvgAddressesPerMilestoneDailyInflux[];
    tokensTransferredDaily?: ITokensTransferredDailyInflux[];
}

/**
 * Get influx cached analytic stats for the requested network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    _: IConfiguration,
    request: INetworkBoundGetRequest
): Promise<IDailyAnalyticsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const influxService = ServiceFactory.get<InfluxDBService>(`influxdb-${request.network}`);

    return influxService ? {
        blocksDaily: influxService.blocksDaily,
        transactionsDaily: influxService.transactionsDaily,
        outputsDaily: influxService.outputsDaily,
        tokensHeldDaily: influxService.tokensHeldDaily,
        addressesWithBalanceDaily: influxService.addressesWithBalanceDaily,
        avgAddressesPerMilestoneDaily: influxService.avgAddressesPerMilestoneDaily,
        tokensTransferredDaily: influxService.tokensTransferredDaily
    } : {
        error: "Influx service not found for this network."
    };
}

