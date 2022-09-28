import { ServiceFactory } from "../../../factories/serviceFactory";
import { ITransactionHistoryRequest } from "../../../models/api/stardust/ITransactionHistoryRequest";
import { ITransactionHistoryResponse } from "../../../models/api/stardust/ITransactionHistoryResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { ChronicleService } from "../../../services/stardust/chronicleService";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Fetch the transaction history from chronicle stardust.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: ITransactionHistoryRequest
): Promise<{ transactionHistory: ITransactionHistoryResponse } | unknown> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    if (!networkConfig.permaNodeEndpoint) {
        return {};
    }

    const chronicleService = ServiceFactory.get<ChronicleService>(
        `chronicle-${networkConfig.network}`
    );

    return chronicleService.transactionHistory(request);
}

