import { ServiceFactory } from "../../../factories/serviceFactory";
import { ITrytesRetrieveRequest } from "../../../models/api/og/ITrytesRetrieveRequest";
import { ITrytesRetrieveResponse } from "../../../models/api/og/ITrytesRetrieveResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NetworkService } from "../../../services/networkService";
import { TangleHelper } from "../../../utils/tangleHelper";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Get transactions for the requested hashes.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function post(
    config: IConfiguration,
    request: ITrytesRetrieveRequest
): Promise<ITrytesRetrieveResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = (await networkService.networks()).map(n => n.network);
    ValidationHelper.oneOf(request.network, networks, "network");

    const networkConfig = await networkService.get(request.network);

    if (networkConfig.protocolVersion !== "og") {
        return {};
    }

    const { trytes, milestoneIndexes } = await TangleHelper.getTrytes(networkConfig, request.hashes);

    return {
        trytes,
        milestoneIndexes
    };
}
