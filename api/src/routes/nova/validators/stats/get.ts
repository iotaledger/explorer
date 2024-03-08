/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
    const committee = validatorService.committee;

    const totalPoolStake = validators.reduce((acc, cur) => BigInt(cur.poolStake) + acc, BigInt(0));
    const totalValidatorStake = committee ? BigInt(committee.totalValidatorStake) : undefined;

    return {
        totalPoolStake: totalPoolStake.toString(),
        totalValidatorStake: totalValidatorStake.toString(),
    };
}
