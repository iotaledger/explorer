import { SingleNodeClient } from "@iota/protonet.js";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { IConflictRequest } from "../../../models/api/proto/IConflictRequest";
import { IConflictWeightResponse } from "../../../models/api/proto/IConflictWeightResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { PROTO } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Fetch the conflict weight from the network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    _: IConfiguration,
    request: IConflictRequest
): Promise<IConflictWeightResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.conflictId, "conflictId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== PROTO) {
        return {};
    }

    const client = new SingleNodeClient(networkConfig.provider);
    try {
        const conflictWeight = await client.conflictWeight(request.conflictId);
        return { conflict: conflictWeight };
    } catch (e) {
        return { error: e };
    }
}
