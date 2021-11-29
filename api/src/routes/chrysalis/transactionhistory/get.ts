import { ServiceFactory } from "../../../factories/serviceFactory";
import { ITransactionsDetailsRequest } from "../../../models/api/chrysalis/ITransactionsDetailsRequest";
import { ITransactionsDetailsResponse } from "../../../models/api/chrysalis/ITransactionsDetailsResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NetworkService } from "../../../services/networkService";
import { TangleHelper } from "../../../utils/tangleHelper";
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
): Promise<ITransactionsDetailsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== "chrysalis") {
        return {};
    }
    // eslint-disable-next-line no-alert
    return {
        transactionHistory: await TangleHelper.transactionsDetails(networkConfig, request.address)
    };
}
