import { ServiceFactory } from "../../factories/serviceFactory";
import { IStatsGetRequest } from "../../models/api/IStatsGetRequest";
import { IStatsGetResponse } from "../../models/api/IStatsGetResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { NetworkService } from "../../services/networkService";
import { TransactionsService } from "../../services/transactionsService";
import { ValidationHelper } from "../../utils/validationHelper";

/**
 * Get stats for the requested network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: IStatsGetRequest
): Promise<IStatsGetResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = (await networkService.networks()).map(n => n.network);
    ValidationHelper.oneOf(request.network, networks, "network");

    const transactionService = ServiceFactory.get<TransactionsService>(`transactions-${request.network}`);

    return transactionService.getStats();
}
