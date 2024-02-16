import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IFoundriesRequest } from "../../../../models/api/nova/foundry/IFoundriesRequest";
import { IFoundriesResponse } from "../../../../models/api/nova/foundry/IFoundriesResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { NOVA } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { NovaApiService } from "../../../../services/nova/novaApiService";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Get controlled Foundry output id by controller Account address
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(config: IConfiguration, request: IFoundriesRequest): Promise<IFoundriesResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.accountAddress, "accountAddress");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    const novaApiService = ServiceFactory.get<NovaApiService>(`api-service-${networkConfig.network}`);
    return novaApiService.accountFoundries(request.accountAddress);
}
