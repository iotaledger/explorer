import { ServiceFactory } from "../../factories/serviceFactory";
import { ISearchRequest } from "../../models/api/nova/ISearchRequest";
import { ISearchResponse } from "../../models/api/nova/ISearchResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { NOVA } from "../../models/db/protocolVersion";
import { NetworkService } from "../../services/networkService";
import { NovaApiService } from "../../services/nova/novaApiService";
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

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    const novaApiService = ServiceFactory.get<NovaApiService>(`api-service-${networkConfig.network}`);
    return novaApiService.search(request.query);
}
