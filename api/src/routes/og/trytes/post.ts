import { ServiceFactory } from "../../../factories/serviceFactory";
import { ITrytesRetrieveRequest } from "../../../models/api/og/ITrytesRetrieveRequest";
import { ITrytesRetrieveResponse } from "../../../models/api/og/ITrytesRetrieveResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { OG } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { ChrysalisTangleHelper } from "../../../utils/chrysalis/chrysalisTangleHelper";
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
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== OG) {
        return {};
    }

    const { trytes, milestoneIndexes } = await ChrysalisTangleHelper.getTrytes(networkConfig, request.hashes);

    return {
        trytes,
        milestoneIndexes
    };
}
