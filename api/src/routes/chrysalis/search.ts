import { ServiceFactory } from "../../factories/serviceFactory";
import { ISearchRequest } from "../../models/api/chrysalis/ISearchRequest";
import { ISearchResponse } from "../../models/api/chrysalis/ISearchResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { NetworkService } from "../../services/networkService";
import { TangleHelper } from "../../utils/tangleHelper";
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

    if (networkConfig.protocolVersion !== "chrysalis") {
        return {};
    }

    return TangleHelper.search(networkConfig, request.query, request.cursor);
}
