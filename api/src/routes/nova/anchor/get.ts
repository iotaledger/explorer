import { ServiceFactory } from "../../../factories/serviceFactory";
import { IAnchorDetailsRequest } from "../../../models/api/nova/IAnchorDetailsRequest";
import { IAnchorDetailsResponse } from "../../../models/api/nova/IAnchorDetailsResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NOVA } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { NovaApiService } from "../../../services/nova/novaApiService";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Get anchor output details by Anchor id
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(config: IConfiguration, request: IAnchorDetailsRequest): Promise<IAnchorDetailsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.anchorId, "anchorId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }
    const novaApiService = ServiceFactory.get<NovaApiService>(`api-service-${networkConfig.network}`);
    return novaApiService.anchorDetails(request.anchorId);
}
