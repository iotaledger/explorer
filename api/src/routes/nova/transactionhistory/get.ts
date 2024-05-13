import { ServiceFactory } from "../../../factories/serviceFactory";
import { ITransactionHistoryRequest } from "../../../models/api/nova/chronicle/ITransactionHistoryRequest";
import { ITransactionHistoryResponse } from "../../../models/api/nova/chronicle/ITransactionHistoryResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NOVA } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { ChronicleService } from "../../../services/nova/chronicleService";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Fetch the transaction history from chronicle nova.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(config: IConfiguration, request: ITransactionHistoryRequest): Promise<ITransactionHistoryResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    if (!networkConfig.permaNodeEndpoint) {
        return {};
    }

    const chronicleService = ServiceFactory.get<ChronicleService>(`chronicle-${networkConfig.network}`);

    return chronicleService.transactionHistory(request);
}
