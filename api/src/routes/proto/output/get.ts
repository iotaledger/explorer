import { SingleNodeClient } from "@iota/protonet.js";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { IOutputRequest } from "../../../models/api/proto/IOutputRequest";
import { IOutputResponse } from "../../../models/api/proto/IOutputResponse";
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
    request: IOutputRequest
): Promise<IOutputResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.outputId, "outputId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== PROTO) {
        return {};
    }

    const client = new SingleNodeClient(networkConfig.provider);
    try {
        const output = await client.output(request.outputId);
        return { output };
    } catch (e) {
        return { error: e };
    }
}
