import { ServiceFactory } from "../../factories/serviceFactory";
import { ISearchRequest } from "../../models/api/stardust/ISearchRequest";
import { ISearchResponse } from "../../models/api/stardust/ISearchResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { STARDUST } from "../../models/db/protocolVersion";
import { NetworkService } from "../../services/networkService";
import { StardustApiService } from "../../services/stardust/stardustApiService";
import { ValidationHelper } from "../../utils/validationHelper";

/**
 * Find the object from the network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function search(_: IConfiguration, request: ISearchRequest): Promise<ISearchResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.query, "query");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    const stardustApiService = ServiceFactory.get<StardustApiService>(`api-service-${networkConfig.network}`);
    return stardustApiService.search(request.query);
}
