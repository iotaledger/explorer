import { ServiceFactory } from "../../../factories/serviceFactory";
import { ITransactionActionRequest } from "../../../models/api/legacy/ITransactionActionRequest";
import { ITransactionActionResponse } from "../../../models/api/legacy/ITransactionActionResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { LEGACY } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { LegacyTangleHelper } from "../../../utils/legacy/legacyTangleHelper";
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

    if (networkConfig.protocolVersion !== LEGACY) {
        return {};
    }

    let result;

    if (request.action === "isPromotable") {
        const canPromote = await LegacyTangleHelper.canPromoteTransaction(networkConfig, request.hash);
        result = canPromote ? "yes" : "no";
    } else if (request.action === "promote") {
        result = await LegacyTangleHelper.promoteTransaction(networkConfig, request.hash);
    } else if (request.action === "replay") {
        result = await LegacyTangleHelper.replayBundle(networkConfig, request.hash);
    }

    return {
        result
    };
}
