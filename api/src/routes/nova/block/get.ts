import { ServiceFactory } from "../../../factories/serviceFactory";
import { IBlockResponse } from "../../../models/api/nova/IBlockResponse";
import { IBlockRequest } from "../../../models/api/stardust/IBlockRequest";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NOVA } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { NovaApi } from "../../../services/nova/novaApi";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Fetch the block from the network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: IBlockRequest): Promise<IBlockResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.blockId, "blockId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    return NovaApi.block(networkConfig, request.blockId);
}
