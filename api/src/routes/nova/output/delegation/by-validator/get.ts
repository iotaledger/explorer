import { ServiceFactory } from "../../../../../factories/serviceFactory";
import { IAddressDetailsRequest } from "../../../../../models/api/nova/IAddressDetailsRequest";
import { IDelegationByValidatorResponse } from "../../../../../models/api/nova/IDelegationByValidatorResponse";
import { IConfiguration } from "../../../../../models/configuration/IConfiguration";
import { NOVA } from "../../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../../services/networkService";
import { NovaApiService } from "../../../../../services/nova/novaApiService";
import { ValidationHelper } from "../../../../../utils/validationHelper";

/**
 * Fetch the delegation outputs by owning address.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: IAddressDetailsRequest): Promise<IDelegationByValidatorResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.address, "address");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    const novaApiService = ServiceFactory.get<NovaApiService>(`api-service-${networkConfig.network}`);
    return novaApiService.delegationOutputDetailsByValidator(request.address);
}
