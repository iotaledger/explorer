import { ServiceFactory } from "../../../factories/serviceFactory";
import { IFoundryRequest } from "../../../models/api/nova/foundry/IFoundryRequest";
import { IFoundryResponse } from "../../../models/api/nova/foundry/IFoundryResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NOVA } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { NovaApiService } from "../../../services/nova/novaApiService";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Get foundry output details by Foundry id.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(config: IConfiguration, request: IFoundryRequest): Promise<IFoundryResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.foundryId, "foundryId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    const novaApiService = ServiceFactory.get<NovaApiService>(`api-service-${networkConfig.network}`);
    return novaApiService.foundryDetails(request.foundryId);
}
