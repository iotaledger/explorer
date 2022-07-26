import { ServiceFactory } from "../../../../factories/serviceFactory";
import { INftAddressDetailsRequest } from "../../../../models/api/stardust/INftAddressDetailsRequest";
import { INftAddressDetailsResponse } from "../../../../models/api/stardust/INftAddressDetailsResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { StardustTangleHelper } from "../../../../utils/stardust/stardustTangleHelper";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Find NFT details by nftId.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: INftAddressDetailsRequest
): Promise<INftAddressDetailsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.nftId, "nftId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    return StardustTangleHelper.nftDetails(networkConfig, request.nftId);
}
