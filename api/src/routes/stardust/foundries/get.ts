import { ServiceFactory } from "../../../factories/serviceFactory";
import { IFoundriesRequest } from "../../../models/api/stardust/IFoundriesRequest";
import { IFoundriesResponse } from "../../../models/api/stardust/IFoundriesResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { StardustTangleHelper } from "../../../utils/stardust/stardustTangleHelper";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Get controlled Foundry output id by controller Alias address
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: IFoundriesRequest
): Promise<IFoundriesResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.aliasAddress, "aliasAddress");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    return StardustTangleHelper.aliasFoundries(networkConfig, request.aliasAddress);
}
