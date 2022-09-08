import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IAddressBasicOutputsRequest } from "../../../../models/api/stardust/IAddressBasicOutputsRequest";
import { IAddressBasicOutputsResponse } from "../../../../models/api/stardust/IAddressBasicOutputsResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { StardustTangleHelper } from "../../../../utils/stardust/stardustTangleHelper";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Fetch the basic output ids by address.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: IAddressBasicOutputsRequest
): Promise< IAddressBasicOutputsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    return StardustTangleHelper.basicOutputIdsByAddress(networkConfig, request.address);
}

