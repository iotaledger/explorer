import { ServiceFactory } from "../../../factories/serviceFactory";
import { ITransactionActionRequest } from "../../../models/api/og/ITransactionActionRequest";
import { ITransactionActionResponse } from "../../../models/api/og/ITransactionActionResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { OG } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { ChrysalisTangleHelper } from "../../../utils/chrysalis/chrysalisTangleHelper";
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
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.hash, "hash");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== OG) {
        return {};
    }

    let result;

    if (request.action === "isPromotable") {
        const canPromote = await ChrysalisTangleHelper.canPromoteTransaction(networkConfig, request.hash);
        result = canPromote ? "yes" : "no";
    } else if (request.action === "promote") {
        result = await ChrysalisTangleHelper.promoteTransaction(networkConfig, request.hash);
    } else if (request.action === "replay") {
        result = await ChrysalisTangleHelper.replayBundle(networkConfig, request.hash);
    }

    return {
        result
    };
}
