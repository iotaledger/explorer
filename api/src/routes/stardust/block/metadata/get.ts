import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IBlockDetailsResponse } from "../../../../models/api/stardust/IBlockDetailsResponse";
import { IBlockRequest } from "../../../../models/api/stardust/IBlockRequest";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { StardustApiService } from "../../../../services/stardust/stardustApiService";
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

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    const stardustApiService = ServiceFactory.get<StardustApiService>(`api-service-${networkConfig.network}`);
    return stardustApiService.blockDetails(request.blockId);
}
