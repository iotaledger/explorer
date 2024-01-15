import { ServiceFactory } from "../../factories/serviceFactory";
import { INetworkBoundGetRequest } from "../../models/api/INetworkBoundGetRequest";
import { INodeInfoResponse as INovaNodeInfoResponse } from "../../models/api/nova/INodeInfoResponse";
import { INodeInfoResponse as IStardustNodeInfoResponse } from "../../models/api/stardust/INodeInfoResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { NOVA, STARDUST } from "../../models/db/protocolVersion";
import { NetworkService } from "../../services/networkService";
import { NodeInfoService } from "../../services/stardust/nodeInfoService";
import { ValidationHelper } from "../../utils/validationHelper";

/**
 * Get the node info of the network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function info(
    _: IConfiguration,
    request: INetworkBoundGetRequest,
): Promise<IStardustNodeInfoResponse | INovaNodeInfoResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();

    ValidationHelper.oneOf(request.network, networks, "network");
    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST && networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    const nodeService = ServiceFactory.get<NodeInfoService>(`node-info-${request.network}`);

    return nodeService.getNodeInfo();
}
