import { ServiceFactory } from "../../../factories/serviceFactory";
import { IAccountRequest } from "../../../models/api/nova/IAccountRequest";
import { IAccountResponse } from "../../../models/api/nova/IAccountResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NOVA } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { NovaApiService } from "../../../services/nova/novaApiService";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Get account output details by Account id
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(config: IConfiguration, request: IAccountRequest): Promise<IAccountResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.accountId, "accountId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }
    const novaApiService = ServiceFactory.get<NovaApiService>(`api-service-${networkConfig.network}`);
    return novaApiService.accountDetails(request.accountId);
}
