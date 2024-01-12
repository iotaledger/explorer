import { ServiceFactory } from "../../../../../factories/serviceFactory";
import { IAddressDetailsRequest } from "../../../../../models/api/stardust/IAddressDetailsRequest";
import { IAddressDetailsResponse } from "../../../../../models/api/stardust/IAddressDetailsResponse";
import { IConfiguration } from "../../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../../services/networkService";
import { StardustTangleHelper } from "../../../../../utils/stardust/stardustTangleHelper";
import { ValidationHelper } from "../../../../../utils/validationHelper";

/**
 * Fetch the alias output details by address.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: IAddressDetailsRequest
): Promise<IAddressDetailsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    return StardustTangleHelper.aliasOutputDetailsByAddress(networkConfig, request.address);
}
