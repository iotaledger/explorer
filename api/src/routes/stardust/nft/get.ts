import { ServiceFactory } from "../../../factories/serviceFactory";
import { INftDetailsRequest } from "../../../models/api/stardust/nft/INftDetailsRequest";
import { INftDetailsResponse } from "../../../models/api/stardust/nft/INftDetailsResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { StardustApiService } from "../../../services/stardust/stardustApiService";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Find NFT details by nftId.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(config: IConfiguration, request: INftDetailsRequest): Promise<INftDetailsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.nftId, "nftId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    const stardustApiService = ServiceFactory.get<StardustApiService>(`api-service-${networkConfig.network}`);
    return stardustApiService.nftDetails(request.nftId);
}
