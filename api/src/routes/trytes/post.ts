import { ITrytesRetrieveRequest } from "../../models/api/ITrytesRetrieveRequest";
import { ITrytesRetrieveResponse } from "../../models/api/ITrytesRetrieveResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
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

    ValidationHelper.oneOf(request.network, config.networks.map(n => n.network), "network");
    const networkConfig = config.networks.find(n => n.network === request.network);

    const { trytes, milestoneIndexes } = await TangleHelper.getTrytes(networkConfig, request.hashes);

    return {
        success: true,
        message: "OK",
        trytes,
        milestoneIndexes
    };
}
