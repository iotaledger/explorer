import { SingleNodeClient } from "@iota/protonet.js";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { ISlotRequest } from "../../../models/api/proto/ISlotRequest";
import { ISlotResponse } from "../../../models/api/proto/ISlotResponse";
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
    request: ISlotRequest
): Promise<ISlotResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.slotId, "slotId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== PROTO) {
        return {};
    }

    const client = new SingleNodeClient(networkConfig.provider);
    try {
        const slot = await client.slot(request.slotId);
        return { slot };
    } catch (e) {
        return { error: e };
    }
}

