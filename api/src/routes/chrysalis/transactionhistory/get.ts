import { ServiceFactory } from "../../../factories/serviceFactory";
import { ITransactionsDetailsRequest } from "../../../models/api/ITransactionsDetailsRequest";
import { ITransactionsDetailsResponse } from "../../../models/api/ITransactionsDetailsResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NetworkService } from "../../../services/networkService";
import { ChrysalisTangleHelper } from "../../../utils/chrysalis/chrysalisTangleHelper";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Find the object from the network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: ITransactionsDetailsRequest
): Promise<{ transactionHistory: ITransactionsDetailsResponse } | unknown> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== "chrysalis") {
        return {};
    }
    return {
        transactionHistory: await ChrysalisTangleHelper.transactionsDetails(networkConfig, request)
    };
}
