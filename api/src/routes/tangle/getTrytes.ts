import { IGetTrytesRequest } from "../../models/api/IGetTrytesRequest";
import { IGetTrytesResponse } from "../../models/api/IGetTrytesResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { TangleHelper } from "../../utils/tangleHelper";
import { ValidationHelper } from "../../utils/validationHelper";

/**
 * Get transactions for the requested hashes.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function getTrytes(
    config: IConfiguration,
    request: IGetTrytesRequest
): Promise<IGetTrytesResponse> {

    ValidationHelper.oneOf(request.network, config.networks.map(n => n.network), "network");
    const networkConfig = config.networks.find(n => n.network === request.network);

    const { trytes, confirmationStates } = await TangleHelper.getTrytes(networkConfig, request.hashes);

    return {
        success: true,
        message: "OK",
        trytes,
        confirmationStates
    };
}
