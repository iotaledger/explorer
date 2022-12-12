import { SingleNodeClient } from "@iota/protonet.js";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IOutputMetadataRequest } from "../../../../models/api/proto/IOutputMetadataRequest";
import { IOutputMetadataResponse } from "../../../../models/api/proto/IOutputMetadataResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { PROTO } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Fetch the block from the network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    _: IConfiguration,
    request: IOutputMetadataRequest
): Promise<IOutputMetadataResponse> {
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
        const meta = await client.outputMetadata(request.outputId);
        return { meta };
    } catch (e) {
        return { error: e };
    }
}
