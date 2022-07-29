import { ServiceFactory } from "../../factories/serviceFactory";
import { INodeGetRequest } from "../../models/api/stardust/INodeGetRequest";
import { INodeGetResponse } from "../../models/api/stardust/INodeGetResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { STARDUST } from "../../models/db/protocolVersion";
import { INodeService } from "../../models/services/INodeService";
import { NetworkService } from "../../services/networkService";
import { ValidationHelper } from "../../utils/validationHelper";

/**
 * Get the node info of the network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: INodeGetRequest
): Promise<INodeGetResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();

    ValidationHelper.oneOf(request.network, networks, "network");
    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    const nodeService = ServiceFactory.get<INodeService>(`node-info-${request.network}`);

    return nodeService.getNodeAndTokenInfo();
}
