import { ServiceFactory } from "../../../../factories/serviceFactory";
import { INetworkBoundGetRequest } from "../../../../models/api/stardust/INetworkBoundGetRequest";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { NetworkService } from "../../../../services/networkService";
import { BlocksInflux } from "../../../../services/stardust/influx/influxDbClient";
import { InfluxDBService } from "../../../../services/stardust/influx/influxDbService";
import { ValidationHelper } from "../../../../utils/validationHelper";

export interface IBlocksDailyResponse {
    blocksDaily: BlocksInflux[];
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
): Promise<IBlocksDailyResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const influxService = ServiceFactory.get<InfluxDBService>(`influxdb-${request.network}`);
    console.log(influxService);

    return {
        blocksDaily: influxService.blocksDaily
    };
}

