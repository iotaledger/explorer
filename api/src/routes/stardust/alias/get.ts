import { ServiceFactory } from "../../../factories/serviceFactory";
import { IAliasRequest } from "../../../models/api/stardust/IAliasRequest";
import { IAliasResponse } from "../../../models/api/stardust/IAliasResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { StardustTangleHelper } from "../../../utils/stardust/stardustTangleHelper";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Get alias output details by Alias address
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: IAliasRequest
): Promise<IAliasResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.aliasId, "aliasId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    return StardustTangleHelper.aliasDetails(networkConfig, request.aliasId);
}
