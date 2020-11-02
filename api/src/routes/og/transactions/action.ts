import { ServiceFactory } from "../../../factories/serviceFactory";
import { ITransactionActionRequest } from "../../../models/api/og/ITransactionActionRequest";
import { ITransactionActionResponse } from "../../../models/api/og/ITransactionActionResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NetworkService } from "../../../services/networkService";
import { TangleHelper } from "../../../utils/tangleHelper";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Perform an action on a hash.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function action(
    config: IConfiguration,
    request: ITransactionActionRequest
): Promise<ITransactionActionResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = (await networkService.networks()).map(n => n.network);
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.hash, "hash");

    const networkConfig = await networkService.get(request.network);

    if (networkConfig.protocolVersion !== "og") {
        return {};
    }

    let result;

    if (request.action === "isPromotable") {
        const canPromote = await TangleHelper.canPromoteTransaction(networkConfig, request.hash);
        result = canPromote ? "yes" : "no";
    } else if (request.action === "promote") {
        result = await TangleHelper.promoteTransaction(networkConfig, request.hash);
    } else if (request.action === "replay") {
        result = await TangleHelper.replayBundle(networkConfig, request.hash);
    }

    return {
        result
    };
}
