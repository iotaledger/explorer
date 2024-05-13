import { ServiceFactory } from "../../../../../factories/serviceFactory";
import { IAddressDetailsRequest } from "../../../../../models/api/nova/IAddressDetailsRequest";
import { IDelegationDetailsResponse } from "../../../../../models/api/nova/IDelegationDetailsResponse";
import { IConfiguration } from "../../../../../models/configuration/IConfiguration";
import { NOVA } from "../../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../../services/networkService";
import { NovaApiService } from "../../../../../services/nova/novaApiService";
import { ValidationHelper } from "../../../../../utils/validationHelper";

/**
 * Fetch the delegation outputs by owning address.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(config: IConfiguration, request: IAddressDetailsRequest): Promise<IDelegationDetailsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.address, "address");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    const novaApiService = ServiceFactory.get<NovaApiService>(`api-service-${networkConfig.network}`);
    return novaApiService.delegationOutputDetailsByAddress(request.address);
}
