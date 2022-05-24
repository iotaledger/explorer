import { ServiceFactory } from "../../factories/serviceFactory";
import { ISearchRequest } from "../../models/api/stardust/ISearchRequest";
import { ISearchResponse } from "../../models/api/stardust/ISearchResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { STARDUST } from "../../models/db/protocolVersion";
import { NetworkService } from "../../services/networkService";
import { StardustTangleHelper } from "../../utils/stardust/stardustTangleHelper";
import { ValidationHelper } from "../../utils/validationHelper";

/**
 * Find the object from the network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function search(
    config: IConfiguration,
    request: ISearchRequest
): Promise<ISearchResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.query, "query");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    return StardustTangleHelper.search(networkConfig, request.query);
}
