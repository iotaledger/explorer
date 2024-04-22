import { ServiceFactory } from "../../../factories/serviceFactory";
import { INetworkBoundGetRequest } from "../../../models/api/INetworkBoundGetRequest";
import { IValidator, IValidatorsResponse } from "../../../models/api/nova/IValidatorsResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NOVA } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { ValidatorService } from "../../../services/nova/validatorService";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Fetch the current validators (cached).
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: INetworkBoundGetRequest): Promise<IValidatorsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    const validatorService = ServiceFactory.get<ValidatorService>(`validator-service-${networkConfig.network}`);

    const committeeAddresses = validatorService.committee?.committee.map((member) => member.address) ?? [];
    const validators: IValidator[] = validatorService?.validators.map((validator) => ({
        validator,
        inCommittee: committeeAddresses.includes(validator.address),
    }));

    return { validators };
}
