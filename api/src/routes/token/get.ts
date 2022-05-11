import { ServiceFactory } from "../../factories/serviceFactory";
import { IBaseTokenGetRequest } from "../../models/api/stardust/IBaseTokenGetRequest";
import { IBaseTokenGetResponse } from "../../models/api/stardust/IBaseTokenGetResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { STARDUST } from "../../models/db/protocolVersion";
import { IBaseTokenService } from "../../models/services/IBaseTokenService";
import { NetworkService } from "../../services/networkService";
import { ValidationHelper } from "../../utils/validationHelper";

/**
 * Get the base token info of the network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: IBaseTokenGetRequest
): Promise<IBaseTokenGetResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();

    ValidationHelper.oneOf(request.network, networks, "network");
    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    const baseTokenService = ServiceFactory.get<IBaseTokenService>(`base-token-${request.network}`);

    return baseTokenService.getBaseTokenInfo();
}
