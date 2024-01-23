import { ServiceFactory } from "../../../factories/serviceFactory";
import { IBlockRequest } from "../../../models/api/stardust/IBlockRequest";
import { IBlockResponse } from "../../../models/api/stardust/IBlockResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { StardustApiService } from "../../../services/stardust/stardustApiService";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Fetch the block from the network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: IBlockRequest): Promise<IBlockResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.blockId, "blockId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    const stardustApiService = ServiceFactory.get<StardustApiService>(`api-service-${networkConfig.network}`);
    return stardustApiService.block(request.blockId);
}
