import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IBlockDetailsResponse } from "../../../../models/api/nova/IBlockDetailsResponse";
import { IBlockRequest } from "../../../../models/api/stardust/IBlockRequest";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { NOVA } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { NovaApiService } from "../../../../services/nova/novaApiService";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Fetch the block details from the network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: IBlockRequest): Promise<IBlockDetailsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.blockId, "blockId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    const novaApiService = ServiceFactory.get<NovaApiService>(`api-service-${networkConfig.network}`);
    return novaApiService.blockDetails(request.blockId);
}
