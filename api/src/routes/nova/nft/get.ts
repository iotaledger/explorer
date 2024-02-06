import { ServiceFactory } from "../../../factories/serviceFactory";
import { INftDetailsRequest } from "../../../models/api/nova/INftDetailsRequest";
import { INftDetailsResponse } from "../../../models/api/nova/INftDetailsResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NOVA } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { NovaApiService } from "../../../services/nova/novaApiService";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Get nft output details by Nft id
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

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }
    const novaApiService = ServiceFactory.get<NovaApiService>(`api-service-${networkConfig.network}`);
    return novaApiService.nftDetails(request.nftId);
}
