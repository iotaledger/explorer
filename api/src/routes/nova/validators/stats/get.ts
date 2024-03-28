import { ServiceFactory } from "../../../../factories/serviceFactory";
import { INetworkBoundGetRequest } from "../../../../models/api/INetworkBoundGetRequest";
import { IValidatorStatsResponse } from "../../../../models/api/nova/IValidatorStatsResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { NOVA } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { ValidatorService } from "../../../../services/nova/validatorService";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Fetch the current validator stats (cached).
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: INetworkBoundGetRequest): Promise<IValidatorStatsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    const validatorService = ServiceFactory.get<ValidatorService>(`validator-service-${networkConfig.network}`);

    const validators = validatorService.validators;
    const committeeResponse = validatorService.committee;

    const totalValidators = validators.length;
    const committeeValidators = committeeResponse.committee.length;
    const totalPoolStake = validators.reduce((acc, cur) => BigInt(cur.poolStake) + acc, BigInt(0));
    const totalValidatorsStake = validators.reduce((acc, cur) => BigInt(cur.validatorStake) + acc, BigInt(0));

    const committeeValidatorsPoolStake = committeeResponse ? BigInt(committeeResponse.totalStake) : undefined;
    const totalCommitteeStake = committeeResponse ? BigInt(committeeResponse.totalValidatorStake) : undefined;

    return {
        totalValidators,
        committeeValidators,
        totalValidatorsPoolStake: totalPoolStake.toString(),
        totalValidatorsStake: totalValidatorsStake.toString(),
        committeeValidatorsPoolStake: committeeValidatorsPoolStake?.toString(),
        totalCommitteeStake: totalCommitteeStake?.toString(),
    };
}
