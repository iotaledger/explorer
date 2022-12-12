import { SingleNodeClient } from "@iota/protonet.js";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { IBlockRequest } from "../../../models/api/proto/IBlockRequest";
import { IBlockResponse } from "../../../models/api/proto/IBlockResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { PROTO } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Fetch the block from the network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    _: IConfiguration,
    request: IBlockRequest
): Promise<IBlockResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.blockId, "blockId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== PROTO) {
        return {};
    }

    const client = new SingleNodeClient(networkConfig.provider);
    try {
        const block = await client.block(request.blockId);
        return { block };
    } catch (e) {
        return { error: e };
    }
}
