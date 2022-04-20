import { ServiceFactory } from "../../../factories/serviceFactory";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { INftOutputsRequest } from "../../../models/api/stardust/INftOutputsRequest";
import { INftOutputsResponse } from "../../../models/api/stardust/INftOutputsResponse";
import { STARDUST } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { StardustTangleHelper } from "../../../utils/stardust/stardustTangleHelper";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Find the object from the network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: INftOutputsRequest
): Promise<INftOutputsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.address, "address");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    return StardustTangleHelper.nftOutputs(networkConfig, request.address);
}
