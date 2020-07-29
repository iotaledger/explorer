import { ServiceFactory } from "../../factories/serviceFactory";
import { ITrytesRetrieveRequest } from "../../models/api/ITrytesRetrieveRequest";
import { ITrytesRetrieveResponse } from "../../models/api/ITrytesRetrieveResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { NetworkService } from "../../services/networkService";
import { TangleHelper } from "../../utils/tangleHelper";
import { ValidationHelper } from "../../utils/validationHelper";

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
    ValidationHelper.oneOf(request.network, networkService.networks().map(n => n.network), "network");

    const networkConfig = networkService.get(request.network);

    const { trytes, milestoneIndexes } = await TangleHelper.getTrytes(networkConfig, request.hashes);

    return {
        trytes,
        milestoneIndexes
    };
}
